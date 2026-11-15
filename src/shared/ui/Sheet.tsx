import type { ReactNode } from 'react'
import { useI18n } from '../i18n/context'

interface SheetProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/** Bottom sheet modal, the natural pattern for forms on a phone. */
export function Sheet({ title, onClose, children }: SheetProps) {
  const { t } = useI18n()
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="ghost" onClick={onClose} aria-label={t.common.close}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
