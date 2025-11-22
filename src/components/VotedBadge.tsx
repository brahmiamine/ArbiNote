"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

interface VotedBadgeProps {
  matchId: string;
}

export default function VotedBadge({ matchId }: VotedBadgeProps) {
  const { t } = useTranslations();
  const [voted, setVoted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  // Récupérer le fingerprint
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

  const checkVote = async () => {
    if (typeof window === "undefined") return false;

    try {
      // 1. Vérifier localStorage
      const stored = localStorage.getItem("note-arbitre-votes");
      if (stored) {
        const votes = JSON.parse(stored);

        // S'assurer que votes est un tableau
        if (Array.isArray(votes)) {
          // Vérifier si le matchId est dans la liste (avec ou sans fingerprint)
          const hasVoteLocal = votes.some((vote) => {
            if (vote === null || vote === undefined) return false;
            const voteStr = String(vote);
            // Vérifier que voteStr est bien une string et a la méthode startsWith
            if (typeof voteStr !== "string") return false;
            return voteStr === matchId || (voteStr.length > matchId.length && voteStr.startsWith(`${matchId}:`));
          });

          if (hasVoteLocal) {
            return true;
          }
        }
      }

      // 2. Vérifier la base de données si fingerprint disponible
      if (fingerprint) {
        try {
          const response = await fetch(`/api/votes/${matchId}`);
          if (response.ok) {
            const votes = await response.json();
            // Vérifier si un vote existe avec ce fingerprint
            const hasVoteDB = Array.isArray(votes) && votes.some((vote: any) => vote.device_fingerprint === fingerprint);
            if (hasVoteDB) {
              // Mettre à jour localStorage pour éviter les futures requêtes
              const stored = localStorage.getItem("note-arbitre-votes");
              const votes = stored ? JSON.parse(stored) : [];
              const voteKey = `${matchId}:${fingerprint}`;
              if (!votes.includes(voteKey)) {
                votes.push(voteKey);
                localStorage.setItem("note-arbitre-votes", JSON.stringify(votes));
              }
              return true;
            }
          }
        } catch (error) {
          // Ignorer les erreurs de fetch
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking vote:", error);
      return false;
    }
  };

  useEffect(() => {
    // Marquer comme monté pour éviter les problèmes d'hydratation
    setMounted(true);

    // Vérifier immédiatement
    checkVote().then(setVoted);

    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "note-arbitre-votes") {
        checkVote().then(setVoted);
      }
    };

    // Écouter les événements de stockage (depuis d'autres onglets)
    window.addEventListener("storage", handleStorageChange);

    // Écouter les changements dans le même onglet via un intervalle
    const interval = setInterval(() => {
      checkVote().then(setVoted);
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [matchId, fingerprint]);

  // Ne rien afficher avant le montage pour éviter les problèmes d'hydratation
  if (!mounted) return null;

  if (!voted) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full border-2 border-green-300 dark:border-green-700 shadow-sm"
      onClick={(e) => e.stopPropagation()}
      style={{ display: "inline-flex", flexShrink: 0 }}
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span className="whitespace-nowrap">{t("matchCard.alreadyVoted")}</span>
    </span>
  );
}
