import { Icon } from '../icons/Icons.jsx'
import './IconButton.css'

export default function IconButton({
  icon = 'bell',
  label,
  variant = 'plain',
  size = 'md',
  badge,
  ...rest
}) {
  const px = size === 'sm' ? 15 : size === 'lg' ? 23 : 19
  return (
    <button
      type="button"
      className={`own-iconbtn own-iconbtn--${variant} own-iconbtn--${size}`}
      aria-label={label || icon}
      title={label || icon}
      {...rest}
    >
      <Icon name={icon} size={px} />
      {badge != null && <span className="own-iconbtn__badge">{badge}</span>}
    </button>
  )
}
