type Props = {
  playing: boolean
  disabled?: boolean
  onClick: () => void
}

export const PlayButton = ({ playing, disabled, onClick }: Props) => {
  return (
    <button
      type="button"
      className="play-button"
      aria-label={playing ? 'Playing' : 'Play clip'}
      disabled={disabled}
      onClick={onClick}
    >
      {playing ? (
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  )
}
