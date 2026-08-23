export const GENRES = ['all', 'rock', 'hiphop', 'pop', 'country'] as const
export type Genre = (typeof GENRES)[number]

const GENRE_SET: ReadonlySet<string> = new Set(GENRES)

export function isGenre(value: string): value is Genre {
  return GENRE_SET.has(value)
}

export type TrackPublic = {
  id: string
  title: string
  artists: string[]
  albumArtUrl: string | null
  previewUrl: string | null
  externalUrl: string | null
}

/** Full track kept server-side until reveal */
export type TrackSecret = TrackPublic & {
  answerKey: string
}

export type DailyPuzzleResponse = {
  date: string
  genre: Genre
  /** Opaque round id — answer not included */
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

export type GuessRequest = {
  roundId: string
  trackId: string
  stageIndex: number
}

export type GuessResponse =
  | {
      correct: true
      score: number
      track: TrackPublic
    }
  | {
      correct: false
      score: 0
    }

export type RevealResponse = {
  track: TrackPublic
  score: number
}
