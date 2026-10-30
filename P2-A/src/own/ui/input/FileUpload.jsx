import { useRef, useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './FileUpload.css'

export default function FileUpload({ accept = 'image/*', multiple = true, label = 'Upload files' }) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)

  const addFiles = (list) => setFiles((cur) => [...cur, ...Array.from(list)])

  return (
    <div className="own-upload">
      <div
        className={`own-upload__zone${dragging ? ' is-drag' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
      >
        <span className="own-upload__icon"><Icon name="upload" size={22} /></span>
        <p className="own-upload__title">Drag &amp; drop, or <strong>browse</strong></p>
        <p className="own-upload__hint">PNG, JPG or PDF up to 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="own-sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="own-upload__list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="own-upload__item">
              <Icon name="folder" size={16} />
              <span className="own-upload__name">{f.name}</span>
              <span className="own-upload__size">{(f.size / 1024).toFixed(1)} KB</span>
              <button
                type="button"
                className="own-upload__remove"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((cur) => cur.filter((_, idx) => idx !== i))}
              >
                <Icon name="x" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
