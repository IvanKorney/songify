import { dailyTrack, randomUnlimited, searchMock, toPublic, trackById } from './mock'
import {
  STAGE_POINTS,
  decodeRoundId,
  encodeRoundId,
  nyDate,
  parseGenre,
} from './daily'
import type { GuessRequest, Genre } from './types'

function corsHeaders(origin: string | null): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(data: unknown, init: ResponseInit = {}, origin: string | null = null) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
      ...(init.headers ?? {}),
    },
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const path = url.pathname.replace(/^\/api/, '') || '/'

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    try {
      if (request.method === 'GET' && path === '/health') {
        return json({ ok: true, mock: true }, {}, origin)
      }

      if (request.method === 'GET' && path === '/daily') {
        const genre = parseGenre(url.searchParams.get('genre')) ?? 'all'
        const date = nyDate()
        const track = dailyTrack(date, genre)
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
        const genre = genreParam ? parseGenre(genreParam) : null
        const track = randomUnlimited(genre ?? undefined)
        const date = nyDate()
        const g: Genre = genre ?? 'all'
        const roundId = encodeRoundId(`u-${Date.now()}`, g, track.id)
        return json(
          {
            date,
            genre: g,
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
        const hits = searchMock(q).map((t) => ({
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

        const track = trackById(decoded.trackId)
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
        const track = trackById(decoded.trackId)
        if (!track) return json({ error: 'Unknown track' }, { status: 404 }, origin)
        return json({ track: toPublic(track), score: 0 }, {}, origin)
      }

      return json({ error: 'Not found' }, { status: 404 }, origin)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Server error'
      return json({ error: message }, { status: 500 }, origin)
    }
  },
} satisfies ExportedHandler
