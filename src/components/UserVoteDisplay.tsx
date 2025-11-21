"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "@/lib/i18n";
import { CritereDefinition } from "@/types";
import { getLocalizedName } from "@/lib/utils";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface UserVoteDisplayProps {
  matchId: string;
  criteresDefs: CritereDefinition[];
  initialVote?: Vote | null;
  fingerprint?: string | null;
}

interface Vote {
  id: string;
  criteres: Record<string, number>;
  note_globale: number;
  created_at?: string;
}

export default function UserVoteDisplay({ 
  matchId, 
  criteresDefs, 
  initialVote = null,
  fingerprint: providedFingerprint = null
}: UserVoteDisplayProps) {
  const { t, locale } = useTranslations();
  const [vote, setVote] = useState<Vote | null>(initialVote);
  const [loading, setLoading] = useState(!initialVote);
  const [fingerprint, setFingerprint] = useState<string | null>(providedFingerprint);

  useEffect(() => {
    // Si le fingerprint est déjà fourni, on ne le récupère pas
    if (providedFingerprint) {
      return;
    }

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
  }, [providedFingerprint]);

  useEffect(() => {
    // Si on a déjà le vote initial, on ne fait pas d'appel API
    if (initialVote) {
      setVote(initialVote);
      setLoading(false);
      return;
    }

    if (!fingerprint) {
      setLoading(false);
      return;
    }

    const fetchUserVote = async () => {
      try {
        console.log("Fetching vote for match:", matchId, "fingerprint:", fingerprint);
        const response = await fetch(
          `/api/votes/${matchId}/user?fingerprint=${fingerprint}`
        );
        console.log("Vote response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Vote data received:", data);
          setVote(data);
        } else if (response.status === 404) {
          console.log("Vote not found (404)");
          setVote(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error fetching user vote:", response.status, response.statusText, errorData);
          setVote(null);
        }
      } catch (error) {
        console.error("Error fetching user vote:", error);
        setVote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserVote();
  }, [matchId, fingerprint, initialVote]);

  // Séparer les critères arbitre et arbitrage
  const arbitreCriteres = useMemo(() => {
    return criteresDefs.filter((c) => c.categorie === "arbitre");
  }, [criteresDefs]);

  const arbitrageCriteres = useMemo(() => {
    return criteresDefs.filter((c) => c.categorie !== "arbitre");
  }, [criteresDefs]);

  // Calculer les moyennes pour arbitre et arbitrage
  const arbitreMoyenne = useMemo(() => {
    if (!vote) return 0;
    const values = arbitreCriteres
      .map((c) => vote.criteres[c.id])
      .filter((v) => typeof v === "number" && v > 0);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }, [vote, arbitreCriteres]);

  const arbitrageMoyenne = useMemo(() => {
    if (!vote) return 0;
    const values = arbitrageCriteres
      .map((c) => vote.criteres[c.id])
      .filter((v) => typeof v === "number" && v > 0);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }, [vote, arbitrageCriteres]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">{t("common.loading")}</p>
      </div>
    );
  }

  // Debug logs (à retirer en production)
  useEffect(() => {
    console.log("UserVoteDisplay state:", {
      loading,
      hasVote: !!vote,
      vote: vote ? { id: vote.id, note_globale: vote.note_globale, criteres: Object.keys(vote.criteres) } : null,
      criteresCount: criteresDefs.length,
      arbitreCriteresCount: arbitreCriteres.length,
      arbitrageCriteresCount: arbitrageCriteres.length,
      matchId,
      fingerprint,
    });
  }, [loading, vote, criteresDefs.length, arbitreCriteres.length, arbitrageCriteres.length, matchId, fingerprint]);

  if (!vote) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          {t("matchDetail.myVotes")}
        </h2>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm mb-2">
            {t("matchDetail.voteNotFound")}
          </p>
          <p className="text-xs text-yellow-700">
            Match ID: {matchId} | Fingerprint: {fingerprint ? "✓" : "✗"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        {t("matchDetail.myVotes")}
      </h2>

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
            {vote.note_globale.toFixed(2)}/5
          </div>
        </div>
      </div>

      {/* Tableau des votes */}
      <div className="overflow-x-auto">
        {criteresDefs.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Aucun critère défini. Veuillez contacter l'administrateur.
            </p>
          </div>
        ) : (
          <table className="min-w-full text-sm rtl:text-right border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 text-left border-b border-gray-300">{t("matchDetail.criteria")}</th>
                <th className="px-4 py-3 text-left border-b border-gray-300">{t("matchDetail.yourVote")}</th>
              </tr>
            </thead>
            <tbody>
              {/* Section Arbitre */}
              {arbitreCriteres.length > 0 ? (
                <>
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-200">
                      {t("voteForm.section.arbitre")}
                    </td>
                  </tr>
                  {arbitreCriteres.map((critere) => {
                    const label = getLocalizedName(locale, {
                      defaultValue: critere.label_fr,
                      fr: critere.label_fr,
                      en: critere.label_en ?? critere.label_fr,
                      ar: critere.label_ar ?? critere.label_fr,
                    });
                    const value = vote.criteres[critere.id] || 0;
                    return (
                      <tr key={critere.id} className="border-b border-gray-100 bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{label}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          {value > 0 ? `${value.toFixed(2)}/5` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-gray-500 text-center">
                    Aucun critère arbitre défini
                  </td>
                </tr>
              )}

              {/* Section Arbitrage (VAR et Assistant) */}
              {arbitrageCriteres.length > 0 && (
                <>
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-200">
                      {t("matchDetail.arbitrageSection")}
                    </td>
                  </tr>
                  {arbitrageCriteres.map((critere) => {
                    const label = getLocalizedName(locale, {
                      defaultValue: critere.label_fr,
                      fr: critere.label_fr,
                      en: critere.label_en ?? critere.label_fr,
                      ar: critere.label_ar ?? critere.label_fr,
                    });
                    const value = vote.criteres[critere.id] || 0;
                    return (
                      <tr key={critere.id} className="border-b border-gray-100 bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{label}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          {value > 0 ? `${value.toFixed(2)}/5` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

