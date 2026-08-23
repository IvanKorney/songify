export const GENRES = [
  { id: 'all', label: 'All' },
  { id: 'rock', label: 'Rock' },
  { id: 'hiphop', label: 'Hip Hop' },
  { id: 'pop', label: 'Pop' },
  { id: 'country', label: 'Country' },
] as const

export type Genre = (typeof GENRES)[number]['id']

export const STAGE_SECONDS = [0.1, 0.5, 2, 4, 8, 16] as const
export const STAGE_POINTS = [6, 5, 4, 3, 2, 1] as const

export type TrackPublic = {
  id: string
  title: string
  artists: string[]
  albumArtUrl: string | null
  previewUrl: string | null
  externalUrl: string | null
}

export type DailyPuzzle = {
  date: string
  genre: Genre
  roundId: string
  previewUrl: string | null
  durationHintSec: number
}

export type SearchHit = {
  id: string
  title: string
  artists: string[]
  albumArtUrl: string | null
}

export type GuessAttempt =
  | { kind: 'skip' }
  | { kind: 'wrong'; label: string }
  | { kind: 'correct'; label: string }

export type RoundStatus = 'playing' | 'won' | 'lost'

export type RoundState = {
  date: string
  genre: Genre
  roundId: string
  previewUrl: string | null
  stageIndex: number
  attempts: GuessAttempt[]
  status: RoundStatus
  score: number
  revealed: TrackPublic | null
}

/** Future: login + leaderboard */
export type UserSession = {
  id: string
  displayName: string
} | null

export type LeaderboardEntry = {
  userId: string
  displayName: string
  score: number
  genre: Genre
  date: string
}
