"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDateShort, getLocalizedName } from "@/lib/utils";
import { Match } from "@/types";
import { useTranslations } from "@/lib/i18n";
import ArbitreLink from "./ArbitreLink";
import VotedBadge from "./VotedBadge";

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

interface MatchCardClientProps {
  match: Match;
}

export default function MatchCardClient({ match }: MatchCardClientProps) {
  const { t, locale } = useTranslations();
  const dateLabel = match.date ? formatDateShort(match.date, locale) : t("common.datePending");
  const journeeLabel = match.journee?.numero;
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
      className="block rounded-2xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between text-xs uppercase text-gray-400 mb-2">
        <span>
          {journeeLabel ? `${t("common.matchday")} ${journeeLabel}` : t("common.matchday")}
        </span>
        <div className="flex items-center gap-2">
          <span>{dateLabel}</span>
          <VotedBadge matchId={match.id} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <TeamDisplay team={match.equipe_home} locale={locale} />
        <div className="text-center">
          {hasScore ? (
            <>
              <p className="text-lg font-semibold text-gray-900">
                {match.score_home} - {match.score_away}
              </p>
              <p className="text-xs text-gray-500">{t("common.finished")}</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-400">VS</p>
              <p className="text-xs text-gray-500">{t("common.upcoming")}</p>
            </>
          )}
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

