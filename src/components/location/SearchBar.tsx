import { useEffect, useId, useRef, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { useLocationSearch } from '@/hooks/useLocationSearch'
import type { MapLocation } from '@/types/location'

interface SearchBarProps {
  onSelect: (location: MapLocation) => void
}

/**
 * Location search with debounced worldwide suggestions (combobox pattern).
 * Keyboard: ArrowUp/Down/Home/End to move, Enter to select, Escape to dismiss.
 */
export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const { data, isFetching, isError, refetch } = useLocationSearch(query)
  const listId = useId()
  const statusId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const results = data ?? []

  useEffect(() => {
    setActiveIndex(-1)
    setOpen(query.trim().length >= 2)
  }, [query])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function choose(location: MapLocation) {
    onSelect(location)
    setQuery('')
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' && results.length > 0) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (i + 1) % results.length)
    } else if (event.key === 'ArrowUp' && results.length > 0) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (i - 1 + results.length) % results.length)
    } else if (event.key === 'Home' && results.length > 0) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(0)
    } else if (event.key === 'End' && results.length > 0) {
      event.preventDefault()
      setOpen(true)
      setActiveIndex(results.length - 1)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      const picked = results[activeIndex]
      if (picked) choose(picked)
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && query.trim().length >= 2
  const statusText = isFetching
    ? 'Searching…'
    : isError
      ? 'Search failed'
      : `${results.length} suggestion${results.length === 1 ? '' : 's'}`

  return (
    <div ref={containerRef} className="relative w-full sm:max-w-md">
      <label htmlFor="location-search" className="sr-only">
        Search for a city or location
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-[22px] top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]"
      />
      <input
        id="location-search"
        type="text"
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Ask anywhere… (e.g. Cebu City)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(query.trim().length >= 2)}
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false)
          }
        }}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-describedby={statusId}
        aria-activedescendant={
          activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        className="w-full min-h-10 rounded-lg border border-[var(--mist)] bg-[var(--surface)] py-2 pl-[52px] pr-9 text-sm placeholder:text-[var(--ink-muted)]"
      />
      {/* Polite suggestion-count announcements (not nested in the listbox). */}
      <span id={statusId} role="status" className="sr-only">
        {showList ? statusText : ''}
      </span>
      {isFetching ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2
            aria-hidden="true"
            className="h-4 w-4 animate-spin text-[var(--ink-muted)]"
          />
          <span className="sr-only">Searching…</span>
        </span>
      ) : (
        query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 flex min-h-10 min-w-10 -translate-y-1/2 items-center justify-center rounded-full text-[var(--ink-muted)] hover:opacity-80"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )
      )}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Location suggestions"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-[var(--mist)] bg-[var(--surface)] py-1"
        >
          {isError ? (
            <li role="presentation" className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-300">
              <span>Search failed. Check your connection.</span>
              <button
                type="button"
                onClick={() => void refetch()}
                className="min-h-10 shrink-0 rounded-lg border border-[var(--mist)] px-2 text-xs font-medium hover:bg-[var(--surface-muted)] "
              >
                Try again
              </button>
            </li>
          ) : results.length === 0 && !isFetching ? (
            <li role="presentation" className="px-3 py-2 text-sm text-[var(--ink-muted)]">
              No locations found for “{query.trim()}”. Try another name.
            </li>
          ) : (
            results.map((location, index) => (
              <li
                key={location.id}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => choose(location)}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full cursor-pointer flex-col px-3 py-2 text-left text-sm hover:bg-[var(--surface-muted)] ${
                  index === activeIndex ? 'bg-[var(--mist)]' : ''
                }`}
              >
                <span className="font-medium">{location.name}</span>
                <span className="text-xs text-[var(--ink-muted)]">
                  {[location.region, location.country]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}


