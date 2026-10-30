import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import { Badge } from '../feedback/Alert.jsx'
import { RatingStars } from '../data/Carousel.jsx'
import Button from '../button/Button.jsx'
import './ProductCard.css'

export function ProductCard({ name = 'Wireless Headphones', price = '₹3,499', oldPrice = '₹4,999', badge = 'Bestseller' }) {
  const [liked, setLiked] = useState(false)
  return (
    <article className="own-product">
      <div className="own-product__media">
        <Icon name="image" size={34} />
        {badge && <span className="own-product__badge"><Badge tone="accent">{badge}</Badge></span>}
        <button
          type="button"
          className={`own-product__wish${liked ? ' is-on' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
        >
          <Icon name="heart" size={17} />
        </button>
      </div>
      <div className="own-product__body">
        <h3 className="own-product__title">{name}</h3>
        <RatingStars value={4.3} count={214} size={15} />
        <div className="own-product__price">
          <strong>{price}</strong>
          {oldPrice && <span className="own-product__old">{oldPrice}</span>}
        </div>
        <Button size="sm" icon="cart" fullWidth>Add to cart</Button>
      </div>
    </article>
  )
}

export function PriceBreakdown() {
  const rows = [
    { k: 'Subtotal', v: '₹6,998' },
    { k: 'Discount (10%)', v: '−₹700', accent: true },
    { k: 'Delivery', v: 'FREE', accent: true },
    { k: 'GST (18%)', v: '₹1,134' },
  ]
  return (
    <div className="own-price">
      {rows.map((r) => (
        <div key={r.k} className="own-price__row">
          <span>{r.k}</span>
          <span className={r.accent ? 'own-price__accent' : ''}>{r.v}</span>
        </div>
      ))}
      <hr className="own-price__divider" />
      <div className="own-price__row own-price__total">
        <strong>Total</strong>
        <strong>₹7,432</strong>
      </div>
    </div>
  )
}

export function CouponField() {
  const [code, setCode] = useState('')
  const [state, setState] = useState('idle')
  const apply = () => {
    if (!code.trim()) return
    setState(code.toUpperCase() === 'SAVE10' ? 'ok' : 'bad')
  }
  return (
    <div className="own-coupon">
      <div className="own-coupon__row">
        <Icon name="tag" size={17} />
        <input
          value={code}
          placeholder="Enter coupon (try SAVE10)"
          aria-label="Coupon code"
          onChange={(e) => { setCode(e.target.value); setState('idle') }}
        />
        <Button size="sm" variant="outline" onClick={apply}>Apply</Button>
      </div>
      {state === 'ok' && <p className="own-coupon__msg own-coupon__msg--ok" role="status"><Icon name="check-circle" size={15} /> Coupon applied — 10% off</p>}
      {state === 'bad' && <p className="own-coupon__msg own-coupon__msg--bad" role="alert"><Icon name="x-circle" size={15} /> Invalid coupon code</p>}
    </div>
  )
}
