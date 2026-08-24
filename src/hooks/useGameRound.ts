import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchDaily,
  fetchUnlimited,
  queryKeys,
  revealTrack,
  submitGuess,
} from '../lib/api'
import { createClipPlayer } from '../lib/audio'
import { loadDailyState, saveDailyState } from '../lib/storage'
import {
  STAGE_SECONDS,
  type Genre,
  type GuessAttempt,
  type RoundState,
  type SearchHit,
  type TrackPublic,
} from '../lib/types'

const emptyRound = (
  puzzle: {
    date: string
    genre: Genre
    roundId: string
    previewUrl: string | null
  },
): RoundState => {
  return {
    date: puzzle.date,
    genre: puzzle.genre,
    roundId: puzzle.roundId,
    previewUrl: puzzle.previewUrl,
    stageIndex: 0,
    attempts: [],
    status: 'playing',
    score: 0,
    revealed: null,
  }
}

type Options = {
  mode: 'daily' | 'unlimited'
  genre: Genre
}

export const useGameRound = ({ mode, genre }: Options) => {
  const queryClient = useQueryClient()
  const [state, setState] = useState<RoundState | null>(null)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef(createClipPlayer())

  const puzzleQuery = useQuery({
    queryKey: mode === 'daily' ? queryKeys.daily(genre) : queryKeys.unlimited(genre),
    queryFn: () => (mode === 'daily' ? fetchDaily(genre) : fetchUnlimited(genre)),
  })

  useEffect(() => {
    const puzzle = puzzleQuery.data
    if (!puzzle) return
    if (mode === 'daily') {
      const saved = loadDailyState(puzzle.date, genre)
      setState(saved && saved.roundId === puzzle.roundId ? saved : emptyRound(puzzle))
    } else {
      setState(emptyRound(puzzle))
    }
  }, [puzzleQuery.data, mode, genre])

  useEffect(() => {
    return () => playerRef.current.dispose()
  }, [])

  useEffect(() => {
    if (!state?.previewUrl) return
    const loadPreview = async () => {
      try {
        await playerRef.current.load(state.previewUrl!)
      } catch {
        setError('Preview failed')
      }
    }
    void loadPreview()
  }, [state?.previewUrl])

  const persist = useCallback(
    (next: RoundState) => {
      setState(next)
      if (mode === 'daily') saveDailyState(next)
    },
    [mode],
  )

  const clipSeconds = useMemo(() => {
    if (!state) return STAGE_SECONDS[0]
    return STAGE_SECONDS[Math.min(state.stageIndex, STAGE_SECONDS.length - 1)]
  }, [state])

  const play = useCallback(async () => {
    if (!state || state.status !== 'playing') return
    setPlaying(true)
    setError(null)
    try {
      await playerRef.current.playClip(clipSeconds)
    } catch {
      setError('Playback failed')
    } finally {
      setTimeout(() => setPlaying(false), clipSeconds * 1000 + 50)
    }
  }, [state, clipSeconds])

  const revealMutation = useMutation({
    mutationFn: (roundId: string) => revealTrack(roundId),
  })

  const guessMutation = useMutation({
    mutationFn: (vars: { roundId: string; trackId: string; stageIndex: number }) =>
      submitGuess(vars.roundId, vars.trackId, vars.stageIndex),
  })

  const advance = useCallback(
    async (attempt: GuessAttempt, revealed?: TrackPublic, score = 0) => {
      if (!state) return
      const attempts = [...state.attempts, attempt]
      const nextStage = state.stageIndex + 1
      const exhausted = nextStage >= STAGE_SECONDS.length

      if (attempt.kind === 'correct' && revealed) {
        persist({
          ...state,
          attempts,
          status: 'won',
          score,
          revealed,
        })
        playerRef.current.stop()
        return
      }

      if (exhausted) {
        const reveal = await revealMutation.mutateAsync(state.roundId)
        persist({
          ...state,
          attempts,
          stageIndex: STAGE_SECONDS.length - 1,
          status: 'lost',
          score: 0,
          revealed: reveal.track,
        })
        playerRef.current.stop()
        return
      }

      persist({
        ...state,
        attempts,
        stageIndex: nextStage,
      })
    },
    [state, persist, revealMutation],
  )

  const skip = useCallback(async () => {
    if (!state || state.status !== 'playing') return
    await advance({ kind: 'skip' })
  }, [state, advance])

  const guess = useCallback(
    async (hit: SearchHit) => {
      if (!state || state.status !== 'playing') return
      const result = await guessMutation.mutateAsync({
        roundId: state.roundId,
        trackId: hit.id,
        stageIndex: state.stageIndex,
      })
      const label = `${hit.title} — ${hit.artists.join(', ')}`
      if (result.correct) {
        await advance({ kind: 'correct', label }, result.track, result.score)
      } else {
        await advance({ kind: 'wrong', label })
      }
    },
    [state, advance, guessMutation],
  )

  const nextUnlimited = useCallback(() => {
    if (mode !== 'unlimited') return
    void queryClient.invalidateQueries({ queryKey: queryKeys.unlimited(genre) })
  }, [mode, genre, queryClient])

  const reload = useCallback(() => {
    void puzzleQuery.refetch()
  }, [puzzleQuery])

  return {
    state,
    loading: puzzleQuery.isLoading || (!state && puzzleQuery.isFetching),
    error:
      error ??
      puzzleQuery.error?.message ??
      guessMutation.error?.message ??
      revealMutation.error?.message ??
      null,
    playing,
    clipSeconds,
    play,
    skip,
    guess,
    nextUnlimited,
    reload,
  }
}
