export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'
export type Goal = 'lose' | 'maintain' | 'gain'

export interface Profile {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: ActivityLevel
  goal: Goal
}

export interface DailyTargets {
  bmr: number
  tdee: number
  kcal: number
  proteinG: number
  fatG: number
  carbsG: number
}

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

export const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: 0.8,
  maintain: 1,
  gain: 1.1,
}

const PROTEIN_G_PER_KG = 2
const FAT_G_PER_KG = 0.9

/** Mifflin-St Jeor resting energy expenditure, in kcal/day. */
export function calculateBmr(p: Profile): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age
  return base + (p.sex === 'male' ? 5 : -161)
}

export function calculateTargets(p: Profile): DailyTargets {
  const bmr = calculateBmr(p)
  const tdee = Math.round(bmr * ACTIVITY_FACTORS[p.activity])
  const kcal = Math.round(tdee * GOAL_ADJUSTMENTS[p.goal])
  const proteinG = Math.round(p.weightKg * PROTEIN_G_PER_KG)
  const fatG = Math.round(p.weightKg * FAT_G_PER_KG)
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4))
  return { bmr, tdee, kcal, proteinG, fatG, carbsG }
}
