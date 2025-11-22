"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { CritereDefinition } from "@/types";
import { hasVoted as checkLocalStorageVote } from "@/lib/voteProtection";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import Image from "next/image";
import Link from "next/link";
import UserVoteDisplay from "./UserVoteDisplay";
import VotesComparison from "./VotesComparison";

interface AlreadyVotedSectionProps {
  matchId: string;
  arbitreId: string;
  arbitreNom: string;
  arbitrePhotoUrl: string | null;
  arbitreCategory: string | null;
  criteresDefs: CritereDefinition[];
  refreshTrigger?: number;
}

export default function AlreadyVotedSection({
  matchId,
  arbitreId,
  arbitreNom,
  arbitrePhotoUrl,
  arbitreCategory,
  criteresDefs,
  refreshTrigger,
}: AlreadyVotedSectionProps) {
  const { t, locale } = useTranslations();
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<any>(null);

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
    // Vérifier d'abord dans localStorage (plus rapide)
    const voteKey = fingerprint ? `${matchId}:${fingerprint}` : matchId;
    const localHasVoted = checkLocalStorageVote(voteKey);

    // Si pas dans localStorage et pas de fingerprint, on arrête
    if (!fingerprint) {
      setLoading(false);
      return;
    }

    // Toujours récupérer le vote depuis la base de données pour l'afficher
    const checkVote = async () => {
      try {
        const response = await fetch(`/api/votes/${matchId}/user?fingerprint=${fingerprint}`);
        if (response.ok) {
          const voteData = await response.json();
          setHasVoted(true);
          setUserVote(voteData);
        } else if (response.status === 404) {
          // Si pas dans la DB mais dans localStorage, on considère qu'on a voté
          if (localHasVoted) {
            setHasVoted(true);
          } else {
            setHasVoted(false);
          }
          setUserVote(null);
        }
      } catch (error) {
        console.error("Error checking vote:", error);
        // En cas d'erreur, on se base sur localStorage
        if (localHasVoted) {
          setHasVoted(true);
        } else {
          setHasVoted(false);
        }
        setUserVote(null);
      } finally {
        setLoading(false);
      }
    };

    checkVote();
  }, [matchId, fingerprint, refreshTrigger]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
        <p className="text-gray-600">{t("common.loading")}</p>
      </div>
    );
  }

  if (!hasVoted) {
    return null;
  }

  return (
    <>
      {/* Alerte déjà voté */}
      <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-green-800 font-medium mb-1">{t("matchDetail.alreadyVotedAlert")}</p>
            <p className="text-sm text-green-700">{t("voteForm.cannotChange")}</p>
          </div>
        </div>
      </div>

      {/* Section Arbitre avec photo */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{t("matchDetail.refereeInfo")}</h2>
        <div className="flex items-center gap-4">
          {arbitrePhotoUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <Image src={arbitrePhotoUrl} alt={arbitreNom} fill sizes="80px" className="object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400 font-bold text-2xl">{arbitreNom.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1">
            <Link href={`/arbitres/${arbitreId}`} className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
              {arbitreNom}
            </Link>
            {arbitreCategory && <p className="text-sm text-gray-600 mt-1">{arbitreCategory}</p>}
          </div>
        </div>
      </div>

      {/* Mes votes */}
      {criteresDefs && criteresDefs.length > 0 ? (
        <UserVoteDisplay matchId={matchId} criteresDefs={criteresDefs} initialVote={userVote} fingerprint={fingerprint} />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">{t("matchDetail.myVotes")}</h2>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">Aucun critère défini. Veuillez contacter l'administrateur.</p>
          </div>
        </div>
      )}

      {/* Comparaison */}
      <VotesComparison matchId={matchId} criteresDefs={criteresDefs} />
    </>
  );
}
