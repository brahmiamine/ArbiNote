"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, getLocalizedName } from "@/lib/utils";
import { Journee, Match } from "@/types";
import { useTranslations } from "@/lib/i18n";
import ArbitreLink from "./ArbitreLink";
import { useFederationContext } from "./FederationContext";

interface HomeClientProps {
  upcoming?: {
    journee: Journee;
    matches: Match[];
  };
}

export default function HomeClient({ upcoming }: HomeClientProps) {
  const { t, locale } = useTranslations();
  const { federations, activeLeagueId } = useFederationContext();

  // Trouver la ligue active et sa fédération
  const activeLeague = useMemo(() => {
    if (!activeLeagueId) return null;
    for (const fed of federations) {
      const league = fed.leagues.find((l) => l.id === activeLeagueId);
      if (league) {
        return { federation: fed, league };
      }
    }
    return null;
  }, [federations, activeLeagueId]);

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-10 space-y-6 sm:space-y-12">
      <header className="text-center space-y-3">
        {/* Logos de la fédération et de la ligue */}
        {activeLeague && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            {activeLeague.federation.logo_url && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <img
                  src={activeLeague.federation.logo_url}
                  alt={activeLeague.federation.nom}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".placeholder")) {
                      const placeholder = document.createElement("div");
                      placeholder.className =
                        "placeholder w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 font-semibold";
                      placeholder.textContent = activeLeague.federation.code || "—";
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
            )}
            {activeLeague.league.logo_url && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <img
                  src={activeLeague.league.logo_url}
                  alt={activeLeague.league.nom}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".placeholder")) {
                      const placeholder = document.createElement("div");
                      placeholder.className =
                        "placeholder w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 font-semibold";
                      placeholder.textContent = activeLeague.league.nom.charAt(0).toUpperCase() || "—";
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">{t("home.subtitle")}</p>
      </header>

      <section className="w-full max-w-4xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-3 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">{t("home.upcoming.badge")}</p>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate">
                {upcoming ? t("home.upcoming.title", { numero: upcoming.journee.numero.toString() }) : t("home.previous.title")}
              </h2>
              {upcoming?.journee.date_journee && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDate(upcoming.journee.date_journee, locale)}</p>
              )}
            </div>
            {upcoming && (
              <Link
                href={`/journees/${upcoming.journee.id}`}
                className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium hover:underline shrink-0"
              >
                {t("home.upcoming.cta")}
              </Link>
            )}
          </div>
          {upcoming && upcoming.matches.length > 0 ? (
            <div className="space-y-3">
              {upcoming.matches.slice(0, 4).map((match) => (
                <MatchCard key={match.id} match={match} journeeNumber={upcoming.journee.numero} locale={locale} t={t} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("common.emptyMatchesDescription")}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function MatchCard({
  match,
  journeeNumber,
  locale,
  t,
}: {
  match: Match;
  journeeNumber: number;
  locale: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const kickoff = match.date ? formatDate(match.date, locale) : t("common.datePending");
  const hasScore = match.score_home !== null && match.score_home !== undefined && match.score_away !== null && match.score_away !== undefined;
  const homeName = getLocalizedName(locale, {
    defaultValue: match.equipe_home.nom,
    fr: match.equipe_home.nom,
    en: match.equipe_home.nom_en ?? undefined,
    ar: match.equipe_home.nom_ar ?? undefined,
  });
  const awayName = getLocalizedName(locale, {
    defaultValue: match.equipe_away.nom,
    fr: match.equipe_away.nom,
    en: match.equipe_away.nom_en ?? undefined,
    ar: match.equipe_away.nom_ar ?? undefined,
  });

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block w-full rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-3 sm:p-4 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition"
    >
      {/* Header avec date et journée */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs uppercase text-gray-400 dark:text-gray-500 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-100 dark:border-gray-700 gap-1">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span>
            {t("common.matchday")} {journeeNumber}
          </span>
          <span>{kickoff}</span>
        </div>
      </div>

      {/* Équipes et score */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        {/* Équipe domicile */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0 order-1 sm:order-1">
          {match.equipe_home.logo_url ? (
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
              <Image
                src={match.equipe_home.logo_url}
                alt={`Logo ${homeName}`}
                fill
                sizes="(max-width: 640px) 40px, (max-width: 768px) 56px, 64px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-400 font-bold text-xs sm:text-base md:text-lg">
                {(match.equipe_home.abbr || homeName).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm sm:text-base md:text-xl text-gray-900 dark:text-white break-words line-clamp-2">{homeName}</div>
          </div>
        </div>

        {/* Score */}
        <div className="mx-0 sm:mx-4 shrink-0 self-center order-2 sm:order-2">
          {hasScore ? (
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {match.score_home} - {match.score_away}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("matchCard.score")}</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-400 dark:text-gray-500 mb-1">VS</div>
              <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">{t("common.datePending")}</div>
            </div>
          )}
        </div>

        {/* Équipe extérieure */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 justify-end text-right min-w-0 order-3 sm:order-3 sm:flex-row-reverse">
          <div className="flex-1 min-w-0 text-right sm:text-left">
            <div className="font-bold text-sm sm:text-base md:text-xl text-gray-900 dark:text-white break-words line-clamp-2">{awayName}</div>
          </div>
          {match.equipe_away.logo_url ? (
            <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
              <Image
                src={match.equipe_away.logo_url}
                alt={`Logo ${awayName}`}
                fill
                sizes="(max-width: 640px) 40px, (max-width: 768px) 56px, 64px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-400 font-bold text-xs sm:text-base md:text-lg">
                {(match.equipe_away.abbr || awayName).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer avec arbitre */}
      <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span>{t("common.referee")}</span>
        </div>
        {match.arbitre ? (
          <ArbitreLink arbitreId={match.arbitre.id} photoUrl={null} name={match.arbitre.nom} category={null} showPhoto={false} />
        ) : (
          <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.noRefereeAssigned")}</span>
        )}
      </div>
    </Link>
  );
}
