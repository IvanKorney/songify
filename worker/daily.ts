import { isGenre, type Genre } from './types'

/** Calendar date in America/New_York (EST/EDT). */
export function nyDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** Coerce a query/path string into a Genre option (or null). */
export function parseGenre(value: string | null): Genre | null {
  if (!value) return null
  const g = value.toLowerCase()
  return isGenre(g) ? g : null
}

/** Opaque round id: base64url(date|genre|trackId) — fine for mock; harden with HMAC later */
export function encodeRoundId(date: string, genre: Genre, trackId: string): string {
  const raw = `${date}|${genre}|${trackId}`
  return btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeRoundId(
  roundId: string,
): { date: string; genre: Genre; trackId: string } | null {
  try {
    const padded = roundId.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    const raw = atob(padded + pad)
    const [date, genre, trackId] = raw.split('|')
    if (!date || !genre || !trackId) return null
    const g = parseGenre(genre)
    if (!g) return null
    return { date, genre: g, trackId }
  } catch {
    return null
  }
}

export const STAGE_SECONDS = [0.1, 0.5, 2, 4, 8, 16] as const
export const STAGE_POINTS = [6, 5, 4, 3, 2, 1] as const
