import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './RatingInput.css'

export default function RatingInput({ max = 5, defaultValue = 0, label = 'Rate this page' }) {
  const [rating, setRating] = useState(defaultValue)
  const [hover, setHover] = useState(0)
  const shown = hover || rating
  return (
    <div className="own-rating">
      <span className="own-rating__label">{label}</span>
      <div className="own-rating__stars" role="radiogroup" aria-label={label}>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={`own-rating__star${n <= shown ? ' is-on' : ''}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
          >
            <Icon name="star" size={22} />
          </button>
        ))}
      </div>
      <span className="own-rating__text">{rating > 0 ? `${rating} / ${max}` : 'Not rated yet'}</span>
    </div>
  )
}
