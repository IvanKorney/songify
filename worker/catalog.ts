import type { Env } from './env'
import { deezerPreviewByIsrc, deezerPreviewByQuery } from './deezer'
import { spotifySearch, type SpotifyTrack } from './spotify'
import type { TrackSecret } from './types'

export const useMock = (env: Env): boolean => {
  return env.MOCK_MODE !== 'false' || !env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET
}

export const resolvePreview = async (track: SpotifyTrack): Promise<string | null> => {
  if (track.preview_url) return track.preview_url
  const isrc = track.external_ids?.isrc
  if (isrc) {
    const byIsrc = await deezerPreviewByIsrc(isrc)
    if (byIsrc) return byIsrc
  }
  const artist = track.artists[0]?.name ?? ''
  return deezerPreviewByQuery(track.name, artist)
}

export const fromSpotify = (track: SpotifyTrack, previewUrl: string | null): TrackSecret => {
  const artists = track.artists.map((a) => a.name)
  return {
    id: track.id,
    title: track.name,
    artists,
    albumArtUrl: track.album.images[0]?.url ?? null,
    previewUrl,
    externalUrl: track.external_urls.spotify,
    answerKey: `${track.name}|${artists.join(',')}`.toLowerCase(),
  }
}

export const liveSearch = async (
  query: string,
  env: Env,
  limit = 8,
): Promise<TrackSecret[]> => {
  const items = await spotifySearch(query, env.SPOTIFY_CLIENT_ID!, env.SPOTIFY_CLIENT_SECRET!, limit)
  const out: TrackSecret[] = []
  for (const item of items) {
    const previewUrl = await resolvePreview(item)
    out.push(fromSpotify(item, previewUrl))
  }
  return out
}
