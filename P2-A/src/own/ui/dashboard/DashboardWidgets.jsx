import { Icon } from '../icons/Icons.jsx'
import { Badge } from '../feedback/Alert.jsx'
import './DashboardWidgets.css'

export function WalletCard() {
  return (
    <article className="own-wallet">
      <div className="own-wallet__top">
        <div>
          <span className="own-wallet__label">Total balance</span>
          <strong className="own-wallet__balance">₹1,24,580<span>.00</span></strong>
        </div>
        <Icon name="credit-card" size={26} className="own-wallet__icon" />
      </div>
      <div className="own-wallet__num">•••• •••• •••• 4021</div>
      <div className="own-wallet__actions">
        <button type="button"><Icon name="plus" size={15} /> Add money</button>
        <button type="button"><Icon name="send" size={15} /> Send</button>
      </div>
    </article>
  )
}

const TX = [
  { id: 1, name: 'Monthly subscription', meta: 'Today · UPI', amount: '−₹499', tone: 'down', icon: 'credit-card' },
  { id: 2, name: 'Payment received', meta: 'Yesterday · Aman Kumar', amount: '+₹8,200', tone: 'up', icon: 'arrow-right' },
  { id: 3, name: 'Figma license', meta: '22 Oct · Card', amount: '−₹1,240', tone: 'down', icon: 'shield' },
  { id: 4, name: 'Refund processed', meta: '20 Oct · Wallet', amount: '+₹899', tone: 'up', icon: 'logout' },
]

export function TransactionList() {
  return (
    <div className="own-tx own-card">
      <div className="own-tx__head">
        <h3>Recent transactions</h3>
        <button type="button" className="own-tx__view">View all</button>
      </div>
      <ul>
        {TX.map((t) => (
          <li key={t.id} className="own-tx__row">
            <span className="own-tx__icon"><Icon name={t.icon} size={16} /></span>
            <div className="own-tx__meta">
              <strong>{t.name}</strong>
              <span>{t.meta}</span>
            </div>
            <span className={`own-tx__amount own-tx__amount--${t.tone}`}>{t.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function NotificationFeed() {
  const notes = [
    { id: 1, icon: 'cart', tone: 'accent', title: 'New order #ORD-2041', time: '2 min ago', unread: true },
    { id: 2, icon: 'user', tone: 'success', title: 'Priya accepted your invite', time: '1 hour ago', unread: true },
    { id: 3, icon: 'alert-triangle', tone: 'warning', title: 'Storage 80% full', time: 'Yesterday', unread: false },
    { id: 4, icon: 'check-circle', tone: 'neutral', title: 'Backup completed', time: '2 days ago', unread: false },
  ]
  return (
    <div className="own-notif own-card">
      <div className="own-notif__head">
        <h3>Notifications</h3>
        <Badge tone="accent">2 new</Badge>
      </div>
      <ul>
        {notes.map((n) => (
          <li key={n.id} className={`own-notif__row${n.unread ? ' is-unread' : ''}`}>
            <span className={`own-notif__icon own-notif__icon--${n.tone}`}><Icon name={n.icon} size={16} /></span>
            <div className="own-notif__meta">
              <strong>{n.title}</strong>
              <span>{n.time}</span>
            </div>
            {n.unread && <span className="own-notif__dot" aria-label="Unread" />}
          </li>
        ))}
      </ul>
    </div>
  )
}
