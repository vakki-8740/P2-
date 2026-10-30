import { useState } from 'react'
import Input from '../input/Input.jsx'
import Button from '../button/Button.jsx'
import { Radio } from '../input/Checkbox.jsx'
import { Icon } from '../icons/Icons.jsx'
import './CheckoutForm.css'

const METHODS = [
  { id: 'upi', label: 'UPI', icon: 'phone' },
  { id: 'card', label: 'Credit / Debit card', icon: 'credit-card' },
  { id: 'cod', label: 'Cash on delivery', icon: 'shield' },
]

export function CheckoutForm() {
  const [method, setMethod] = useState('upi')
  const [done, setDone] = useState(false)
  if (done) {
    return (
      <div className="own-checkout-done" role="status">
        <Icon name="check-circle" size={30} />
        <h3>Order placed successfully</h3>
        <p>Confirmation sent to your email. Order ID: #ORD-2041</p>
        <Button variant="secondary" size="sm" onClick={() => setDone(false)}>Place another</Button>
      </div>
    )
  }
  return (
    <form className="own-checkout" onSubmit={(e) => { e.preventDefault(); setDone(true) }}>
      <h3 className="own-checkout__title">Contact details</h3>
      <Input label="Full name" placeholder="Aman Kumar" required />
      <Input label="Email" type="email" icon="mail" placeholder="you@example.com" required />
      <Input label="Address" placeholder="12, Civil Lines" required />
      <h3 className="own-checkout__title">Payment method</h3>
      <div className="own-checkout__methods" role="radiogroup" aria-label="Payment method">
        {METHODS.map((m) => (
          <label key={m.id} className={`own-checkout__method${method === m.id ? ' is-active' : ''}`}>
            <Radio name="pay" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
            <Icon name={m.icon} size={17} /> {m.label}
          </label>
        ))}
      </div>
      {method === 'card' && (
        <div className="own-checkout__card-fields">
          <Input label="Card number" icon="credit-card" placeholder="4242 4242 4242 4242" inputMode="numeric" />
          <div className="own-checkout__split">
            <Input label="Expiry" placeholder="MM/YY" />
            <Input label="CVC" placeholder="123" inputMode="numeric" />
          </div>
        </div>
      )}
      <Button type="submit" fullWidth iconRight="arrow-right">Pay ₹10,026</Button>
    </form>
  )
}
