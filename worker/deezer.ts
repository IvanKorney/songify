/** Deezer public API — used for 30s preview MP3s when Spotify preview_url is null. */

type DeezerTrack = {
  id: number
  title: string
  preview: string
  artist: { name: string }
}

export const deezerPreviewByIsrc = async (isrc: string): Promise<string | null> => {
  const url = new URL('https://api.deezer.com/track/isrc:' + encodeURIComponent(isrc))
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as DeezerTrack & { error?: unknown }
  if (data.error || !data.preview) return null
  return data.preview
}

export const deezerPreviewByQuery = async (title: string, artist: string): Promise<string | null> => {
  const q = `track:"${title}" artist:"${artist}"`
  const url = new URL('https://api.deezer.com/search/track')
  url.searchParams.set('q', q)
  url.searchParams.set('limit', '1')
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as { data?: DeezerTrack[] }
  const hit = data.data?.[0]
  return hit?.preview || null
}
