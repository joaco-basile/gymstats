import { useRef, useState } from 'react'
import { db } from '../db'
import { BackupError, exportBackup, parseBackup, restoreBackup } from '../backup'
import { toDateKey } from '../../features/nutrition/domain/nutrition'
import { useI18n } from '../i18n/context'
import type { Messages } from '../i18n/locales/en'

function errorMessage(e: unknown, t: Messages): string {
  if (!(e instanceof BackupError)) return t.backup.errors.unknown
  return e.code === 'missingKey' ? t.backup.errors.missingKey(e.key ?? '') : t.backup.errors[e.code]
}

export function BackupPanel() {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null)

  async function onExport() {
    const backup = await exportBackup(db)
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gymstats-backup-${toDateKey(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage({ text: t.backup.downloaded })
  }

  async function onImport(file: File) {
    try {
      const backup = parseBackup(await file.text())
      if (!confirm(t.backup.confirmReplace)) return
      await restoreBackup(db, backup)
      setMessage({ text: t.backup.restored })
    } catch (e) {
      setMessage({ text: errorMessage(e, t), error: true })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="card">
      <h3>{t.backup.title}</h3>
      <p className="muted" style={{ marginTop: 8 }}>
        {t.backup.description}
      </p>
      <div className="grid-2">
        <button onClick={onExport}>{t.backup.export}</button>
        <button onClick={() => fileRef.current?.click()}>{t.backup.import}</button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void onImport(file)
        }}
      />
      {message && (
        <p className={message.error ? 'error' : 'muted'} style={{ marginTop: 8 }}>
          {message.text}
        </p>
      )}
    </section>
  )
}
