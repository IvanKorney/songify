import type { Genre, RoundState } from './types'

const PREFIX = 'songify:v1'

const dailyKey = (date: string, genre: Genre) => {
  return `${PREFIX}:daily:${date}:${genre}`
}

export const loadDailyState = (date: string, genre: Genre): RoundState | null => {
  try {
    const raw = localStorage.getItem(dailyKey(date, genre))
    if (!raw) return null
    return JSON.parse(raw) as RoundState
  } catch {
    return null
  }
}

export const saveDailyState = (state: RoundState) => {
  localStorage.setItem(dailyKey(state.date, state.genre), JSON.stringify(state))
}

/** Placeholder for future auth-backed sync */
export const getAnonId = (): string => {
  const key = `${PREFIX}:anonId`
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}
