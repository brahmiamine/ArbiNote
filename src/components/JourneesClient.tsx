"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import MatchCardClient from "./MatchCardClient";
import { useTranslations } from "@/lib/i18n";
import { formatDateOnly } from "@/lib/utils";
import { Match } from "@/types";

interface JourneeWithMatches {
  id: string;
  numero: number;
  date_journee?: string | null;
  dateLabel?: string | null;
  matches: Match[];
}

interface JourneesClientProps {
  journees: JourneeWithMatches[];
  defaultJourneeId: string | null;
  locale: string;
}

export default function JourneesClient({ journees, defaultJourneeId, locale }: JourneesClientProps) {
  const { t } = useTranslations();
  const [selectedJourneeId, setSelectedJourneeId] = useState<string | null>(defaultJourneeId);

  const selectedJournee = useMemo(() => {
    if (!selectedJourneeId) return null;
    return journees.find((j) => j.id === selectedJourneeId) || null;
  }, [selectedJourneeId, journees]);

  // Trier les journées pour le dropdown (par date croissante, puis par numéro)
  const sortedJournees = useMemo(() => {
    return [...journees].sort((a, b) => {
      if (a.date_journee && b.date_journee) {
        return new Date(a.date_journee).getTime() - new Date(b.date_journee).getTime();
      }
      if (a.date_journee) return -1;
      if (b.date_journee) return 1;
      return a.numero - b.numero;
    });
  }, [journees]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("journees.title")}</h1>
      </div>

      {/* Dropdown pour sélectionner la journée */}
      <div className="space-y-2">
        <label htmlFor="journee-select" className="block text-sm font-medium text-gray-600">
          {t("journees.selectJournee")}
        </label>
        <select
          id="journee-select"
          value={selectedJourneeId || ""}
          onChange={(e) => setSelectedJourneeId(e.target.value || null)}
          className="w-full px-4 py-2 border border-slate-200 rounded-2xl bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-200 transition"
        >
          {sortedJournees.map((journee) => {
            const dateOnly = journee.date_journee ? formatDateOnly(journee.date_journee, locale) : null;
            return (
              <option key={journee.id} value={journee.id}>
                {t("common.matchday")} {journee.numero}
                {dateOnly ? ` - ${dateOnly}` : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* Affichage des matchs de la journée sélectionnée */}
      {selectedJournee ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {t("common.matchday")} {selectedJournee.numero}
              </h2>
              {selectedJournee.dateLabel && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedJournee.dateLabel}
                </p>
              )}
            </div>
            <Link
              href={`/journees/${selectedJournee.id}`}
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
            >
              {t("journees.viewDetails")}
            </Link>
          </div>

          {selectedJournee.matches.length > 0 ? (
            <div className="space-y-4">
              {selectedJournee.matches.map((match) => (
                <MatchCardClient key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">{t("journee.noMatches")}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">{t("journees.noJourneeSelected")}</p>
        </div>
      )}
    </div>
  );
}

