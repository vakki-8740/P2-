import { useState } from 'react'
import { Icon } from '../icons/Icons.jsx'
import './Pagination.css'

export default function Pagination({ totalPages = 8 }) {
  const [page, setPage] = useState(2)
  const pages = [1, '…', page - 1, page, page + 1, '…', totalPages]
    .filter((p, i, arr) => (typeof p === 'number' && p >= 1 && p <= totalPages ? arr.indexOf(p) === i || true : true))

  return (
    <nav className="own-pagination" aria-label="Pagination">
      <button type="button" className="own-pagination__btn" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
        <Icon name="chevron-left" size={16} />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="own-pagination__ellipsis">…</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`own-pagination__btn own-pagination__num${p === page ? ' is-active' : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        )
      )}
      <button type="button" className="own-pagination__btn" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  )
}
