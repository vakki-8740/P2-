import Modal from '../own/ui/feedback/Modal.jsx'
import Button from '../own/ui/button/Button.jsx'

/** Attachment popup — OWN Library Modal */
export default function FileViewer({ open, src, name, onClose }) {
  if (!open || !src) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={name || 'Attachment'}
      size="lg"
      footer={
        <div className="pa-spread">
          <a className="own-btn own-btn--ghost own-btn--sm" href={src} target="_blank" rel="noopener">
            <span>Open in new tab</span>
          </a>
          <Button size="sm" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <img className="pa-viewer-img" src={src} alt={name || 'Attachment'} />
    </Modal>
  )
}
