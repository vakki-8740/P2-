import { Icon } from '../icons/Icons.jsx'
import './Breadcrumbs.css'

export default function Breadcrumbs({ items = [
  { label: 'Home', href: '#' },
  { label: 'Dashboard', href: '#' },
  { label: 'Analytics', href: '#' },
  { label: 'Weekly report' },
] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="own-crumbs">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item.label} className="own-crumbs__item">
              {item.href && !last ? (
                <a href={item.href} onClick={(e) => e.preventDefault()}>{item.label}</a>
              ) : (
                <span aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
              {!last && <Icon name="chevron-right" size={14} className="own-crumbs__sep" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
