import type { Genre, LeaderboardEntry, UserSession } from './types'

/** Future: replace with real session cookie / OAuth. */
export const getSession = (_request: Request): UserSession => {
  return null
}

/** Future: persist scores to KV/D1. */
export const listLeaderboard = async (
  _date: string,
  _genre: Genre,
): Promise<LeaderboardEntry[]> => {
  return []
}

export const submitScore = async (_entry: LeaderboardEntry): Promise<void> => {
  // no-op stub
}
