import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../shared/db'
import { Sheet } from '../../../shared/ui/Sheet'
import { NumberInput } from '../../../shared/ui/NumberInput'
import { useI18n } from '../../../shared/i18n/context'
import {
  MEALS,
  nutrientsFor,
  shiftDateKey,
  sumNutrients,
  toDateKey,
  type Food,
  type FoodLogEntry,
  type Meal,
} from '../domain/nutrition'
import { useProfile } from '../../calories/ui/useProfile'
import { FoodForm } from './FoodsScreen'

interface TodayScreenProps {
  onGoToProfile: () => void
  onGoToFoods: () => void
}

export function TodayScreen({ onGoToProfile, onGoToFoods }: TodayScreenProps) {
  const { t, locale } = useI18n()
  const [today] = useState(() => toDateKey(new Date()))
  const [date, setDate] = useState(today)
  const [addingTo, setAddingTo] = useState<Meal | null>(null)
  const { targets, profile } = useProfile()
  const entries = useLiveQuery(() => db.logs.where('date').equals(date).toArray(), [date]) ?? []
  const totals = sumNutrients(entries)

  return (
    <>
      <div className="row between" style={{ marginBottom: 16 }}>
        <button className="ghost" onClick={() => setDate(shiftDateKey(date, -1))} aria-label={t.today.previousDay}>
          ◀
        </button>
        <h1 style={{ margin: 0, textAlign: 'center' }}>{date === today ? t.today.title : formatDate(date, locale)}</h1>
        <button className="ghost" onClick={() => setDate(shiftDateKey(date, 1))} aria-label={t.today.nextDay} disabled={date >= today}>
          ▶
        </button>
      </div>

      <section className="card">
        {profile === null ? (
          <div className="stack">
            <p>{t.today.setupProfile}</p>
            <button className="primary" onClick={onGoToProfile}>
              {t.today.goToProfile}
            </button>
          </div>
        ) : (
          <>
            <div className="row between">
              <div>
                <div className="big-number">{totals.kcal}</div>
                <div className="muted">{t.today.ofTarget(targets?.kcal ?? '—')}</div>
              </div>
              {targets && (
                <div style={{ textAlign: 'right' }}>
                  <div className="big-number" style={{ color: totals.kcal > targets.kcal ? 'var(--danger)' : 'var(--accent)' }}>
                    {Math.abs(targets.kcal - totals.kcal)}
                  </div>
                  <div className="muted">{totals.kcal > targets.kcal ? t.today.kcalOver : t.today.kcalLeft}</div>
                </div>
              )}
            </div>
            <Progress value={totals.kcal} target={targets?.kcal} />
            <div className="stack" style={{ marginTop: 16, gap: 10 }}>
              <Macro label={t.nutrients.protein} value={totals.proteinG} target={targets?.proteinG} color="var(--protein)" />
              <Macro label={t.nutrients.carbs} value={totals.carbsG} target={targets?.carbsG} color="var(--carbs)" />
              <Macro label={t.nutrients.fat} value={totals.fatG} target={targets?.fatG} color="var(--fat)" />
            </div>
          </>
        )}
      </section>

      {MEALS.map((meal) => {
        const mealEntries = entries.filter((e) => e.meal === meal)
        const mealKcal = sumNutrients(mealEntries).kcal
        return (
          <section className="card" key={meal}>
            <div className="row between">
              <h3>
                {t.meals[meal]}{' '}
                {mealKcal > 0 && (
                  <span className="chip">
                    {mealKcal} {t.nutrients.kcal}
                  </span>
                )}
              </h3>
              <button className="ghost" onClick={() => setAddingTo(meal)} aria-label={t.today.addTo(t.meals[meal])}>
                ＋
              </button>
            </div>
            {mealEntries.length > 0 && (
              <ul className="list" style={{ marginTop: 8 }}>
                {mealEntries.map((e) => (
                  <EntryRow key={e.id} entry={e} />
                ))}
              </ul>
            )}
          </section>
        )
      })}

      {addingTo && <AddEntrySheet date={date} meal={addingTo} onClose={() => setAddingTo(null)} onGoToFoods={onGoToFoods} />}
    </>
  )
}

function EntryRow({ entry }: { entry: FoodLogEntry }) {
  const { t } = useI18n()
  const quantity = entry.basis === 'per100g' ? t.today.grams(entry.quantity) : t.today.units(entry.quantity)
  return (
    <li>
      <div className="grow">
        <div className="title">{entry.foodName}</div>
        <div className="muted">
          {quantity} · {t.nutrients.macrosShort(entry.proteinG, entry.carbsG, entry.fatG)}
        </div>
      </div>
      <div>{entry.kcal}</div>
      <button className="ghost danger" aria-label={t.today.remove(entry.foodName)} onClick={() => db.logs.delete(entry.id!)}>
        ✕
      </button>
    </li>
  )
}

function AddEntrySheet({ date, meal, onClose, onGoToFoods }: { date: string; meal: Meal; onClose: () => void; onGoToFoods: () => void }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState(100)
  const [mealId, setMealId] = useState<Meal>(meal)
  const [creating, setCreating] = useState(false)
  const foods = useLiveQuery(() => db.foods.orderBy('name').toArray(), [])

  const filtered = (foods ?? []).filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()))

  function select(food: Food) {
    setSelected(food)
    setQuantity(food.basis === 'per100g' ? 100 : 1)
  }

  async function onAdd() {
    if (!selected?.id || quantity <= 0) return
    await db.logs.add({
      date,
      meal: mealId,
      foodId: selected.id,
      foodName: selected.name,
      basis: selected.basis,
      quantity,
      ...nutrientsFor(selected, quantity),
    })
    onClose()
  }

  if (creating) {
    return (
      <FoodForm
        initial={{ name: query, basis: 'per100g', kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }}
        onClose={() => setCreating(false)}
        onSaved={select}
      />
    )
  }

  const preview = selected ? nutrientsFor(selected, quantity) : null

  return (
    <Sheet title={t.today.addFood} onClose={onClose}>
      {selected && preview ? (
        <div className="stack">
          <div className="row between">
            <strong>{selected.name}</strong>
            <button className="ghost" onClick={() => setSelected(null)}>
              {t.common.change}
            </button>
          </div>
          <label>
            {selected.basis === 'per100g' ? t.today.quantityG : t.today.quantityUnits}
            <NumberInput value={quantity} onChange={setQuantity} />
          </label>
          <label>
            {t.today.meal}
            <select value={mealId} onChange={(e) => setMealId(e.target.value as Meal)}>
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {t.meals[m]}
                </option>
              ))}
            </select>
          </label>
          <div className="grid-4">
            <PreviewStat value={preview.kcal} label={t.nutrients.kcal} />
            <PreviewStat value={preview.proteinG} label={t.nutrients.protein} color="var(--protein)" />
            <PreviewStat value={preview.carbsG} label={t.nutrients.carbs} color="var(--carbs)" />
            <PreviewStat value={preview.fatG} label={t.nutrients.fat} color="var(--fat)" />
          </div>
          <button className="primary block" disabled={quantity <= 0} onClick={onAdd}>
            {t.common.add}
          </button>
        </div>
      ) : (
        <div className="stack">
          <input placeholder={t.today.searchFoods} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
          {foods && foods.length === 0 && (
            <p className="muted">
              {t.today.noFoods}{' '}
              <button
                className="ghost"
                style={{ color: 'var(--accent)', padding: 0 }}
                onClick={() => {
                  onClose()
                  onGoToFoods()
                }}
              >
                {t.today.openCatalog}
              </button>
            </p>
          )}
          <ul className="list">
            {filtered.map((f) => (
              <li key={f.id} onClick={() => select(f)} style={{ cursor: 'pointer' }}>
                <div className="grow title">{f.name}</div>
                <span className="muted">
                  {f.kcal} {t.nutrients.kcal} {f.basis === 'per100g' ? t.foods.basisPer100g : t.foods.basisPerUnit}
                </span>
              </li>
            ))}
          </ul>
          <button onClick={() => setCreating(true)}>{query.trim() ? t.today.createNamed(query.trim()) : t.today.createNew}</button>
        </div>
      )}
    </Sheet>
  )
}

function PreviewStat({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <div className="stat">
      <div className="value" style={{ color }}>
        {value}
      </div>
      <div className="label">{label}</div>
    </div>
  )
}

function Progress({ value, target }: { value: number; target?: number }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0
  return (
    <div className={`bar ${target && value > target ? 'over' : ''}`} style={{ marginTop: 12 }}>
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}

function Macro({ label, value, target, color }: { label: string; value: number; target?: number; color: string }) {
  const pct = target ? Math.min(100, (value / target) * 100) : 0
  return (
    <div>
      <div className="row between muted">
        <span>{label}</span>
        <span>
          {value} / {target ?? '—'} g
        </span>
      </div>
      <div className="bar" style={{ marginTop: 4 }}>
        <div style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function formatDate(key: string, locale: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}
