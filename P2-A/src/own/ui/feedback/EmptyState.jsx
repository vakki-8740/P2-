import { Icon } from '../icons/Icons.jsx'
import Button from '../button/Button.jsx'
import './EmptyState.css'

export default function EmptyState({ icon = 'search', title = 'Nothing here yet', text, actionLabel, onAction }) {
  return (
    <div className="own-empty">
      <span className="own-empty__icon"><Icon name={icon} size={26} /></span>
      <h3 className="own-empty__title">{title}</h3>
      {text && <p className="own-empty__text">{text}</p>}
      {actionLabel && <Button size="sm" icon="plus" onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
