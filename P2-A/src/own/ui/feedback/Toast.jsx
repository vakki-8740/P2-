import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Toast.css'

const ToastContext = createContext(() => {})

const TONE_ICON = { info: 'info', success: 'check-circle', warning: 'alert-triangle', danger: 'x-circle' }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback((toast) => {
    const id = ++idRef.current
    const item = { id, tone: 'info', duration: 3600, ...toast }
    setToasts((cur) => [...cur, item])
    if (item.duration) setTimeout(() => dismiss(id), item.duration)
    return id
  }, [dismiss])

  return (
    <ToastContext.Provider value={pushToast}>
      {children}
      <div className="own-toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`own-toast own-toast--${t.tone}`} role="status">
            <Icon name={TONE_ICON[t.tone] || 'info'} size={18} />
            <div className="own-toast__body">
              {t.title && <p className="own-toast__title">{t.title}</p>}
              <p className="own-toast__text">{t.message}</p>
            </div>
            {t.action && (
              <button type="button" className="own-toast__action" onClick={() => { t.action.onClick(); dismiss(t.id) }}>
                {t.action.label}
              </button>
            )}
            <button type="button" className="own-toast__close" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

export function ToastDemoButtons() {
  const push = useToast()
  const tones = [
    { tone: 'info', label: 'Info' },
    { tone: 'success', label: 'Success' },
    { tone: 'warning', label: 'Warning' },
    { tone: 'danger', label: 'Danger' },
  ]
  return (
    <div className="own-toast-demo">
      {tones.map((t) => (
        <button
          key={t.tone}
          type="button"
          className={`own-toast-demo__btn own-toast-demo__btn--${t.tone}`}
          onClick={() => push({
            tone: t.tone,
            title: `${t.label} notification`,
            message: `This is a ${t.tone} toast — it auto-dismisses.`,
            action: t.tone === 'danger' ? { label: 'Undo', onClick: () => push({ tone: 'success', message: 'Action undone' }) } : undefined,
          })}
        >
          {t.label} toast
        </button>
      ))}
    </div>
  )
}
