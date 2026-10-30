import { useState } from 'react'
import './Tabs.css'

const TABS = [
  { id: 'overview', label: 'Overview', body: 'Overview panel — account summary and quick stats for Aman Kumar.' },
  { id: 'billing', label: 'Billing', body: 'Billing panel — invoices, payment methods and plan history.' },
  { id: 'team', label: 'Team', body: 'Team panel — members, roles and pending invitations.' },
  { id: 'settings', label: 'Settings', body: 'Settings panel — workspace preferences and integrations.' },
]

export default function Tabs({ variant = 'underline' }) {
  const [active, setActive] = useState(TABS[0].id)
  const onKeyDown = (e, i) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    setActive(TABS[next].id)
    e.currentTarget.parentElement.children[next].focus()
  }
  const current = TABS.find((t) => t.id === active)
  return (
    <div className={`own-tabs own-tabs--${variant}`}>
      <div className="own-tabs__list" role="tablist" aria-label="Account sections">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className={`own-tabs__tab${active === t.id ? ' is-active' : ''}`}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="own-tabs__panel" role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`}>
        {current.body}
      </div>
    </div>
  )
}
