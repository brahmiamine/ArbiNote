"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import MatchCardClient from "./MatchCardClient";
import { useTranslations } from "@/lib/i18n";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { Match, Vote } from "@/types";
import { formatDateOnly } from "@/lib/utils";

interface VoteWithMatch extends Vote {
  match?: Match & {
    journee?: {
      id: string;
      numero: number;
      date_journee?: string | null;
      saison?: {
        id: string;
        nom: string;
      };
    };
  };
}

export default function MesVotesClient() {
  const { t, locale } = useTranslations();
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [votes, setVotes] = useState<VoteWithMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer le fingerprint
  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => {
        setFingerprint(result.visitorId);
      })
      .catch(() => {
        setFingerprint(null);
      });
  }, []);

  // Récupérer les votes de l'utilisateur
  useEffect(() => {
    if (!fingerprint) return;

    const fetchVotes = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/votes/user/${fingerprint}`);
        if (response.ok) {
          const data = await response.json();
          setVotes(data);
        } else {
          console.error("Failed to fetch votes");
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [fingerprint]);

  // Grouper les votes par journée
  const votesByJournee = useMemo(() => {
    const grouped = new Map<string, VoteWithMatch[]>();

    votes.forEach((vote) => {
      if (!vote.match?.journee) return;

      const journeeId = vote.match.journee.id;
      const journeeNumero = vote.match.journee.numero;
      const journeeDate = vote.match.journee.date_journee;
      const saisonNom = vote.match.journee.saison?.nom || "";

      const key = `${journeeId}-${journeeNumero}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(vote);
    });

    // Convertir en tableau et trier par date de journée (plus récentes en premier)
    return Array.from(grouped.entries())
      .map(([key, votes]) => {
        const firstVote = votes[0];
        const journee = firstVote.match?.journee;
        return {
          key,
          journeeId: journee?.id || "",
          journeeNumero: journee?.numero || 0,
          journeeDate: journee?.date_journee || null,
          saisonNom: journee?.saison?.nom || "",
          matches: votes.map((v) => v.match!).filter(Boolean),
        };
      })
      .sort((a, b) => {
        if (a.journeeDate && b.journeeDate) {
          return new Date(b.journeeDate).getTime() - new Date(a.journeeDate).getTime();
        }
        if (a.journeeDate) return -1;
        if (b.journeeDate) return 1;
        return b.journeeNumero - a.journeeNumero;
      });
  }, [votes]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">{t("myVotes.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!fingerprint) {
    return (
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">{t("myVotes.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("myVotes.noFingerprint")}</p>
      </div>
    );
  }

  if (votesByJournee.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">{t("myVotes.title")}</h1>
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">{t("myVotes.noVotes")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-10 space-y-6 sm:space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t("myVotes.title")}</h1>

      {votesByJournee.map((group) => (
        <div key={group.key} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-700 pb-2 gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                {t("common.matchday")} {group.journeeNumero}
              </h2>

              {group.journeeDate && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{formatDateOnly(group.journeeDate, locale)}</p>
              )}
            </div>
            <Link
              href={`/journees/${group.journeeId}`}
              className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium hover:underline flex-shrink-0"
            >
              {t("journees.viewDetails")}
            </Link>
          </div>

          <div className="space-y-4">
            {group.matches.map((match) => (
              <MatchCardClient key={match.id} match={match} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
