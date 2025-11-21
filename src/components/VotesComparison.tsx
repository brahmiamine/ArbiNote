"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { CritereDefinition } from "@/types";
import { getLocalizedName } from "@/lib/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface VotesComparisonProps {
  matchId: string;
  criteresDefs: CritereDefinition[];
}

interface Vote {
  id: string;
  criteres: Record<string, number>;
  note_globale: number;
  device_fingerprint?: string | null;
  created_at?: string;
}

interface ComparisonStats {
  moyenne: number;
  min: number;
  max: number;
  count: number;
}

export default function VotesComparison({
  matchId,
  criteresDefs,
}: VotesComparisonProps) {
  const { t, locale } = useTranslations();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(true);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => {
        if (!cancelled) {
          setFingerprint(result.visitorId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFingerprint(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const [allVotesResponse, userVoteResponse] = await Promise.all([
          fetch(`/api/votes/${matchId}`),
          fingerprint
            ? fetch(`/api/votes/${matchId}/user?fingerprint=${fingerprint}`)
            : Promise.resolve(null),
        ]);

        if (allVotesResponse.ok) {
          const allVotes = await allVotesResponse.json();
          setVotes(allVotes);
        }

        if (userVoteResponse && userVoteResponse.ok) {
          const userVoteData = await userVoteResponse.json();
          setUserVote(userVoteData);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (fingerprint !== null) {
      fetchVotes();
    }
  }, [matchId, fingerprint]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">{t("common.loading")}</p>
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {t("matchDetail.comparison")}
        </h2>
        <p className="text-gray-600">{t("matchDetail.noOtherVotes")}</p>
      </div>
    );
  }

  // Calculer les statistiques pour chaque critère
  const calculateStats = (critereId: string): ComparisonStats => {
    const values = votes
      .map((v) => v.criteres[critereId])
      .filter((v) => typeof v === "number" && v > 0);

    if (values.length === 0) {
      return { moyenne: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const moyenne = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { moyenne, min, max, count: values.length };
  };

  // Calculer la moyenne globale
  const globalNoteStats = (() => {
    const values = votes
      .map((v) => v.note_globale)
      .filter((v) => typeof v === "number" && v > 0);

    if (values.length === 0) {
      return { moyenne: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const moyenne = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { moyenne, min, max, count: values.length };
  })();

  const groupedByCategory = criteresDefs.reduce<Record<string, CritereDefinition[]>>(
    (acc, critere) => {
      acc[critere.categorie] = acc[critere.categorie] || [];
      acc[critere.categorie].push(critere);
      return acc;
    },
    {}
  );

  // Séparer les critères arbitre et arbitrage
  const arbitreCriteres = criteresDefs.filter((c) => c.categorie === "arbitre");
  const arbitrageCriteres = criteresDefs.filter(
    (c) => c.categorie !== "arbitre"
  );

  // Calculer les moyennes pour arbitre et arbitrage
  const arbitreMoyenne = (() => {
    const allArbitreValues: number[] = [];
    arbitreCriteres.forEach((critere) => {
      const stats = calculateStats(critere.id);
      if (stats.count > 0) {
        allArbitreValues.push(stats.moyenne);
      }
    });
    if (allArbitreValues.length === 0) return 0;
    return (
      allArbitreValues.reduce((acc, val) => acc + val, 0) /
      allArbitreValues.length
    );
  })();

  const arbitrageMoyenne = (() => {
    const allArbitrageValues: number[] = [];
    arbitrageCriteres.forEach((critere) => {
      const stats = calculateStats(critere.id);
      if (stats.count > 0) {
        allArbitrageValues.push(stats.moyenne);
      }
    });
    if (allArbitrageValues.length === 0) return 0;
    return (
      allArbitrageValues.reduce((acc, val) => acc + val, 0) /
      allArbitrageValues.length
    );
  })();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        {t("matchDetail.comparison")}
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {t("matchDetail.comparisonDescription", { count: votes.length })}
      </p>

      {/* Notes générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">
            {t("matchDetail.arbitreNote")}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {arbitreMoyenne.toFixed(2)}/5
          </div>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">
            {t("matchDetail.arbitrageNote")}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {arbitrageMoyenne.toFixed(2)}/5
          </div>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">
            {t("voteForm.noteGlobal")}
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {globalNoteStats.moyenne.toFixed(2)}/5
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {globalNoteStats.count} {t("common.votes")}
          </div>
        </div>
      </div>

      {/* Tableau de comparaison */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-3 text-left">{t("matchDetail.criteria")}</th>
              <th className="px-4 py-3 text-center">{t("matchDetail.yourVote")}</th>
              <th className="px-4 py-3 text-center">{t("matchDetail.average")}</th>
              <th className="px-4 py-3 text-center">{t("matchDetail.min")}</th>
              <th className="px-4 py-3 text-center">{t("matchDetail.max")}</th>
            </tr>
          </thead>
          <tbody>
            {criteresDefs.map((critere) => {
              const label = getLocalizedName(locale, {
                defaultValue: critere.label_fr,
                fr: critere.label_fr,
                en: critere.label_en ?? critere.label_fr,
                ar: critere.label_ar ?? critere.label_fr,
              });
              const stats = calculateStats(critere.id);
              const userValue = userVote?.criteres[critere.id] || null;

              return (
                <tr key={critere.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{label}</td>
                  <td className="px-4 py-3 text-center">
                    {userValue !== null ? (
                      <span className="font-semibold text-blue-600">
                        {userValue.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stats.count > 0 ? (
                      <span className="font-semibold text-gray-700">
                        {stats.moyenne.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stats.count > 0 ? (
                      <span className="text-gray-600">{stats.min.toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stats.count > 0 ? (
                      <span className="text-gray-600">{stats.max.toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

