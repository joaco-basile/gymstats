import { describe, expect, it } from 'vitest'
import { calculateBmr, calculateTargets, type Profile } from './energy'

const base: Profile = {
  sex: 'male',
  age: 30,
  heightCm: 180,
  weightKg: 80,
  activity: 'moderate',
  goal: 'maintain',
}

describe('calculateBmr (Mifflin-St Jeor)', () => {
  it('uses +5 for males', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 1780
    expect(calculateBmr(base)).toBe(1780)
  })

  it('uses -161 for females', () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 1345.25
    expect(calculateBmr({ ...base, sex: 'female', weightKg: 60, heightCm: 165, age: 25 })).toBe(1345.25)
  })
})

describe('calculateTargets', () => {
  it('multiplies BMR by the activity factor for maintenance', () => {
    const t = calculateTargets(base)
    expect(t.bmr).toBe(1780)
    expect(t.tdee).toBe(2759) // 1780 * 1.55 = 2759
    expect(t.kcal).toBe(2759)
  })

  it('applies a 20% deficit when cutting and 10% surplus when bulking', () => {
    expect(calculateTargets({ ...base, goal: 'lose' }).kcal).toBe(2207) // 2759 * 0.8
    expect(calculateTargets({ ...base, goal: 'gain' }).kcal).toBe(3035) // 2759 * 1.1
  })

  it('splits macros: 2 g/kg protein, 0.9 g/kg fat, carbs fill the rest', () => {
    const t = calculateTargets(base)
    expect(t.proteinG).toBe(160)
    expect(t.fatG).toBe(72)
    // (2759 - 160*4 - 72*9) / 4 = 367.75 -> 368
    expect(t.carbsG).toBe(368)
  })

  it('never returns negative carbs', () => {
    const t = calculateTargets({ ...base, weightKg: 150, heightCm: 150, age: 80, activity: 'sedentary', goal: 'lose' })
    expect(t.carbsG).toBeGreaterThanOrEqual(0)
  })
})
