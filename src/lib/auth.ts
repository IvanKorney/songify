import { http } from './http'
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
  const { data } = await http.get<{ entries: LeaderboardEntry[] }>('/leaderboard', {
    params: { date, genre },
  })
  return data.entries
}

export const fetchMe = async () => {
  const { data } = await http.get<{ user: UserSession }>('/me')
  return data.user
}
