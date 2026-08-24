import { useState } from 'react'
import { ClipTimeline } from '../components/ClipTimeline'
import { GenreTabs } from '../components/GenreTabs'
import { GuessSlots } from '../components/GuessSlots'
import { PlayButton } from '../components/PlayButton'
import { RevealCard } from '../components/RevealCard'
import { SongSearch } from '../components/SongSearch'
import { useGameRound } from '../hooks/useGameRound'
import { STAGE_SECONDS, type Genre } from '../lib/types'

type Props = {
  mode: 'daily' | 'unlimited'
}

export const GamePage = ({ mode }: Props) => {
  const [genre, setGenre] = useState<Genre>('rock')
  const game = useGameRound({ mode, genre })
  const done = game.state?.status === 'won' || game.state?.status === 'lost'
  const lastStage = (game.state?.stageIndex ?? 0) >= STAGE_SECONDS.length - 1

  return (
    <div className="game-page">
      <header className="game-header">
        <h1>songify</h1>
        <p className="mode-label">{mode === 'daily' ? 'Daily challenge' : 'Unlimited'}</p>
      </header>

      <GenreTabs value={genre} onChange={setGenre} />

      {game.loading && <p className="status-line">Loading…</p>}
      {game.error && <p className="status-line error">{game.error}</p>}

      {game.state && (
        <>
          <GuessSlots attempts={game.state.attempts} />

          <ClipTimeline stageIndex={game.state.stageIndex} clipSeconds={game.clipSeconds} />

          <PlayButton
            playing={game.playing}
            disabled={done || !game.state.previewUrl}
            onClick={() => void game.play()}
          />

          {done && game.state.revealed ? (
            <RevealCard
              track={game.state.revealed}
              score={game.state.score}
              won={game.state.status === 'won'}
              onNext={mode === 'unlimited' ? game.nextUnlimited : undefined}
            />
          ) : (
            <SongSearch
              disabled={done}
              onSelect={(hit) => void game.guess(hit)}
              onSkip={() => void game.skip()}
              skipLabel={lastStage ? 'Give up' : 'Skip'}
            />
          )}
        </>
      )}
    </div>
  )
}
