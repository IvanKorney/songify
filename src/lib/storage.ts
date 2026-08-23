import type { Genre, RoundState } from './types'

const PREFIX = 'songify:v1'

function dailyKey(date: string, genre: Genre) {
  return `${PREFIX}:daily:${date}:${genre}`
}

export function loadDailyState(date: string, genre: Genre): RoundState | null {
  try {
    const raw = localStorage.getItem(dailyKey(date, genre))
    if (!raw) return null
    return JSON.parse(raw) as RoundState
  } catch {
    return null
  }
}

export function saveDailyState(state: RoundState) {
  localStorage.setItem(dailyKey(state.date, state.genre), JSON.stringify(state))
}

/** Placeholder for future auth-backed sync */
export function getAnonId(): string {
  const key = `${PREFIX}:anonId`
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}
