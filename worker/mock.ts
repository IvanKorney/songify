import type { Genre, TrackSecret } from './types'

/** Demo catalog — replace with Spotify + Deezer later */
export const MOCK_TRACKS: TrackSecret[] = [
  {
    id: 'mock-rock-1',
    title: 'Seven Nation Army',
    artists: ['The White Stripes'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'seven nation army|the white stripes',
  },
  {
    id: 'mock-rock-2',
    title: 'Smells Like Teen Spirit',
    artists: ['Nirvana'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'smells like teen spirit|nirvana',
  },
  {
    id: 'mock-hiphop-1',
    title: 'Lose Yourself',
    artists: ['Eminem'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'lose yourself|eminem',
  },
  {
    id: 'mock-hiphop-2',
    title: 'HUMBLE.',
    artists: ['Kendrick Lamar'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'humble|kendrick lamar',
  },
  {
    id: 'mock-pop-1',
    title: 'Blinding Lights',
    artists: ['The Weeknd'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'blinding lights|the weeknd',
  },
  {
    id: 'mock-pop-2',
    title: 'Levitating',
    artists: ['Dua Lipa'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'levitating|dua lipa',
  },
  {
    id: 'mock-all-1',
    title: 'Bohemian Rhapsody',
    artists: ['Queen'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'bohemian rhapsody|queen',
  },
  {
    id: 'mock-country-1',
    title: 'Jolene',
    artists: ['Dolly Parton'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'jolene|dolly parton',
  },
  {
    id: 'mock-country-2',
    title: 'Take Me Home, Country Roads',
    artists: ['John Denver'],
    albumArtUrl: null,
    previewUrl: 'https://mdn.github.io/webaudio-examples/audio-basics/outfoxing.mp3',
    externalUrl: 'https://open.spotify.com/',
    answerKey: 'take me home, country roads|john denver',
  },
]

const BY_GENRE: Record<Genre, string[]> = {
  all: ['mock-all-1', 'mock-rock-1', 'mock-pop-1', 'mock-hiphop-1', 'mock-country-1'],
  rock: ['mock-rock-1', 'mock-rock-2'],
  hiphop: ['mock-hiphop-1', 'mock-hiphop-2'],
  pop: ['mock-pop-1', 'mock-pop-2'],
  country: ['mock-country-1', 'mock-country-2'],
}

const hash = (input: string): number => {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const trackById = (id: string): TrackSecret | undefined => {
  return MOCK_TRACKS.find((t) => t.id === id)
}

export const dailyTrack = (date: string, genre: Genre): TrackSecret => {
  const pool = BY_GENRE[genre]
    .map((id) => trackById(id))
    .filter((t): t is TrackSecret => Boolean(t))
  const idx = hash(`${date}:${genre}`) % pool.length
  return pool[idx]!
}

export const searchMock = (query: string, limit = 8): TrackSecret[] => {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return MOCK_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.artists.some((a) => a.toLowerCase().includes(q)),
  ).slice(0, limit)
}

export const randomUnlimited = (genre?: Genre): TrackSecret => {
  const pool =
    genre && genre !== 'all'
      ? BY_GENRE[genre]
          .map((id) => trackById(id))
          .filter((t): t is TrackSecret => Boolean(t))
      : MOCK_TRACKS
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]!
}

export const toPublic = (track: TrackSecret) => {
  const { answerKey: _, ...pub } = track
  return pub
}
