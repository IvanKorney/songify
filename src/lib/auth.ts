import { api } from './apiClient'
import { getAnonId } from './storage'
import type { Genre, LeaderboardEntry, UserSession } from './types'

/** Future: real login. Today everyone is anonymous. */
export const getLocalSession = (): UserSession => {
  return null
}

export const getPlayerId = (): string => {
  return getAnonId()
}

export const fetchLeaderboard = async (date: string, genre: Genre) => {
  const data = await api
    .get('leaderboard', { searchParams: { date, genre } })
    .json<{ entries: LeaderboardEntry[] }>()
  return data.entries
}

export const fetchMe = async () => {
  const data = await api.get('me').json<{ user: UserSession }>()
  return data.user
}
