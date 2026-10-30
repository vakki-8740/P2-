import { Icon } from '../icons/Icons.jsx'
import './StatCard.css'

const STATS = [
  { id: 'revenue', label: 'Total revenue', value: '₹4,82,900', delta: '+12.4%', up: true, icon: 'credit-card' },
  { id: 'orders', label: 'Orders', value: '2,318', delta: '+8.1%', up: true, icon: 'cart' },
  { id: 'refunds', label: 'Refunds', value: '₹12,440', delta: '-3.2%', up: false, icon: 'logout' },
  { id: 'visitors', label: 'Visitors', value: '48.2k', delta: '+19.8%', up: true, icon: 'user' },
]

export function StatCard({ stat = STATS[0] }) {
  return (
    <article className="own-stat">
      <div className="own-stat__top">
        <span className="own-stat__icon"><Icon name={stat.icon} size={18} /></span>
        <span className={`own-stat__delta ${stat.up ? 'is-up' : 'is-down'}`}>{stat.delta}</span>
      </div>
      <strong className="own-stat__value">{stat.value}</strong>
      <span className="own-stat__label">{stat.label}</span>
    </article>
  )
}

export function StatCardGrid({ stats = STATS }) {
  return (
    <div className="own-stat-grid">
      {stats.map((s) => <StatCard key={s.id} stat={s} />)}
    </div>
  )
}
