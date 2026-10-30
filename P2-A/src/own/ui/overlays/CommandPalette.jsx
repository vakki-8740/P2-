import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './CommandPalette.css'

const ITEMS = [
  { id: 'new', label: 'New project', kbd: 'P', icon: 'plus' },
  { id: 'open', label: 'Open settings', kbd: 'S', icon: 'settings' },
  { id: 'invite', label: 'Invite teammate', kbd: 'I', icon: 'user' },
  { id: 'export', label: 'Export data', kbd: 'E', icon: 'upload' },
  { id: 'theme', label: 'Toggle theme', kbd: 'T', icon: 'sun' },
  { id: 'shortcuts', label: 'View shortcuts', kbd: '?', icon: 'info' },
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const [picked, setPicked] = useState(null)
  const inputRef = useRef(null)
  const shown = useMemo(() => ITEMS.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())), [q])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o) }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 30) } }, [open])
  useEffect(() => setActive(0), [q])

  const pick = (item) => {
    setPicked(item.label)
    setOpen(false)
    setTimeout(() => setPicked(null), 2000)
  }

  const onListKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(shown.length - 1, a + 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    if (e.key === 'Enter' && shown[active]) pick(shown[active])
  }

  return (
    <>
      <button type="button" className="own-cmd__trigger" onClick={() => setOpen(true)}>
        <Icon name="search" size={15} />
        <span>Quick actions</span>
        <kbd>Ctrl K</kbd>
      </button>
      {picked && <p className="own-cmd__picked" role="status">{picked} selected</p>}
      {open && (
        <div className="own-cmd__scrim" onMouseDown={() => setOpen(false)}>
          <div className="own-cmd" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()}>
            <div className="own-cmd__search">
              <Icon name="search" size={17} />
              <input
                ref={inputRef}
                value={q}
                placeholder="Type a command…"
                aria-label="Command"
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onListKey}
              />
            </div>
            <ul className="own-cmd__list" role="listbox">
              {shown.length === 0 && <li className="own-cmd__empty">No commands found</li>}
              {shown.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    className={`own-cmd__item${i === active ? ' is-active' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(item)}
                  >
                    <Icon name={item.icon} size={16} />
                    <span>{item.label}</span>
                    <kbd>{item.kbd}</kbd>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
