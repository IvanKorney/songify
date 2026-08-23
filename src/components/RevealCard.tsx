import type { TrackPublic } from '../lib/types'

type Props = {
  track: TrackPublic
  score: number
  won: boolean
  onNext?: () => void
}

export const RevealCard = ({ track, score, won, onNext }: Props) => {
  return (
    <div className={`reveal-card ${won ? 'won' : 'lost'}`}>
      <p className="reveal-status">{won ? `Correct · ${score} pts` : 'Out of skips'}</p>
      <h2>{track.title}</h2>
      <p>{track.artists.join(', ')}</p>
      {track.externalUrl && (
        <a href={track.externalUrl} target="_blank" rel="noreferrer">
          Open on Spotify
        </a>
      )}
      {onNext && (
        <button type="button" className="next-button" onClick={onNext}>
          Next song
        </button>
      )}
    </div>
  )
}
