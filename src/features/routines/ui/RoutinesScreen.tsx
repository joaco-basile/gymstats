import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../shared/db'
import { NumberInput } from '../../../shared/ui/NumberInput'
import { useI18n } from '../../../shared/i18n/context'
import { moveItem, newExercise, type Exercise, type Routine } from '../domain/routine'

export function RoutinesScreen() {
  const { t } = useI18n()
  const routines = useLiveQuery(() => db.routines.orderBy('name').toArray(), [])
  const [editing, setEditing] = useState<Routine | null>(null)
  const [viewing, setViewing] = useState<Routine | null>(null)

  if (editing) return <RoutineEditor initial={editing} onDone={() => setEditing(null)} />
  if (viewing)
    return (
      <RoutineView
        routine={viewing}
        onBack={() => setViewing(null)}
        onEdit={() => {
          setEditing(viewing)
          setViewing(null)
        }}
      />
    )

  return (
    <>
      <div className="row between">
        <h1>{t.routines.title}</h1>
        <button className="primary" onClick={() => setEditing({ name: '', exercises: [newExercise()], updatedAt: Date.now() })}>
          {t.common.new}
        </button>
      </div>
      {routines && routines.length === 0 && (
        <section className="card">
          <p className="muted">{t.routines.empty}</p>
        </section>
      )}
      {routines?.map((r) => (
        <section className="card" key={r.id} onClick={() => setViewing(r)} style={{ cursor: 'pointer' }}>
          <div className="row between">
            <strong>{r.name}</strong>
            <span className="chip">{t.routines.exercisesCount(r.exercises.length)}</span>
          </div>
          <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>
            {r.exercises.map((e) => e.name).join(' · ')}
          </p>
        </section>
      ))}
    </>
  )
}

function RoutineView({ routine, onBack, onEdit }: { routine: Routine; onBack: () => void; onEdit: () => void }) {
  const { t } = useI18n()
  return (
    <>
      <div className="row between" style={{ marginBottom: 16 }}>
        <button className="ghost" onClick={onBack}>
          ◀ {t.common.back}
        </button>
        <button onClick={onEdit}>{t.common.edit}</button>
      </div>
      <h1>{routine.name}</h1>
      {routine.exercises.map((e, i) => (
        <section className="card" key={e.id}>
          <div className="row between">
            <strong>
              {i + 1}. {e.name}
            </strong>
          </div>
          <div className="row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <span className="chip">
              {e.sets} × {e.reps}
            </span>
            <span className="chip">{t.routines.rest(formatRest(e.restSec))}</span>
          </div>
          {e.notes && (
            <p className="muted" style={{ marginTop: 8, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {e.notes}
            </p>
          )}
        </section>
      ))}
    </>
  )
}

function RoutineEditor({ initial, onDone }: { initial: Routine; onDone: () => void }) {
  const { t } = useI18n()
  const [routine, setRoutine] = useState<Routine>(initial)
  const isNew = initial.id === undefined
  const exercises = routine.exercises
  const valid = routine.name.trim().length > 0 && exercises.length > 0 && exercises.every((e) => e.name.trim())

  const setExercises = (next: Exercise[]) => setRoutine((r) => ({ ...r, exercises: next }))
  const updateExercise = (id: string, patch: Partial<Exercise>) =>
    setExercises(exercises.map((e) => (e.id === id ? { ...e, ...patch } : e)))

  async function onSave() {
    await db.routines.put({
      ...routine,
      name: routine.name.trim(),
      exercises: exercises.map((e) => ({ ...e, name: e.name.trim(), reps: e.reps.trim() || '10' })),
      updatedAt: Date.now(),
    })
    onDone()
  }

  async function onDelete() {
    if (!confirm(t.routines.confirmDelete(routine.name))) return
    await db.routines.delete(routine.id!)
    onDone()
  }

  return (
    <>
      <div className="row between" style={{ marginBottom: 16 }}>
        <button className="ghost" onClick={onDone}>
          {t.common.cancel}
        </button>
        <button className="primary" disabled={!valid} onClick={onSave}>
          {t.common.save}
        </button>
      </div>
      <label style={{ marginBottom: 12 }}>
        {t.routines.routineName}
        <input value={routine.name} onChange={(e) => setRoutine({ ...routine, name: e.target.value })} placeholder={t.routines.namePlaceholder} />
      </label>

      {exercises.map((e, i) => (
        <section className="card stack" key={e.id}>
          <div className="row">
            <span className="muted">{i + 1}.</span>
            <input className="grow" value={e.name} placeholder={t.routines.exerciseName} onChange={(ev) => updateExercise(e.id, { name: ev.target.value })} />
          </div>
          <div className="grid-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <label>
              {t.routines.sets}
              <NumberInput value={e.sets} onChange={(v) => updateExercise(e.id, { sets: Math.round(v) })} inputMode="numeric" />
            </label>
            <label>
              {t.routines.reps}
              <input value={e.reps} onChange={(ev) => updateExercise(e.id, { reps: ev.target.value })} placeholder="8-12" />
            </label>
            <label>
              {t.routines.restSec}
              <NumberInput value={e.restSec} onChange={(v) => updateExercise(e.id, { restSec: Math.round(v) })} inputMode="numeric" />
            </label>
          </div>
          <textarea value={e.notes} placeholder={t.routines.notesPlaceholder} onChange={(ev) => updateExercise(e.id, { notes: ev.target.value })} />
          <div className="row between">
            <div className="row">
              <button className="ghost" disabled={i === 0} onClick={() => setExercises(moveItem(exercises, i, i - 1))} aria-label={t.routines.moveUp}>
                ▲
              </button>
              <button className="ghost" disabled={i === exercises.length - 1} onClick={() => setExercises(moveItem(exercises, i, i + 1))} aria-label={t.routines.moveDown}>
                ▼
              </button>
            </div>
            <button className="ghost danger" onClick={() => setExercises(exercises.filter((x) => x.id !== e.id))}>
              {t.routines.remove}
            </button>
          </div>
        </section>
      ))}

      <button className="block" onClick={() => setExercises([...exercises, newExercise()])}>
        {t.routines.addExercise}
      </button>
      {!isNew && (
        <button className="danger block" style={{ marginTop: 12 }} onClick={onDelete}>
          {t.routines.deleteRoutine}
        </button>
      )}
    </>
  )
}

function formatRest(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s ? `${m}m ${s}s` : `${m}m`
}
