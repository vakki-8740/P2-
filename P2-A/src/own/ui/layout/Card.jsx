import { Icon } from '../icons/Icons.jsx'
import Button from '../button/Button.jsx'
import './Card.css'

export default function Card({ title = 'Project overview', text = 'Track progress, milestones and team activity in one place.', footer = true, elevated = false }) {
  return (
    <article className={`own-card-card${elevated ? ' is-elevated' : ''}`}>
      <div className="own-card-card__media"><Icon name="layers" size={26} /></div>
      <div className="own-card-card__body">
        <h3 className="own-card-card__title">{title}</h3>
        <p className="own-card-card__text">{text}</p>
        {footer && (
          <div className="own-card-card__footer">
            <Button size="sm">Open</Button>
            <Button size="sm" variant="ghost">Details</Button>
          </div>
        )}
      </div>
    </article>
  )
}
