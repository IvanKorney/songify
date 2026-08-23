import { http } from './http'
import type {
  DailyPuzzle,
  Genre,
  SearchHit,
  TrackPublic,
} from './types'

export function fetchDaily(genre: Genre) {
  return http
    .get<DailyPuzzle>('/daily', { params: { genre } })
    .then((res) => res.data)
}

export function fetchUnlimited(genre?: Genre) {
  return http
    .get<DailyPuzzle>('/unlimited', { params: genre ? { genre } : undefined })
    .then((res) => res.data)
}

export function searchTracks(q: string) {
  return http
    .get<{ hits: SearchHit[] }>('/search', { params: { q } })
    .then((res) => res.data)
}

export function submitGuess(roundId: string, trackId: string, stageIndex: number) {
  return http
    .post<
      | { correct: true; score: number; track: TrackPublic }
      | { correct: false; score: 0 }
    >('/guess', { roundId, trackId, stageIndex })
    .then((res) => res.data)
}

export function revealTrack(roundId: string) {
  return http
    .post<{ track: TrackPublic; score: number }>('/reveal', { roundId })
    .then((res) => res.data)
}

export const queryKeys = {
  daily: (genre: Genre) => ['daily', genre] as const,
  unlimited: (genre: Genre) => ['unlimited', genre] as const,
  search: (q: string) => ['search', q] as const,
  me: ['me'] as const,
  leaderboard: (date: string, genre: Genre) => ['leaderboard', date, genre] as const,
}
