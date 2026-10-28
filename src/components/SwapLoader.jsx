export default function SwapLoader({ fullScreen = false, message = '' }) {
  const inner = (
    <div className={fullScreen ? 'swap-loader-overlay' : 'swap-loader-inline'}>
      <svg className="swap-loader" viewBox="70 60 410 430" role="img" aria-label="Loading">
        <polygon className="swap-loader-t" points="138,80 385,80 333,265 86,265" />
        <polygon className="swap-loader-b" points="221,289 465,289 413,474 169,474" />
      </svg>
      {message ? <p className="swap-loader-text">{message}</p> : null}
    </div>
  )
  if (fullScreen) {
    return (
      <div className="swap-loader-backdrop" role="status" aria-live="polite" aria-busy="true">
        {inner}
      </div>
    )
  }
  return inner
}
