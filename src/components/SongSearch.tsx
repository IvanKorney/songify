import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import { queryKeys, searchTracks } from '../lib/api'
import type { SearchHit } from '../lib/types'

type Props = {
  disabled?: boolean
  onSelect: (hit: SearchHit) => void
  onSkip: () => void
  skipLabel?: string
}

export const SongSearch = ({ disabled, onSelect, onSkip, skipLabel = 'Skip' }: Props) => {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const listId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200)
    return () => clearTimeout(t)
  }, [query])

  const searchQuery = useQuery({
    queryKey: queryKeys.search(debounced),
    queryFn: () => searchTracks(debounced),
    enabled: debounced.length > 0,
  })

  const hits = searchQuery.data?.hits ?? []

  useEffect(() => {
    if (hits.length) setOpen(true)
  }, [hits])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="song-search" ref={wrapRef}>
      <div className="song-search-row">
        <label className="search-field">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path
              d="M10.5 3a7.5 7.5 0 015.95 12.06l3.75 3.74-1.4 1.4-3.74-3.75A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z"
              fill="currentColor"
            />
          </svg>
          <input
            type="search"
            placeholder="Search a song"
            value={query}
            disabled={disabled}
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={open}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hits.length && setOpen(true)}
          />
        </label>
        <button type="button" className="skip-button" disabled={disabled} onClick={onSkip}>
          {skipLabel}
        </button>
      </div>
      {open && hits.length > 0 && (
        <ul id={listId} className="search-results" role="listbox">
          {hits.map((hit) => (
            <li key={hit.id} role="option">
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  onSelect(hit)
                  setQuery('')
                  setDebounced('')
                  setOpen(false)
                }}
              >
                <strong>{hit.title}</strong>
                <span>{hit.artists.join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
