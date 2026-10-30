import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Cart.css'

const INITIAL = [
  { id: 1, name: 'Wireless Headphones', variant: 'Matte Black', price: 3499, qty: 1 },
  { id: 2, name: 'USB-C Hub 7-in-1', variant: 'Space Grey', price: 2499, qty: 2 },
]

export function CartItems() {
  const [items, setItems] = useState(INITIAL)
  const setQty = (id, delta) => setItems((cur) => cur.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id))

  if (items.length === 0) {
    return <div className="own-cart-empty"><Icon name="cart" size={26} /><p>Your cart is empty.</p></div>
  }

  return (
    <ul className="own-cart">
      {items.map((i) => (
        <li key={i.id} className="own-cart__item">
          <span className="own-cart__thumb"><Icon name="image" size={20} /></span>
          <div className="own-cart__meta">
            <strong>{i.name}</strong>
            <span>{i.variant}</span>
            <div className="own-cart__qty">
              <button type="button" aria-label={`Decrease quantity of ${i.name}`} onClick={() => setQty(i.id, -1)}><Icon name="minus" size={13} /></button>
              <span aria-live="polite">{i.qty}</span>
              <button type="button" aria-label={`Increase quantity of ${i.name}`} onClick={() => setQty(i.id, 1)}><Icon name="plus" size={13} /></button>
            </div>
          </div>
          <div className="own-cart__right">
            <strong>₹{(i.price * i.qty).toLocaleString('en-IN')}</strong>
            <button type="button" className="own-cart__remove" aria-label={`Remove ${i.name}`} onClick={() => remove(i.id)}>
              <Icon name="trash" size={15} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function OrderSummary() {
  return (
    <div className="own-summary own-card">
      <h3>Order summary</h3>
      <div className="own-summary__row"><span>Items (3)</span><span>₹8,497</span></div>
      <div className="own-summary__row"><span>Shipping</span><span className="own-summary__free">Free</span></div>
      <div className="own-summary__row"><span>Taxes</span><span>₹1,529</span></div>
      <hr />
      <div className="own-summary__row own-summary__total"><strong>Total</strong><strong>₹10,026</strong></div>
    </div>
  )
}
