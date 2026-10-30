import { Icon } from '../icons/Icons.jsx'
import './Button.css'

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger', 'success', 'outline']
const SIZES = ['sm', 'md', 'lg']

export default function Button({
  children = 'Button',
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  ...rest
}) {
  const cls = [
    'own-btn',
    `own-btn--${variant}`,
    `own-btn--${size}`,
    fullWidth ? 'own-btn--block' : '',
    loading ? 'own-btn--loading' : '',
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} type={type} disabled={disabled || loading} {...rest}>
      {loading && <span className="own-btn__spinner" aria-hidden="true" />}
      {!loading && icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      <span>{children}</span>
      {!loading && iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 17} />}
    </button>
  )
}

Button.variants = VARIANTS
Button.sizes = SIZES
