"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDate, getLocalizedName } from "@/lib/utils";
import { Match } from "@/types";
import { useTranslations } from "@/lib/i18n";
import ArbitreLink from "./ArbitreLink";
import VotedBadge from "./VotedBadge";
import LiveMatchBadge from "./LiveMatchBadge";

function TeamDisplay({ team, align = "start", locale }: { team: Match["equipe_home"]; align?: "start" | "end"; locale: string }) {
  const alignmentClasses = align === "end" ? "text-right flex-row-reverse sm:flex-row sm:text-right" : "text-left";
  const displayName = getLocalizedName(locale, {
    defaultValue: team.nom,
    fr: team.nom,
    en: team.nom_en ?? team.nom,
    ar: team.nom_ar ?? team.nom,
  });
  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${alignmentClasses} min-w-0`}>
      {team.logo_url ? (
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <Image src={team.logo_url} alt={`Logo ${displayName}`} fill sizes="(max-width: 640px) 32px, 40px" className="object-contain" />
        </div>
      ) : (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0">
          {team.nom
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
      )}
      <span className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm truncate">{displayName}</span>
    </div>
  );
}

interface MatchCardClientProps {
  match: Match;
}

export default function MatchCardClient({ match }: MatchCardClientProps) {
  const { t, locale } = useTranslations();
  const dateLabel = match.date ? formatDate(match.date, locale) : t("common.datePending");
  const journeeLabel = match.journee?.numero;
  
  // Vérifier si le match est en cours pour mettre le score en rouge
  const isMatchLive = match.date && (() => {
    try {
      const matchDate = typeof match.date === "string" ? new Date(match.date) : match.date;
      const now = new Date();
      if (matchDate > now) return false;
      const diffMs = now.getTime() - matchDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes >= 0 && diffMinutes <= 93; // Match en cours si moins de 93 min
    } catch {
      return false;
    }
  })();
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
  const homeLabel = match.equipe_home.abbr || homeName;
  const awayLabel = match.equipe_away.abbr || awayName;
  const homeCity =
    match.equipe_home.city ||
    match.equipe_home.city_ar ||
    match.equipe_home.city_en
      ? getLocalizedName(locale, {
          defaultValue: match.equipe_home.city ?? match.equipe_home.city_en ?? match.equipe_home.city_ar ?? "",
          fr: match.equipe_home.city ?? undefined,
          en: match.equipe_home.city_en ?? undefined,
          ar: match.equipe_home.city_ar ?? undefined,
        })
      : null;
  const awayCity =
    match.equipe_away.city ||
    match.equipe_away.city_ar ||
    match.equipe_away.city_en
      ? getLocalizedName(locale, {
          defaultValue: match.equipe_away.city ?? match.equipe_away.city_en ?? match.equipe_away.city_ar ?? "",
          fr: match.equipe_away.city ?? undefined,
          en: match.equipe_away.city_en ?? undefined,
          ar: match.equipe_away.city_ar ?? undefined,
        })
      : null;
  const refereeName = match.arbitre
    ? getLocalizedName(locale, {
        defaultValue: match.arbitre.nom,
        fr: match.arbitre.nom,
        en: match.arbitre.nom_en ?? undefined,
        ar: match.arbitre.nom_ar ?? undefined,
      })
    : null;
  const refereeCategory =
    match.arbitre && (match.arbitre.categorie || match.arbitre.categorie_ar)
      ? getLocalizedName(locale, {
          defaultValue: match.arbitre.categorie ?? match.arbitre.categorie_ar ?? "",
          fr: match.arbitre.categorie ?? undefined,
          en: match.arbitre.categorie ?? undefined,
          ar: match.arbitre.categorie_ar ?? undefined,
        })
      : null;

  const hasScore =
    match.score_home !== null &&
    match.score_home !== undefined &&
    match.score_away !== null &&
    match.score_away !== undefined;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-3 sm:p-4 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md transition"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs uppercase text-gray-400 dark:text-gray-500 mb-2 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span>
            {journeeLabel ? `${t("common.matchday")} ${journeeLabel}` : t("common.matchday")}
          </span>
          <span>{dateLabel}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <VotedBadge matchId={match.id} />
          <LiveMatchBadge matchDate={match.date} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-0">
        <div className="flex-1 min-w-0">
          <TeamDisplay team={match.equipe_home} locale={locale} />
        </div>
        <div className="text-center flex-shrink-0 px-1 sm:px-2">
          {hasScore ? (
            <>
              <p className={`text-base sm:text-lg font-semibold ${isMatchLive ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                {match.score_home} - {match.score_away}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("common.finished")}</p>
            </>
          ) : (
            <>
              <p className="text-base sm:text-lg font-semibold text-gray-400">VS</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("common.upcoming")}</p>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0 flex justify-end">
          <TeamDisplay team={match.equipe_away} align="end" locale={locale} />
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
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

