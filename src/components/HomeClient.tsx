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
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      <header className="text-center space-y-3">
        {/* Logos de la fédération et de la ligue */}
        {activeLeague && (
          <div className="flex items-center justify-center gap-4 mb-4">
            {activeLeague.federation.logo_url && (
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
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
                        "placeholder w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 font-semibold";
                      placeholder.textContent = activeLeague.federation.code || "—";
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
            )}
            {activeLeague.league.logo_url && (
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
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
                        "placeholder w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 font-semibold";
                      placeholder.textContent = activeLeague.league.nom.charAt(0).toUpperCase() || "—";
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
        <br />
        <p className="text-lg text-gray-600">{t("home.subtitle")}</p>
      </header>

      <section className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">{t("home.upcoming.badge")}</p>
              <h2 className="text-2xl font-semibold text-gray-900">
                {upcoming ? t("home.upcoming.title", { numero: upcoming.journee.numero.toString() }) : t("home.previous.title")}
              </h2>
              {upcoming?.journee.date_journee && <p className="text-sm text-gray-500">{formatDate(upcoming.journee.date_journee, locale)}</p>}
            </div>
            {upcoming && (
              <Link href={`/journees/${upcoming.journee.id}`} className="text-blue-600 text-sm font-medium hover:underline">
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

  return (
    <Link href={`/matches/${match.id}`} className="block rounded-2xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-md transition">
      <div className="flex items-center justify-between text-xs uppercase text-gray-400 mb-2">
        <span>
          {t("common.matchday")} {journeeNumber}
        </span>
        <span>{kickoff}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <TeamDisplay team={match.equipe_home} locale={locale} />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">
            {hasScore ? `${match.score_home} - ${match.score_away}` : t("home.upcoming.notPlayed")}
          </p>
          <p className="text-xs text-gray-500">{match.date ? t("home.upcoming.notPlayed") : t("common.datePending")}</p>
        </div>
        <TeamDisplay team={match.equipe_away} align="end" locale={locale} />
      </div>
      <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
        <span>{t("common.referee")}</span>
        {match.arbitre ? (
          <ArbitreLink arbitreId={match.arbitre.id} photoUrl={null} name={match.arbitre.nom} category={null} showPhoto={false} />
        ) : (
          <span className="font-medium text-gray-700">{t("common.noRefereeAssigned")}</span>
        )}
      </div>
    </Link>
  );
}

function TeamDisplay({ team, align = "start", locale }: { team: Match["equipe_home"]; align?: "start" | "end"; locale: string }) {
  const alignmentClasses = align === "end" ? "text-right flex-row-reverse" : "text-left";
  const displayName = getLocalizedName(locale, {
    defaultValue: team.nom,
    fr: team.nom,
    en: team.nom_en ?? team.nom,
    ar: team.nom_ar ?? team.nom,
  });
  return (
    <div className={`flex items-center gap-2 ${alignmentClasses}`}>
      {team.logo_url ? (
        <div className="relative w-10 h-10">
          <Image src={team.logo_url} alt={`Logo ${displayName}`} fill sizes="40px" className="object-contain" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
          {team.nom
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <span className="font-semibold text-gray-900">{displayName}</span>
    </div>
  );
}
