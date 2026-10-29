export default function ImageViewer({ file, onClose }){
  if(!file) return null
  const isImage = file.data && file.data.startsWith('data:image')
  const download = () => {
    if(!file.data) return
    const a = document.createElement('a')
    a.href = file.data
    a.download = file.name || 'download'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer-box" onClick={e=> e.stopPropagation()}>
        <div className="viewer-head">
          <h3>{file.name || 'Preview'}</h3>
          <button className="btn-admin ghost small" onClick={onClose}>Close ✕</button>
        </div>
        <div className="viewer-body">
          {isImage ? <img src={file.data} alt={file.name} /> : (
            <div style={{textAlign:'center', padding:20}}>
              <p style={{fontWeight:700, marginBottom:8}}>{file.name}</p>
              <p style={{fontSize:'.82rem', color:'var(--admin-muted)'}}>No preview for this file type</p>
              <a href={file.data} download={file.name} target="_blank" rel="noopener" className="btn-admin primary small" style={{marginTop:12, display:'inline-flex'}}>Download</a>
            </div>
          )}
        </div>
        <div className="viewer-foot">
          <button className="btn-admin ghost small" onClick={onClose}>Close</button>
          {file.data && <button className="btn-admin primary small" onClick={download}>Download</button>}
        </div>
      </div>
    </div>
  )
}
