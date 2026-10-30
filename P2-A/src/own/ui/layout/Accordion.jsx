import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Accordion.css'

const ITEMS = [
  { id: 'a1', title: 'How do I copy a component?', text: 'Open any component, switch to the Code tab and press Copy. The snippet includes only the component markup and its styles.' },
  { id: 'a2', title: 'Does dark mode work in every component?', text: 'Yes. All components use shared design tokens, so every theme — including dark — applies automatically.' },
  { id: 'a3', title: 'Can I use these in a React project?', text: 'Every component is a real React component with co-located CSS. Copy the JSX and CSS, or import it directly from this library.' },
  { id: 'a4', title: 'Are external fonts or icons required?', text: 'No. Icons are inline SVG components and typography uses the system font stack, so there are no external requests.' },
]

export default function Accordion({ multiple = false }) {
  const [open, setOpen] = useState(multiple ? ['a1'] : 'a1')
  const toggle = (id) => {
    if (multiple) setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
    else setOpen((cur) => (cur === id ? null : id))
  }
  return (
    <div className="own-accordion">
      {ITEMS.map((item) => {
        const isOpen = multiple ? open.includes(item.id) : open === item.id
        return (
          <div key={item.id} className="own-accordion__item">
            <h3>
              <button
                type="button"
                className="own-accordion__head"
                aria-expanded={isOpen}
                aria-controls={`panel-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                {item.title}
                <Icon name="chevron-down" size={17} className={`own-accordion__chev${isOpen ? ' is-open' : ''}`} />
              </button>
            </h3>
            <div id={`panel-${item.id}`} className="own-accordion__panel" hidden={!isOpen} role="region">
              <p>{item.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
