"use client";

import { useEffect, useMemo, useState } from "react";
import StarsRating from "./StarsRating";
import { hasVoted, markAsVoted } from "@/lib/voteProtection";
import { roundNote, canVoteMatch } from "@/lib/utils";
import { useTranslations } from "@/lib/i18n";
import { CritereDefinition } from "@/types";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const fallbackCriteres: CritereDefinition[] = [
  {
    id: "fairplay",
    categorie: "arbitre",
    label_fr: "Fair-play",
    label_ar: "اللعب النظيف",
    description_fr: "Évalue l'impartialité et la gestion des contacts.",
    description_ar: "تقييم الحياد وطريقة إدارة الاحتكاكات.",
  },
  {
    id: "decisions",
    categorie: "arbitre",
    label_fr: "Décisions",
    label_ar: "القرارات",
    description_fr: "Justesse des cartons et cohérence disciplinaire.",
    description_ar: "مدى صحة الإنذارات والانسجام في القرارات الانضباطية.",
  },
  {
    id: "var_qualite",
    categorie: "var",
    label_fr: "VAR",
    label_ar: "استخدام تقنية الفار",
    description_fr: "Analyse la qualité des interventions VAR et la rapidité.",
    description_ar: "تحليل جودة تدخلات الفار وسرعة اتخاذ القرار.",
  },
  {
    id: "assistant_collaboration",
    categorie: "assistant",
    label_fr: "Assistants",
    label_ar: "عمل الحكام المساعدين",
    description_fr: "Précision des hors-jeu et cohérence avec le central.",
    description_ar: "دقّة التسلل والانسجام مع الحكم الرئيسي.",
  },
];

interface VoteFormProps {
  matchId: string;
  arbitreId: string;
  arbitreNom: string;
  criteresDefs: CritereDefinition[];
  matchDate?: string | null;
  onSuccess?: () => void;
}

type CriteresState = Record<string, number>;

export default function VoteForm({ matchId, arbitreId, arbitreNom, criteresDefs, matchDate, onSuccess }: VoteFormProps) {
  const { t, locale } = useTranslations();
  const criteresList = criteresDefs.length ? criteresDefs : fallbackCriteres;

  const canVote = useMemo(() => {
    return canVoteMatch({ arbitre_id: arbitreId, date: matchDate });
  }, [arbitreId, matchDate]);

  const emptyState = useMemo(() => {
    return criteresList.reduce<CriteresState>((acc, critere) => {
      acc[critere.id] = 0;
      return acc;
    }, {});
  }, [criteresList]);

  const groupedByCategory = useMemo(() => {
    return criteresList.reduce<Record<string, CritereDefinition[]>>((acc, critere) => {
      acc[critere.categorie] = acc[critere.categorie] || [];
      acc[critere.categorie].push(critere);
      return acc;
    }, {});
  }, [criteresList]);

  const [criteres, setCriteres] = useState<CriteresState>(emptyState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    setCriteres(emptyState);
  }, [emptyState]);

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

  const voteKey = fingerprint ? `${matchId}:${fingerprint}` : matchId;
  const alreadyVoted = hasVoted(voteKey);

  const calculateNoteGlobale = (crits: CriteresState): number => {
    const values = Object.values(crits).filter((v) => v > 0);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return roundNote(sum / values.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canVote) {
      setError(t("voteForm.errorCannotVote"));
      return;
    }

    const allFilled = criteresList.every((critere) => criteres[critere.id] > 0);
    if (!allFilled) {
      setError(t("voteForm.errorIncomplete"));
      return;
    }

    if (!fingerprint) {
      setError(t("common.error"));
      return;
    }

    if (hasVoted(voteKey)) {
      setError(t("voteForm.errorAlreadyVoted"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const noteGlobale = calculateNoteGlobale(criteres);

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          match_id: matchId,
          arbitre_id: arbitreId,
          criteres,
          note_globale: noteGlobale,
          device_fingerprint: fingerprint,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("common.error"));
      }

      markAsVoted(voteKey);
      setSuccess(true);

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadyVoted) {
    // Ne rien afficher si déjà voté, les composants UserVoteDisplay et VotesComparison s'afficheront
    return null;
  }

  if (success) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-green-800 font-medium mb-2">{t("voteForm.success")}</p>
            <p className="text-sm text-green-700">{t("voteForm.cannotChange")}</p>
          </div>
        </div>
      </div>
    );
  }

  const noteGlobale = calculateNoteGlobale(criteres);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{t("matchDetail.voteTitle")}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            {t("voteForm.intro")} <strong className="font-semibold">{arbitreNom}</strong>
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(groupedByCategory).map(([categorie, list]) => {
            const sectionLabel =
              categorie === "assistant"
                ? t("voteForm.section.assistant")
                : categorie === "var"
                ? t("voteForm.section.var")
                : t("voteForm.section.arbitre");

            return (
              <div key={categorie} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{sectionLabel}</h3>
                {list.map((critere) => {
                  const label = locale === "ar" ? critere.label_ar : locale === "en" ? critere.label_en ?? critere.label_fr : critere.label_fr;
                  const description = locale === "ar" ? critere.description_ar : critere.description_fr;

                  return (
                    <div key={critere.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-800">{label}</label>
                        <span className="text-xs text-gray-500 uppercase">{critere.categorie}</span>
                      </div>
                      {description && <p className="text-xs text-gray-500 mb-3">{description}</p>}
                      <StarsRating
                        value={criteres[critere.id]}
                        onChange={(value) =>
                          setCriteres((prev) => ({
                            ...prev,
                            [critere.id]: value,
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {noteGlobale > 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{t("voteForm.noteGlobal")}:</span>
              <span className="text-2xl font-bold text-blue-600">{noteGlobale.toFixed(2)}/5</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || noteGlobale === 0 || !canVote}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? t("voteForm.submitting") : t("voteForm.submit")}
        </button>
      </form>
    </div>
  );
}
