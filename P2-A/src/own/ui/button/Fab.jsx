import { Icon } from '../icons/Icons.jsx'
import './Fab.css'

export default function Fab({ icon = 'plus', label, size = 'md', color = 'accent', onClick }) {
  return (
    <button
      type="button"
      className={`own-fab own-fab--${size} own-fab--${color}`}
      aria-label={label || icon}
      title={label || icon}
      onClick={onClick}
    >
      <Icon name={icon} size={size === 'sm' ? 17 : 22} />
      {label && size !== 'sm' && <span>{label}</span>}
    </button>
  )
}
