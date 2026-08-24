import { STAGE_SECONDS } from '../lib/types'

type Props = {
  stageIndex: number
  clipSeconds: number
}

export const ClipTimeline = ({ stageIndex, clipSeconds }: Props) => {
  const label =
    clipSeconds < 1 ? `${clipSeconds} seconds` : `${clipSeconds} second${clipSeconds === 1 ? '' : 's'}`

  return (
    <div className="clip-timeline">
      <div className="clip-marker" style={{ left: markerLeft(stageIndex) }}>
        <span>{label}</span>
        <i aria-hidden />
      </div>
      <div className="clip-bar" role="img" aria-label={`Clip length ${label}`}>
        {STAGE_SECONDS.map((sec, i) => (
          <div
            key={sec}
            className={i <= stageIndex ? 'segment active' : 'segment'}
            style={{ flex: Math.max(sec, 0.35) }}
          />
        ))}
      </div>
    </div>
  )
}

const markerLeft = (stageIndex: number) => {
  const weights = STAGE_SECONDS.map((s) => Math.max(s, 0.35))
  const total = weights.reduce((a, b) => a + b, 0)
  let before = 0
  for (let i = 0; i < stageIndex; i++) before += weights[i]!
  const mid = before + weights[stageIndex]! / 2
  return `${(mid / total) * 100}%`
}
