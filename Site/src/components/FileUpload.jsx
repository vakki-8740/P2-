import { useRef } from 'react'
import { MAX_UPLOAD_BYTES } from '../utils/api'

const MAX_MB = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)

export default function FileUpload({ label, accept = 'image/*', required = false, file, onFileChange }) {
  const inputRef = useRef(null)

  const onChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    if (f.size > MAX_UPLOAD_BYTES) {
      alert(`File too large: ${f.name} (max ${MAX_MB} MB)`)
      e.target.value = ''
      return
    }
    onFileChange?.(f)
  }

  const onRemove = (e) => {
    e.stopPropagation()
    onFileChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="form-group">
      <label>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="file-upload-simple" onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept={accept} onChange={onChange} hidden aria-hidden="true" tabIndex={-1} />
        <span className="file-upload-icon-simple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </span>
        <span className="file-upload-name-simple">{file ? file.name : 'Choose file'}</span>
        {file ? (
          <button type="button" className="file-upload-clear" onClick={onRemove} aria-label="Remove file">✕</button>
        ) : (
          <span className="file-upload-browse">Browse</span>
        )}
      </div>
      <small className="muted" style={{ display: 'block', marginTop: 6 }}>
        Images up to {MAX_MB} MB
      </small>
    </div>
  )
}
