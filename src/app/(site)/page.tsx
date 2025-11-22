import MatchCard from "@/components/MatchCard";
import { Match } from "@/types";
import { getServerLocale, translate } from "@/lib/i18nServer";
import { fetchNextJourneeMatches, fetchFederationsWithLeagues } from "@/lib/dataAccess";
import { getActiveLeagueId } from "@/lib/leagueSelection";
import { getLocalizedName } from "@/lib/utils";
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
      {/* Logo ArbiNote */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
          ArbiNote
        </h1>
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

      {!error && matches.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
