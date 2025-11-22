import MatchCard from "@/components/MatchCard";
import { Match } from "@/types";
import { getServerLocale, translate } from "@/lib/i18nServer";
import { fetchNextJourneeMatches, fetchFederationsWithLeagues } from "@/lib/dataAccess";
import { getActiveLeagueId } from "@/lib/leagueSelection";
import { getLocalizedName, formatDateOnly } from "@/lib/utils";
import Image from "next/image";

export default async function Home() {
  const locale = await getServerLocale();
  const t = (key: string, params?: Record<string, string | number>) => translate(key, locale, params);
  const leagueId = await getActiveLeagueId();
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    const result = await fetchNextJourneeMatches(new Date(), leagueId ?? undefined);
    matches = result ? (result.matches as Match[]) : [];

    // Trier les matches par date et heure croissante
    matches.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      const dateA = typeof a.date === "string" ? new Date(a.date) : a.date;
      const dateB = typeof b.date === "string" ? new Date(b.date) : b.date;
      return dateA.getTime() - dateB.getTime();
    });
  } catch (err) {
    error = err instanceof Error ? err.message : t("common.error");
  }

  // Récupérer la fédération et ligue active
  const federations = await fetchFederationsWithLeagues();
  let activeLeague = null;
  let activeFederation = null;

  if (leagueId) {
    for (const fed of federations) {
      const league = fed.leagues.find((l: any) => l.id === leagueId);
      if (league) {
        activeLeague = league;
        activeFederation = fed;
        break;
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Logo ARBINOTE */}
      <div className="text-center mb-6 sm:mb-8">
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t("home.subtitle") ||
            "Plateforme de référence pour noter et comparer les arbitres de Ligue 1 tunisienne : calendrier, classements et votes en direct."}
        </p>
      </div>

      {/* Logos de la fédération et ligue */}
      {activeFederation && activeLeague && (
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {activeFederation.logo_url && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <Image
                  src={activeFederation.logo_url}
                  alt={getLocalizedName(locale, {
                    defaultValue: activeFederation.nom,
                    fr: activeFederation.nom,
                    en: activeFederation.nom_en ?? undefined,
                    ar: activeFederation.nom_ar ?? undefined,
                  })}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                  className="object-contain"
                />
              </div>
            )}
            {activeLeague.logo_url && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <Image
                  src={activeLeague.logo_url}
                  alt={getLocalizedName(locale, {
                    defaultValue: activeLeague.nom,
                    fr: activeLeague.nom,
                    en: activeLeague.nom_en ?? undefined,
                    ar: activeLeague.nom_ar ?? undefined,
                  })}
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 112px"
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Titre des matchs */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">{t("matches.list.title")}</h2>

      {error && (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4 sm:mb-6">
          <p className="text-red-800 dark:text-red-200 text-sm sm:text-base">
            {t("common.error")}: {error}
          </p>
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 mt-2">{t("common.errorConfig")}</p>
        </div>
      )}

      {!error && matches.length === 0 && (
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">{t("common.emptyMatchesTitle")}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">{t("common.emptyMatchesDescription")}</p>
        </div>
      )}

      {!error &&
        matches.length > 0 &&
        (() => {
          // Grouper les matches par date
          const matchesByDate = matches.reduce((acc, match) => {
            if (!match.date) {
              const key = "unknown";
              if (!acc[key]) acc[key] = [];
              acc[key].push(match);
              return acc;
            }

            const matchDate = typeof match.date === "string" ? new Date(match.date) : match.date;
            const dateKey = formatDateOnly(matchDate, locale);

            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(match);
            return acc;
          }, {} as Record<string, Match[]>);

          // Trier les dates (ordre croissant)
          const sortedDates = Object.keys(matchesByDate).sort((a, b) => {
            if (a === "unknown") return 1;
            if (b === "unknown") return -1;

            // Extraire la première date de chaque groupe pour le tri
            const firstMatchA = matchesByDate[a][0];
            const firstMatchB = matchesByDate[b][0];

            if (!firstMatchA?.date || !firstMatchB?.date) {
              if (!firstMatchA?.date) return 1;
              if (!firstMatchB?.date) return -1;
              return 0;
            }

            const dateA = typeof firstMatchA.date === "string" ? new Date(firstMatchA.date) : firstMatchA.date;
            const dateB = typeof firstMatchB.date === "string" ? new Date(firstMatchB.date) : firstMatchB.date;
            return dateA.getTime() - dateB.getTime();
          });

          return (
            <div className="space-y-6 sm:space-y-8">
              {sortedDates.map((dateKey) => {
                const dateMatches = matchesByDate[dateKey];
                return (
                  <div key={dateKey} className="space-y-3 sm:space-y-4">
                    {dateKey !== "unknown" && (
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {dateKey}
                      </h3>
                    )}
                    {dateMatches
                      .sort((a, b) => {
                        // Trier par heure dans chaque groupe de date
                        if (!a.date && !b.date) return 0;
                        if (!a.date) return 1;
                        if (!b.date) return -1;
                        const dateA = typeof a.date === "string" ? new Date(a.date) : a.date;
                        const dateB = typeof b.date === "string" ? new Date(b.date) : b.date;
                        return dateA.getTime() - dateB.getTime();
                      })
                      .map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                  </div>
                );
              })}
            </div>
          );
        })()}
    </div>
  );
}
