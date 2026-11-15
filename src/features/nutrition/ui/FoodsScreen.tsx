import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../shared/db'
import { Sheet } from '../../../shared/ui/Sheet'
import { NumberInput } from '../../../shared/ui/NumberInput'
import { useI18n } from '../../../shared/i18n/context'
import type { Food } from '../domain/nutrition'

const EMPTY_FOOD: Food = { name: '', basis: 'per100g', kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }

export function FoodsScreen() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Food | null>(null)
  const foods = useLiveQuery(() => db.foods.orderBy('name').toArray(), [])

  const filtered = (foods ?? []).filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <>
      <div className="row between">
        <h1>{t.foods.title}</h1>
        <button className="primary" onClick={() => setEditing(EMPTY_FOOD)}>
          {t.common.new}
        </button>
      </div>

      <input placeholder={t.common.search} value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginBottom: 12 }} />

      <section className="card">
        {foods && foods.length === 0 && <p className="muted">{t.foods.empty}</p>}
        <ul className="list">
          {filtered.map((f) => (
            <li key={f.id} onClick={() => setEditing(f)} style={{ cursor: 'pointer' }}>
              <div className="grow">
                <div className="title">{f.name}</div>
                <div className="muted">{t.nutrients.macrosShort(f.proteinG, f.carbsG, f.fatG)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>
                  {f.kcal} {t.nutrients.kcal}
                </div>
                <span className="chip">{f.basis === 'per100g' ? t.foods.basisPer100g : t.foods.basisPerUnit}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {editing && <FoodForm initial={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

export function FoodForm({ initial, onClose, onSaved }: { initial: Food; onClose: () => void; onSaved?: (food: Food) => void }) {
  const { t } = useI18n()
  const [food, setFood] = useState<Food>(initial)
  const isNew = initial.id === undefined
  const set = <K extends keyof Food>(key: K, value: Food[K]) => setFood((f) => ({ ...f, [key]: value }))
  const valid = food.name.trim().length > 0

  async function onSave() {
    const toSave = { ...food, name: food.name.trim() }
    const id = await db.foods.put(toSave)
    onSaved?.({ ...toSave, id })
    onClose()
  }

  async function onDelete() {
    if (!confirm(t.foods.confirmDelete(food.name))) return
    await db.foods.delete(food.id!)
    onClose()
  }

  return (
    <Sheet title={isNew ? t.foods.newFood : t.foods.editFood} onClose={onClose}>
      <div className="stack">
        <label>
          {t.foods.name}
          <input value={food.name} onChange={(e) => set('name', e.target.value)} placeholder={t.foods.namePlaceholder} autoFocus />
        </label>
        <div className="segmented">
          <button className={food.basis === 'per100g' ? 'active' : ''} onClick={() => set('basis', 'per100g')}>
            {t.foods.per100g}
          </button>
          <button className={food.basis === 'perUnit' ? 'active' : ''} onClick={() => set('basis', 'perUnit')}>
            {t.foods.perUnit}
          </button>
        </div>
        <div className="grid-2">
          <label>
            {t.foods.calories}
            <NumberInput value={food.kcal} onChange={(v) => set('kcal', v)} />
          </label>
          <label>
            {t.foods.proteinG}
            <NumberInput value={food.proteinG} onChange={(v) => set('proteinG', v)} />
          </label>
          <label>
            {t.foods.carbsG}
            <NumberInput value={food.carbsG} onChange={(v) => set('carbsG', v)} />
          </label>
          <label>
            {t.foods.fatG}
            <NumberInput value={food.fatG} onChange={(v) => set('fatG', v)} />
          </label>
        </div>
        <button className="primary block" disabled={!valid} onClick={onSave}>
          {t.common.save}
        </button>
        {!isNew && (
          <button className="danger block" onClick={onDelete}>
            {t.common.delete}
          </button>
        )}
      </div>
    </Sheet>
  )
}
