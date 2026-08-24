type SpotifyToken = { access_token: string; expires_at: number }

let cached: SpotifyToken | null = null

/** Development-mode Spotify apps reject search limits above 10. */
const MAX_PAGE_SIZE = 10

export type SpotifyTrack = {
  id: string
  name: string
  artists: { name: string }[]
  album: { images: { url: string }[] }
  external_urls: { spotify: string }
  external_ids?: { isrc?: string }
  preview_url: string | null
}

const getToken = async (clientId: string, clientSecret: string): Promise<string> => {
  if (cached && cached.expires_at > Date.now() + 30_000) return cached.access_token

  const body = new URLSearchParams({ grant_type: 'client_credentials' })
  const auth = btoa(`${clientId}:${clientSecret}`)
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  if (!res.ok) throw new Error(`Spotify auth ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cached = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
  return data.access_token
}

const spotifyJson = async <T>(url: string, clientId: string, clientSecret: string): Promise<T> => {
  const token = await getToken(clientId, clientSecret)
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Spotify ${res.status}: ${body.slice(0, 180)}`)
  }
  return res.json() as Promise<T>
}

const searchPage = async (
  query: string,
  clientId: string,
  clientSecret: string,
  limit: number,
  offset: number,
): Promise<SpotifyTrack[]> => {
  const url = new URL('https://api.spotify.com/v1/search')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'track')
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), MAX_PAGE_SIZE)))
  url.searchParams.set('offset', String(Math.max(offset, 0)))
  url.searchParams.set('market', 'US')
  const data = await spotifyJson<{ tracks: { items: SpotifyTrack[] } }>(
    url.toString(),
    clientId,
    clientSecret,
  )
  return data.tracks.items ?? []
}

/** Single-page search (guess autocomplete). */
export const spotifySearch = async (
  query: string,
  clientId: string,
  clientSecret: string,
  limit = 8,
): Promise<SpotifyTrack[]> => {
  return searchPage(query, clientId, clientSecret, limit, 0)
}

/**
 * Genre pool for daily/unlimited. Pages past the 10-result cap
 * until we have `target` unique tracks (or Spotify runs out).
 */
export const spotifySearchByGenre = async (
  genre: string,
  clientId: string,
  clientSecret: string,
  target = 50,
): Promise<SpotifyTrack[]> => {
  const queries = [`genre:${genre}`, genre]
  for (const q of queries) {
    const collected: SpotifyTrack[] = []
    const seen = new Set<string>()
    let offset = 0
    while (collected.length < target) {
      const page = await searchPage(q, clientId, clientSecret, MAX_PAGE_SIZE, offset)
      if (!page.length) break
      for (const track of page) {
        if (seen.has(track.id)) continue
        seen.add(track.id)
        collected.push(track)
        if (collected.length >= target) break
      }
      if (page.length < MAX_PAGE_SIZE) break
      offset += MAX_PAGE_SIZE
    }
    if (collected.length) return collected
  }
  return []
}

export const spotifyGetTrack = async (
  id: string,
  clientId: string,
  clientSecret: string,
): Promise<SpotifyTrack> => {
  const url = new URL(`https://api.spotify.com/v1/tracks/${id}`)
  url.searchParams.set('market', 'US')
  return spotifyJson<SpotifyTrack>(url.toString(), clientId, clientSecret)
}
