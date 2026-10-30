/**
 * ComplainForm — saare complaint pages ka ek hi form.
 *
 * Har page sirf apni config deta hai (type, amount field, kaun si files
 * chahiye), baaki UI/submit logic yahin hai. Isse 7 pages me duplicate code
 * nahi rehta.
 *
 *   <ComplainForm
 *     type="Deposit"
 *     title="Deposit Complain"
 *     amount={{ key: 'depositAmount', label: 'Deposit Amount' }}
 *     files={[{ key: 'paymentImage', label: 'Upload Payment Image' }]}
 *     requiredFilesMessage="Please upload Payment Image"
 *   />
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import SubmitSuccessPopup from './SubmitSuccessPopup'
import FileUpload from './FileUpload'
import { saveComplain, generateId } from '../utils/complainStore'
import { withBase } from '../utils/base'

const BASE_FIELDS = [
  { key: 'userName', label: 'User Name', placeholder: 'User Name' },
  { key: 'mobile', label: 'Mobile Number', placeholder: 'Mobile Number', type: 'tel' },
  { key: 'password', label: 'Set Password', placeholder: 'Set Password', type: 'password' },
  { key: 'email', label: 'E-mail ID', placeholder: 'E-mail ID', type: 'email' },
]

/** Animation class: base fields d4–d7 ke baad d8, d9, phir d9 hi rehta hai. */
const anim = (index) => `complain-anim d${Math.min(8 + index, 9)}`

export default function ComplainForm({
  type,
  title = `${type} Complain`,
  amount = null,
  files = [],
  requiredFilesMessage,
}) {
  const [values, setValues] = useState({})
  const [uploads, setUploads] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const setValue = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))
  const setUpload = (key) => (file) => setUploads((u) => ({ ...u, [key]: file }))

  const reset = () => {
    setShowSuccess(false)
    setValues({})
    setUploads({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const missing = files.filter((f) => f.required !== false && !uploads[f.key])
    if (missing.length) {
      alert(requiredFilesMessage || `Please upload ${missing[0].label.replace(/^Upload /, '')}`)
      setSubmitting(false)
      return
    }

    setSubmitting(true)
    try {
      const details = {}
      BASE_FIELDS.forEach((f) => { details[f.key] = values[f.key] || '' })
      if (amount) details[amount.key] = values[amount.key] || ''

      const payloadFiles = {}
      files.forEach((f) => { if (uploads[f.key]) payloadFiles[f.key] = uploads[f.key] })

      await saveComplain({
        id: generateId(),
        type,
        title,
        createdAt: new Date().toISOString(),
        details,
        files: payloadFiles,
      })
      setShowSuccess(true)
    } catch (err) {
      alert(err && err.message ? err.message : 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header showMenu />
      <main className="container complain-open">
        <div className="card complain-anim d1" style={{ padding: '14px 16px' }}>
          <Link className="back-link" to={withBase('/')} style={{ marginBottom: '0' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
            Back
          </Link>
        </div>
        <div className="card panel complain-anim d2">
          <h1 className="page-title complain-anim d3" style={{ textAlign: 'center', marginBottom: '20px' }}>Complain Page</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-grid two">
              {BASE_FIELDS.map((f, i) => (
                <div key={f.key} className={`form-group complain-anim d${4 + i}`}>
                  <label>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={values[f.key] || ''}
                    onChange={setValue(f.key)}
                    required
                  />
                </div>
              ))}

              {amount && (
                <div className={`form-group ${anim(0)}`}>
                  <label>{amount.label}</label>
                  <input
                    type={amount.type || 'number'}
                    placeholder={amount.label}
                    value={values[amount.key] || ''}
                    onChange={setValue(amount.key)}
                    required
                  />
                </div>
              )}

              {files.map((f, i) => (
                <div key={f.key} className={anim((amount ? 1 : 0) + i)}>
                  <FileUpload
                    label={f.label}
                    accept={f.accept}
                    required={f.required !== false}
                    file={uploads[f.key] || null}
                    onFileChange={setUpload(f.key)}
                  />
                </div>
              ))}
            </div>
            <div className="form-actions complain-anim d9" style={{ justifyContent: 'center', marginTop: '24px' }}>
              <button className="btn primary" type="submit" disabled={submitting}>
                {submitting ? <><span className="spin"></span> Submitting...</> : 'Submit Now'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <SubmitSuccessPopup open={showSuccess} onClose={reset} />
      <footer><p>&copy; 2026 Parimatch Support. All rights reserved.</p></footer>
    </>
  )
}
