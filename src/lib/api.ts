import { api } from './apiClient'
import type {
  DailyPuzzle,
  Genre,
  SearchHit,
  TrackPublic,
} from './types'

export const fetchDaily = async (genre: Genre) => {
  return api.get('daily', { searchParams: { genre } }).json<DailyPuzzle>()
}

export const fetchUnlimited = async (genre?: Genre) => {
  return api
    .get('unlimited', { searchParams: genre ? { genre } : undefined })
    .json<DailyPuzzle>()
}

export const searchTracks = async (q: string) => {
  return api.get('search', { searchParams: { q } }).json<{ hits: SearchHit[] }>()
}

export const submitGuess = async (roundId: string, trackId: string, stageIndex: number) => {
  return api
    .post('guess', { json: { roundId, trackId, stageIndex } })
    .json<
      | { correct: true; score: number; track: TrackPublic }
      | { correct: false; score: 0 }
    >()
}

export const revealTrack = async (roundId: string) => {
  return api.post('reveal', { json: { roundId } }).json<{ track: TrackPublic; score: number }>()
}

export const queryKeys = {
  daily: (genre: Genre) => ['daily', genre] as const,
  unlimited: (genre: Genre) => ['unlimited', genre] as const,
  search: (q: string) => ['search', q] as const,
  me: ['me'] as const,
  leaderboard: (date: string, genre: Genre) => ['leaderboard', date, genre] as const,
}
