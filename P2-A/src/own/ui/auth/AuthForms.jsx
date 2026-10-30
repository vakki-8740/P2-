import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import Input from '../input/Input.jsx'
import Button from '../button/Button.jsx'
import { Checkbox } from '../input/Checkbox.jsx'
import OtpInput from '../input/OtpInput.jsx'
import './AuthForms.css'

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="own-auth">
      <div className="own-auth__card">
        <div className="own-auth__brand"><span className="own-auth__mark"><Icon name="grid" size={16} /></span> OWN</div>
        <h2 className="own-auth__title">{title}</h2>
        <p className="own-auth__subtitle">{subtitle}</p>
        {children}
        {footer && <p className="own-auth__footer">{footer}</p>}
      </div>
    </div>
  )
}

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const submit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => setLoading(false), 1400) }
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to your workspace." footer={<>New here? <a href="#signup">Create an account</a></>}>
      <form className="own-auth__form" onSubmit={submit}>
        <Input id="li-email" label="Email" type="email" icon="mail" placeholder="you@example.com" defaultValue="aman@example.com" required />
        <Input id="li-pass" label="Password" type="password" icon="lock" placeholder="••••••••" allowPasswordToggle required />
        <div className="own-auth__row">
          <Checkbox id="li-remember" label="Remember me" defaultChecked />
          <a href="#forgot">Forgot password?</a>
        </div>
        <Button type="submit" fullWidth loading={loading}>Sign in</Button>
      </form>
    </AuthShell>
  )
}

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const submit = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => setLoading(false), 1400) }
  return (
    <AuthShell title="Create your account" subtitle="Start free — no credit card required." footer={<>Already have an account? <a href="#login">Sign in</a></>}>
      <form className="own-auth__form" onSubmit={submit}>
        <Input id="su-name" label="Full name" icon="user" placeholder="Aman Kumar" required />
        <Input id="su-email" label="Email" type="email" icon="mail" placeholder="you@example.com" required />
        <Input id="su-pass" label="Password" type="password" icon="lock" placeholder="Min. 8 characters" hint="Use 8+ characters with a number." allowPasswordToggle required />
        <Checkbox id="su-terms" label="I agree to the Terms & Privacy Policy" required />
        <Button type="submit" fullWidth loading={loading}>Create account</Button>
      </form>
    </AuthShell>
  )
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we'll send a reset link.">
      {sent ? (
        <div className="own-auth__success" role="status">
          <Icon name="check-circle" size={26} />
          <p>Reset link sent. Check your inbox for further instructions.</p>
        </div>
      ) : (
        <form className="own-auth__form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
          <Input id="fp-email" label="Email" type="email" icon="mail" placeholder="you@example.com" required />
          <Button type="submit" fullWidth iconRight="arrow-right">Send reset link</Button>
        </form>
      )}
    </AuthShell>
  )
}

export function TwoFactorForm() {
  return (
    <AuthShell title="Two-step verification" subtitle="Enter the 6-digit code from your authenticator app.">
      <form className="own-auth__form" onSubmit={(e) => e.preventDefault()}>
        <OtpInput length={6} />
        <Button type="submit" fullWidth>Verify code</Button>
        <button type="button" className="own-auth__linkbtn">Resend code in 00:30</button>
      </form>
    </AuthShell>
  )
}
