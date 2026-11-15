import { useState } from 'react'
import {
  ACTIVITY_FACTORS,
  GOAL_ADJUSTMENTS,
  calculateTargets,
  type ActivityLevel,
  type Goal,
  type Profile,
} from '../domain/energy'
import { NumberInput } from '../../../shared/ui/NumberInput'
import { BackupPanel } from '../../../shared/ui/BackupPanel'
import { useI18n } from '../../../shared/i18n/context'
import { LANGUAGES, isLanguage } from '../../../shared/i18n/languages'
import { saveProfile, useProfile } from './useProfile'

const DEFAULT_PROFILE: Profile = {
  sex: 'male',
  age: 30,
  heightCm: 175,
  weightKg: 75,
  activity: 'moderate',
  goal: 'maintain',
}

const ACTIVITY_LEVELS = Object.keys(ACTIVITY_FACTORS) as ActivityLevel[]
const GOALS = Object.keys(GOAL_ADJUSTMENTS) as Goal[]

export function ProfileScreen() {
  const { profile } = useProfile()
  if (profile === undefined) return null // still loading from IndexedDB
  return <ProfileForm initial={profile} />
}

function ProfileForm({ initial }: { initial: Profile | null }) {
  const { t } = useI18n()
  const [draft, setDraft] = useState<Profile>(() => {
    if (!initial) return DEFAULT_PROFILE
    const { sex, age, heightCm, weightKg, activity, goal } = initial
    return { sex, age, heightCm, weightKg, activity, goal }
  })
  const [saved, setSaved] = useState(false)
  const hasProfile = initial !== null

  const targets = calculateTargets(draft)
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setSaved(false)
    setDraft((d) => ({ ...d, [key]: value }))
  }

  async function onSave() {
    await saveProfile(draft)
    setSaved(true)
  }

  return (
    <>
      <h1>{t.profile.title}</h1>

      <section className="card stack">
        <div className="segmented">
          {(['male', 'female'] as const).map((s) => (
            <button key={s} className={draft.sex === s ? 'active' : ''} onClick={() => set('sex', s)}>
              {t.profile[s]}
            </button>
          ))}
        </div>
        <div className="grid-2">
          <label>
            {t.profile.age}
            <NumberInput value={draft.age} onChange={(v) => set('age', v)} inputMode="numeric" />
          </label>
          <label>
            {t.profile.height}
            <NumberInput value={draft.heightCm} onChange={(v) => set('heightCm', v)} />
          </label>
          <label>
            {t.profile.weight}
            <NumberInput value={draft.weightKg} onChange={(v) => set('weightKg', v)} />
          </label>
          <label>
            {t.profile.goal}
            <select value={draft.goal} onChange={(e) => set('goal', e.target.value as Goal)}>
              {GOALS.map((id) => (
                <option key={id} value={id}>
                  {t.goal[id]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          {t.profile.activity}
          <select value={draft.activity} onChange={(e) => set('activity', e.target.value as ActivityLevel)}>
            {ACTIVITY_LEVELS.map((id) => (
              <option key={id} value={id}>
                {t.activity[id]}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="card">
        <h3>{t.profile.dailyTarget}</h3>
        <div className="big-number" style={{ margin: '8px 0' }}>
          {targets.kcal} <span className="muted">{t.nutrients.kcal}</span>
        </div>
        <p className="muted">{t.profile.bmrLine(Math.round(targets.bmr), targets.tdee)}</p>
        <div className="grid-4" style={{ marginTop: 12 }}>
          <Stat label={t.nutrients.protein} value={`${targets.proteinG} g`} color="var(--protein)" />
          <Stat label={t.nutrients.carbs} value={`${targets.carbsG} g`} color="var(--carbs)" />
          <Stat label={t.nutrients.fat} value={`${targets.fatG} g`} color="var(--fat)" />
          <Stat label={t.profile.weightShort} value={`${draft.weightKg} kg`} />
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          {t.profile.formulaNote}
        </p>
        <button className="primary block" style={{ marginTop: 8 }} onClick={onSave}>
          {saved ? t.profile.saved : hasProfile ? t.profile.updateProfile : t.profile.saveProfile}
        </button>
      </section>

      <LanguagePicker />
      <BackupPanel />
    </>
  )
}

function LanguagePicker() {
  const { t, language, setLanguage } = useI18n()
  return (
    <section className="card">
      <label>
        {t.profile.language}
        <select
          value={language}
          onChange={(e) => {
            if (isLanguage(e.target.value)) setLanguage(e.target.value)
          }}
        >
          {Object.entries(LANGUAGES).map(([id, lang]) => (
            <option key={id} value={id}>
              {lang.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="stat">
      <div className="value" style={{ color }}>
        {value}
      </div>
      <div className="label">{label}</div>
    </div>
  )
}
