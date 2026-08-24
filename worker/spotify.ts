type SpotifyToken = { access_token: string; expires_at: number }

let cached: SpotifyToken | null = null

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
  if (!res.ok) throw new Error(`Spotify auth failed (${res.status})`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  cached = {
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  }
  return data.access_token
}

export const spotifySearch = async (
  query: string,
  clientId: string,
  clientSecret: string,
  limit = 8,
): Promise<SpotifyTrack[]> => {
  const token = await getToken(clientId, clientSecret)
  const url = new URL('https://api.spotify.com/v1/search')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'track')
  url.searchParams.set('limit', String(limit))
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Spotify search failed (${res.status})`)
  const data = (await res.json()) as { tracks: { items: SpotifyTrack[] } }
  return data.tracks.items
}

export const spotifySearchByGenre = async (
  genre: string,
  clientId: string,
  clientSecret: string,
  limit = 20,
): Promise<SpotifyTrack[]> => {
  return spotifySearch(`genre:${genre}`, clientId, clientSecret, limit)
}

export const spotifyGetTrack = async (
  id: string,
  clientId: string,
  clientSecret: string,
): Promise<SpotifyTrack> => {
  const token = await getToken(clientId, clientSecret)
  const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Spotify track failed (${res.status})`)
  return res.json() as Promise<SpotifyTrack>
}
