import type { Genre } from '../lib/types'
import { GENRES } from '../lib/types'

type Props = {
  value: Genre
  onChange: (genre: Genre) => void
}

export const GenreTabs = ({ value, onChange }: Props) => {
  return (
    <div className="genre-tabs" role="tablist" aria-label="Genre">
      {GENRES.map((g) => (
        <button
          key={g.id}
          type="button"
          role="tab"
          aria-selected={value === g.id}
          className={value === g.id ? 'active' : undefined}
          onClick={() => onChange(g.id)}
        >
          {g.label}
        </button>
      ))}
    </div>
  )
}
