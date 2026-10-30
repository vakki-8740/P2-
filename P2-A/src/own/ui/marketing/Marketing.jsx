import { Icon } from '../icons/Icons.jsx'
import Button from '../button/Button.jsx'
import { Badge } from '../feedback/Alert.jsx'
import Accordion from '../layout/Accordion.jsx'
import './Marketing.css'

const PLANS = [
  { id: 'free', name: 'Free', price: '₹0', period: '/mo', features: ['3 projects', 'Community support', 'Basic components'], cta: 'Get started', featured: false },
  { id: 'pro', name: 'Pro', price: '₹1,240', period: '/mo', features: ['Unlimited projects', 'All 80+ components', 'Priority support', '12 themes'], cta: 'Start Pro trial', featured: true },
  { id: 'team', name: 'Team', price: '₹4,900', period: '/mo', features: ['Everything in Pro', 'Shared workspaces', 'Audit logs', 'SSO login'], cta: 'Contact sales', featured: false },
]

export function PricingSection() {
  return (
    <div className="own-pricing">
      {PLANS.map((p) => (
        <article key={p.id} className={`own-plan${p.featured ? ' own-plan--featured' : ''}`}>
          {p.featured && <span className="own-plan__ribbon">Most popular</span>}
          <h3 className="own-plan__name">{p.name}</h3>
          <div className="own-plan__price"><strong>{p.price}</strong><span>{p.period}</span></div>
          <ul className="own-plan__features">
            {p.features.map((f) => (
              <li key={f}><Icon name="check-circle" size={16} /> {f}</li>
            ))}
          </ul>
          <Button variant={p.featured ? 'primary' : 'secondary'} fullWidth>{p.cta}</Button>
        </article>
      ))}
    </div>
  )
}

export function TestimonialCard() {
  return (
    <figure className="own-testimonial">
      <blockquote>
        “OWN Library cut our UI build time in half. The tokens and theme system mean every new product looks
        consistent from day one.”
      </blockquote>
      <figcaption>
        <span className="own-testimonial__avatar">PS</span>
        <div>
          <strong>Priya Sharma</strong>
          <span>Frontend Lead, Nova Labs</span>
        </div>
        <Badge tone="accent" dot>Verified</Badge>
      </figcaption>
    </figure>
  )
}

export function FeatureSection() {
  const features = [
    { icon: 'layers', title: 'Composable blocks', text: 'Small, focused components you can combine into any layout.' },
    { icon: 'sun', title: '12 built-in themes', text: 'Dark included permanently — switch via CSS variables.' },
    { icon: 'shield', title: 'Accessible by default', text: 'ARIA roles, keyboard support and focus states on every control.' },
    { icon: 'copy', title: 'Copy real code', text: 'JSX and CSS tabs copy production-ready snippets, not placeholders.' },
    { icon: 'grid', title: 'Responsive at 360px', text: 'Every preview is tested from mobile to desktop widths.' },
    { icon: 'globe', title: 'Zero dependencies', text: 'No UI framework, no icon font — just React and inline SVG.' },
  ]
  return (
    <div className="own-features">
      {features.map((f) => (
        <article key={f.title} className="own-feature">
          <span className="own-feature__icon"><Icon name={f.icon} size={20} /></span>
          <h3>{f.title}</h3>
          <p>{f.text}</p>
        </article>
      ))}
    </div>
  )
}

export function CtaBanner() {
  return (
    <section className="own-cta">
      <h2>Ready to build your next interface?</h2>
      <p>Start with a solid, themeable foundation and reuse it across every project.</p>
      <div className="own-cta__actions">
        <Button size="lg" iconRight="arrow-right">Browse components</Button>
        <Button size="lg" variant="outline">View on GitHub</Button>
      </div>
    </section>
  )
}

export function ErrorPage({ code = '404' }) {
  return (
    <div className="own-error-page">
      <strong className="own-error-page__code">{code}</strong>
      <h2>Page not found</h2>
      <p>The page you are looking for was moved, removed or never existed.</p>
      <Button iconRight="arrow-right">Back to home</Button>
    </div>
  )
}

export function FaqSection() {
  return (
    <div className="own-faq">
      <h2 className="own-faq__title">Frequently asked questions</h2>
      <Accordion multiple />
    </div>
  )
}
