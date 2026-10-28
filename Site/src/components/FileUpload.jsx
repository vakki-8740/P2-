import { useState, useRef } from 'react'

export default function FileUpload({ label, accept = 'image/*', required = false }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const onChange = (e) => handleFile(e.target.files[0])
  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }
  const onRemove = (e) => {
    e.stopPropagation()
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="form-group file-upload-group">
      <label>{label} {required && <span className="req">*</span>}</label>
      <div
        className={`file-upload ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          required={required && !file}
          onChange={onChange}
          hidden
        />

        {!file ? (
          <div className="file-upload-empty">
            <div className="file-upload-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="file-upload-text">
              <span className="file-upload-action">Click to upload</span> or drag and drop
            </div>
            <div className="file-upload-hint">PNG, JPG, PDF up to 5MB</div>
          </div>
        ) : (
          <div className="file-upload-filled">
            {preview ? (
              <img src={preview} alt={file.name} className="file-upload-thumb" />
            ) : (
              <div className="file-upload-fileicon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              </div>
            )}
            <div className="file-upload-info">
              <div className="file-upload-name">{file.name}</div>
              <div className="file-upload-size">{(file.size / 1024).toFixed(1)} KB • Click to change</div>
            </div>
            <button type="button" className="file-upload-remove" onClick={onRemove} aria-label="Remove">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
