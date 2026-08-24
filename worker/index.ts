import { getSession, listLeaderboard } from './auth'
import { fromSpotify, liveSearch, resolvePreview, useMock } from './catalog'
import {
  STAGE_POINTS,
  decodeRoundId,
  encodeRoundId,
  nyDate,
  parseGenre,
} from './daily'
import type { Env } from './env'
import {
  dailyTrack,
  randomUnlimited,
  searchMock,
  toPublic,
  trackById,
} from './mock'
import { spotifyGetTrack, spotifySearchByGenre } from './spotify'
import type { GuessRequest, Genre, TrackSecret } from './types'

const corsHeaders = (origin: string | null): HeadersInit => {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

const json = (data: unknown, init: ResponseInit = {}, origin: string | null = null) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
      ...(init.headers ?? {}),
    },
  })
}

const genreQuery = (genre: Genre): string => {
  if (genre === 'hiphop') return 'hip-hop'
  if (genre === 'all') return 'pop'
  return genre
}

const hash = (input: string): number => {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const liveDaily = async (env: Env, date: string, genre: Genre): Promise<TrackSecret> => {
  const items = await spotifySearchByGenre(
    genreQuery(genre),
    env.SPOTIFY_CLIENT_ID!,
    env.SPOTIFY_CLIENT_SECRET!,
  )
  if (!items.length) throw new Error('No Spotify tracks for genre')
  const pick = items[hash(`${date}:${genre}`) % items.length]!
  const previewUrl = await resolvePreview(pick)
  return fromSpotify(pick, previewUrl)
}

const resolveTrack = async (env: Env, trackId: string): Promise<TrackSecret | null> => {
  if (useMock(env)) return trackById(trackId) ?? null
  try {
    const spotify = await spotifyGetTrack(
      trackId,
      env.SPOTIFY_CLIENT_ID!,
      env.SPOTIFY_CLIENT_SECRET!,
    )
    const previewUrl = await resolvePreview(spotify)
    return fromSpotify(spotify, previewUrl)
  } catch {
    return trackById(trackId) ?? null
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const path = url.pathname.replace(/^\/api/, '') || '/'

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    try {
      if (request.method === 'GET' && path === '/health') {
        return json({ ok: true, mock: useMock(env) }, {}, origin)
      }

      if (request.method === 'GET' && path === '/me') {
        return json({ user: getSession(request) }, {}, origin)
      }

      if (request.method === 'GET' && path === '/leaderboard') {
        const date = url.searchParams.get('date') ?? nyDate()
        const genre = parseGenre(url.searchParams.get('genre')) ?? 'all'
        const entries = await listLeaderboard(date, genre)
        return json({ entries }, {}, origin)
      }

      if (request.method === 'GET' && path === '/daily') {
        const genre = parseGenre(url.searchParams.get('genre')) ?? 'all'
        const date = nyDate()
        const track = useMock(env)
          ? dailyTrack(date, genre)
          : await liveDaily(env, date, genre)
        const roundId = encodeRoundId(date, genre, track.id)
        return json(
          {
            date,
            genre,
            roundId,
            previewUrl: track.previewUrl,
            durationHintSec: 30,
          },
          {},
          origin,
        )
      }

      if (request.method === 'GET' && path === '/unlimited') {
        const genreParam = url.searchParams.get('genre')
        const genre = (genreParam ? parseGenre(genreParam) : null) ?? 'all'
        let track: TrackSecret
        if (useMock(env)) {
          track = randomUnlimited(genre)
        } else {
          const items = await spotifySearchByGenre(
            genreQuery(genre),
            env.SPOTIFY_CLIENT_ID!,
            env.SPOTIFY_CLIENT_SECRET!,
          )
          const pick = items[Math.floor(Math.random() * items.length)]
          if (!pick) throw new Error('No tracks')
          track = fromSpotify(pick, await resolvePreview(pick))
        }
        const date = nyDate()
        const roundId = encodeRoundId(`u-${Date.now()}`, genre, track.id)
        return json(
          {
            date,
            genre,
            roundId,
            previewUrl: track.previewUrl,
            durationHintSec: 30,
          },
          {},
          origin,
        )
      }

      if (request.method === 'GET' && path === '/search') {
        const q = url.searchParams.get('q') ?? ''
        const tracks = useMock(env)
          ? searchMock(q)
          : await liveSearch(q, env)
        const hits = tracks.map((t) => ({
          id: t.id,
          title: t.title,
          artists: t.artists,
          albumArtUrl: t.albumArtUrl,
        }))
        return json({ hits }, {}, origin)
      }

      if (request.method === 'POST' && path === '/guess') {
        const body = (await request.json()) as GuessRequest
        const decoded = decodeRoundId(body.roundId)
        if (!decoded) return json({ error: 'Invalid round' }, { status: 400 }, origin)

        const track = await resolveTrack(env, decoded.trackId)
        if (!track) return json({ error: 'Unknown track' }, { status: 404 }, origin)

        const stageIndex = Math.max(0, Math.min(STAGE_POINTS.length - 1, body.stageIndex))
        const correct = body.trackId === track.id

        if (!correct) {
          return json({ correct: false, score: 0 }, {}, origin)
        }

        return json(
          {
            correct: true,
            score: STAGE_POINTS[stageIndex],
            track: toPublic(track),
          },
          {},
          origin,
        )
      }

      if (request.method === 'POST' && path === '/reveal') {
        const body = (await request.json()) as { roundId: string; stageIndex?: number }
        const decoded = decodeRoundId(body.roundId)
        if (!decoded) return json({ error: 'Invalid round' }, { status: 400 }, origin)
        const track = await resolveTrack(env, decoded.trackId)
        if (!track) return json({ error: 'Unknown track' }, { status: 404 }, origin)
        return json({ track: toPublic(track), score: 0 }, {}, origin)
      }

      return json({ error: 'Not found' }, { status: 404 }, origin)
    } catch (err) {
      return json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 }, origin)
    }
  },
} satisfies ExportedHandler<Env>
