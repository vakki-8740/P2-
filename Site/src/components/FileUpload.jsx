import { useState, useRef } from 'react'

export default function FileUpload({ label, accept = 'image/*', required = false }) {
  const [file, setFile] = useState(null)
  const inputRef = useRef(null)

  const onChange = (e) => {
    const f = e.target.files[0]
    if (f) setFile(f)
  }
  const onRemove = (e) => {
    e.stopPropagation()
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="file-upload-simple" onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept={accept} required={required && !file} onChange={onChange} hidden />
        <span className="file-upload-icon-simple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        </span>
        <span className="file-upload-name-simple">{file ? file.name : 'Choose file'}</span>
        {file ? (
          <button type="button" className="file-upload-clear" onClick={onRemove}>✕</button>
        ) : (
          <span className="file-upload-browse">Browse</span>
        )}
      </div>
    </div>
  )
}
