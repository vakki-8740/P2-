import Button from '../button/Button.jsx'
import './Hero.css'

export default function Hero({ split = false }) {
  return (
    <section className={`own-hero${split ? ' own-hero--split' : ''}`}>
      <div className="own-hero__content">
        <span className="own-hero__eyebrow"><span className="own-hero__dot" /> Personal UI Design Library</span>
        <h1 className="own-hero__title">Design once. Reuse every component.</h1>
        <p className="own-hero__text">
          A complete visual reference with the same colors, typography, spacing and 6px radius. Open any component,
          preview its variants and copy production-ready code.
        </p>
        <div className="own-hero__actions">
          <Button iconRight="arrow-right" size="lg">Browse components</Button>
          <Button variant="secondary" size="lg">Read the docs</Button>
        </div>
      </div>
      <div className="own-hero__visual" aria-hidden="true">
        <div className="own-hero__tile own-hero__tile--1" />
        <div className="own-hero__tile own-hero__tile--2" />
        <div className="own-hero__tile own-hero__tile--3" />
      </div>
    </section>
  )
}
