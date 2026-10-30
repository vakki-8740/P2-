import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Carousel.css'

const SLIDES = [
  { id: 1, title: 'Ship faster', text: 'Copy production-ready components in seconds.', tone: 'var(--accent)' },
  { id: 2, title: 'Stay consistent', text: 'One token system drives every theme and state.', tone: 'var(--yes)' },
  { id: 3, title: 'Scale with confidence', text: 'Accessible, responsive and dependency-free.', tone: 'var(--warn)' },
]

export function Carousel() {
  const [i, setI] = useState(0)
  const go = (n) => setI((n + SLIDES.length) % SLIDES.length)
  return (
    <div className="own-carousel" aria-roledescription="carousel" aria-label="Features">
      <div className="own-carousel__viewport">
        <div className="own-carousel__track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s) => (
            <div key={s.id} className="own-carousel__slide" role="group" aria-label={s.title}>
              <span className="own-carousel__blob" style={{ background: s.tone }} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="own-carousel__controls">
        <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)}><Icon name="chevron-left" size={16} /></button>
        <div className="own-carousel__dots">
          {SLIDES.map((s, n) => (
            <button
              key={s.id}
              type="button"
              className={n === i ? 'is-active' : ''}
              aria-label={`Go to slide ${n + 1}`}
              aria-current={n === i}
              onClick={() => setI(n)}
            />
          ))}
        </div>
        <button type="button" aria-label="Next slide" onClick={() => go(i + 1)}><Icon name="chevron-right" size={16} /></button>
      </div>
    </div>
  )
}

export function RatingStars({ value = 4.2, count = 128, size = 18 }) {
  const full = Math.floor(value)
  return (
    <div className="own-rating-readout">
      <div className="own-rating-readout__stars" style={{ '--pct': `${(value / 5) * 100}%` }}>
        <span className="own-rating-readout__bg" aria-hidden="true">
          {Array.from({ length: 5 }, (_, n) => <Icon key={n} name="star" size={size} />)}
        </span>
        <span className="own-rating-readout__fg" aria-hidden="true">
          {Array.from({ length: 5 }, (_, n) => <Icon key={n} name="star" size={size} />)}
        </span>
      </div>
      <strong>{value.toFixed(1)}</strong>
      <span className="own-rating-readout__count">({count} reviews)</span>
    </div>
  )
}
