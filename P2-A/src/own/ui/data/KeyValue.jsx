import './KeyValue.css'

const ROWS = [
  { k: 'Order number', v: '#ORD-2041' },
  { k: 'Placed on', v: '24 October 2026, 3:12 PM' },
  { k: 'Delivery to', v: 'Jaipur, Rajasthan — 302017' },
  { k: 'Payment', v: 'UPI ·•• 4021' },
  { k: 'Status', v: 'In transit' },
]

export default function KeyValue({ rows = ROWS }) {
  return (
    <dl className="own-keyvalue">
      {rows.map((r) => (
        <div key={r.k} className="own-keyvalue__row">
          <dt>{r.k}</dt>
          <dd>{r.v}</dd>
        </div>
      ))}
    </dl>
  )
}
