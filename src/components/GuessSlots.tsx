import { STAGE_SECONDS, type GuessAttempt } from '../lib/types'

type Props = {
  attempts: GuessAttempt[]
}

export const GuessSlots = ({ attempts }: Props) => {
  const slots = Array.from({ length: STAGE_SECONDS.length }, (_, i) => attempts[i] ?? null)

  return (
    <ul className="guess-slots">
      {slots.map((attempt, i) => (
        <li key={i} className={attempt ? `filled ${attempt.kind}` : 'empty'}>
          {attempt?.kind === 'skip' && 'Skipped'}
          {attempt?.kind === 'wrong' && attempt.label}
          {attempt?.kind === 'correct' && attempt.label}
        </li>
      ))}
    </ul>
  )
}
