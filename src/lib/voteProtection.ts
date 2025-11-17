/**
 * Protection contre les votes multiples
 * Utilise localStorage pour vérifier si un utilisateur a déjà voté
 */

const VOTE_STORAGE_KEY = 'note-arbitre-votes'

/**
 * Vérifie si un vote a déjà été effectué pour un match donné
 */
export function hasVoted(matchId: string): boolean {
  if (typeof window === 'undefined') return false
  
  const votes = getVotedMatches()
  return votes.includes(matchId)
}

/**
 * Enregistre qu'un vote a été effectué pour un match
 */
export function markAsVoted(matchId: string): void {
  if (typeof window === 'undefined') return
  
  const votes = getVotedMatches()
  if (!votes.includes(matchId)) {
    votes.push(matchId)
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votes))
  }
}

/**
 * Récupère la liste des matchs pour lesquels un vote a été effectué
 */
function getVotedMatches(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(VOTE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Réinitialise tous les votes (pour le développement/test)
 */
export function clearVotes(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(VOTE_STORAGE_KEY)
}

