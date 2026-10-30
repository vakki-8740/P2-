import { Icon } from '../icons/Icons.jsx'
import './ChoiceControls.css'

export function Checkbox({ id, label, checked, defaultChecked, onChange, disabled, indeterminate }) {
  const cid = id || `cb-${Math.random().toString(36).slice(2, 9)}`
  return (
    <label className={`own-choice${disabled ? ' is-disabled' : ''}`} htmlFor={cid}>
      <input
        id={cid}
        type="checkbox"
        className="own-choice__input own-sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        ref={(el) => { if (el) el.indeterminate = Boolean(indeterminate) }}
      />
      <span className={`own-check${indeterminate ? ' is-indeterminate' : ''}`}>
        {indeterminate ? <span className="own-check__dash" /> : <Icon name="check" size={13} />}
      </span>
      {label && <span className="own-choice__label">{label}</span>}
    </label>
  )
}

export function Radio({ id, name, label, value, checked, defaultChecked, onChange, disabled }) {
  const rid = id || `rd-${Math.random().toString(36).slice(2, 9)}`
  return (
    <label className={`own-choice${disabled ? ' is-disabled' : ''}`} htmlFor={rid}>
      <input
        id={rid}
        type="radio"
        name={name}
        value={value}
        className="own-choice__input own-sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="own-radio" />
      {label && <span className="own-choice__label">{label}</span>}
    </label>
  )
}

export function Switch({ id, label, checked, defaultChecked, onChange, disabled }) {
  const sid = id || `sw-${Math.random().toString(36).slice(2, 9)}`
  return (
    <label className={`own-choice${disabled ? ' is-disabled' : ''}`} htmlFor={sid}>
      <input
        id={sid}
        type="checkbox"
        role="switch"
        className="own-choice__input own-sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="own-switch"><span className="own-switch__knob" /></span>
      {label && <span className="own-choice__label">{label}</span>}
    </label>
  )
}
