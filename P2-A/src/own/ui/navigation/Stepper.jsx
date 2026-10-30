import { Icon } from '../icons/Icons.jsx'
import './Stepper.css'

const STEPS = ['Account', 'Profile', 'Payment', 'Review']

export default function Stepper({ current = 2, vertical = false }) {
  return (
    <ol className={`own-stepper${vertical ? ' own-stepper--vertical' : ''}`}>
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className={`own-stepper__item${done ? ' is-done' : ''}${active ? ' is-active' : ''}`}>
            <span className="own-stepper__dot">
              {done ? <Icon name="check" size={13} /> : i + 1}
            </span>
            <span className="own-stepper__label">{label}</span>
            {i < STEPS.length - 1 && <span className="own-stepper__bar" />}
          </li>
        )
      })}
    </ol>
  )
}
