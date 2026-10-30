import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './SearchInput.css'

const DEFAULT_ITEMS = ['Toast notifications', 'Data table', 'Login form', 'Modal dialog', 'Tabs', 'Tooltip', 'Pagination', 'Accordion', 'Product card', 'OTP input']

export default function SearchInput({ items = DEFAULT_ITEMS, placeholder = 'Search components...' }) {
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const hits = q ? items.filter((t) => t.toLowerCase().includes(q.toLowerCase())) : []
  const open = focused && q.length > 0

  return (
    <div className="own-search">
      <div className="own-search__bar">
        <Icon name="search" size={17} className="own-search__icon" />
        <input
          type="search"
          value={q}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
        />
        {q && (
          <button type="button" className="own-search__clear" aria-label="Clear search" onClick={() => setQ('')}>
            <Icon name="x" size={14} />
          </button>
        )}
        <kbd className="own-search__kbd" aria-hidden="true">/</kbd>
      </div>
      {open && (
        <ul className="own-search__list" role="listbox" aria-label="Suggestions">
          {hits.length === 0 && <li className="own-search__empty">No matches for “{q}”.</li>}
          {hits.map((t) => (
            <li key={t}>
              <button
                type="button"
                role="option"
                className="own-search__opt"
                onMouseDown={(e) => { e.preventDefault(); setQ(t) }}
              >
                <Icon name="search" size={14} /> {t}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
