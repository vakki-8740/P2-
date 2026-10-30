import { useEffect, useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './ProductGallery.css'

const SHADES = ['var(--accent)', 'var(--yes)', 'var(--warn)', 'var(--no)']

export default function ProductGallery() {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="own-gallery">
      <button type="button" className="own-gallery__main" aria-label="Open image preview" onClick={() => setLightbox(true)}>
        <span style={{ background: SHADES[active] }} />
        <span className="own-gallery__zoom"><Icon name="image" size={20} /></span>
      </button>
      <div className="own-gallery__thumbs">
        {SHADES.map((s, i) => (
          <button
            key={s}
            type="button"
            className={i === active ? 'is-active' : ''}
            aria-label={`View image ${i + 1}`}
            aria-current={i === active}
            onClick={() => setActive(i)}
          >
            <span style={{ background: s }} />
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="own-gallery__lightbox" role="dialog" aria-modal="true" aria-label="Image preview" onClick={() => setLightbox(false)}>
          <button type="button" className="own-gallery__close" aria-label="Close preview"><Icon name="x" size={18} /></button>
          <span className="own-gallery__big" style={{ background: SHADES[active] }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
