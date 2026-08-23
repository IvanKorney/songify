import type {
  DailyPuzzle,
  Genre,
  SearchHit,
  TrackPublic,
} from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export function fetchDaily(genre: Genre) {
  return request<DailyPuzzle>(`/daily?genre=${genre}`)
}

export function fetchUnlimited(genre?: Genre) {
  const q = genre ? `?genre=${genre}` : ''
  return request<DailyPuzzle>(`/unlimited${q}`)
}

export function searchTracks(q: string) {
  return request<{ hits: SearchHit[] }>(`/search?q=${encodeURIComponent(q)}`)
}

export function submitGuess(roundId: string, trackId: string, stageIndex: number) {
  return request<
    | { correct: true; score: number; track: TrackPublic }
    | { correct: false; score: 0 }
  >('/guess', {
    method: 'POST',
    body: JSON.stringify({ roundId, trackId, stageIndex }),
  })
}

export function revealTrack(roundId: string) {
  return request<{ track: TrackPublic; score: number }>('/reveal', {
    method: 'POST',
    body: JSON.stringify({ roundId }),
  })
}
