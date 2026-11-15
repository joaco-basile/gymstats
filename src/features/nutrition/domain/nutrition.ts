export interface Nutrients {
  kcal: number
  proteinG: number
  carbsG: number
  fatG: number
}

/** per100g: values refer to 100 g. perUnit: values refer to one unit/portion. */
export type FoodBasis = 'per100g' | 'perUnit'

export interface Food extends Nutrients {
  id?: number
  name: string
  basis: FoodBasis
}

export type Meal = 'breakfast' | 'lunch' | 'snack' | 'dinner'

export const MEALS: Meal[] = ['breakfast', 'lunch', 'snack', 'dinner']

/** A logged entry keeps a snapshot so editing/deleting a food never rewrites history. */
export interface FoodLogEntry extends Nutrients {
  id?: number
  date: string // YYYY-MM-DD (local)
  meal: Meal
  foodId: number
  foodName: string
  basis: FoodBasis
  quantity: number
}

const ZERO: Nutrients = { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }

// toPrecision first absorbs binary noise (0.3 * 2.5 = 0.7499999...) before rounding.
const round1 = (x: number) => Math.round(Number(x.toPrecision(12)) * 10) / 10

export function nutrientsFor(food: Food, quantity: number): Nutrients {
  const factor = food.basis === 'per100g' ? quantity / 100 : quantity
  return {
    kcal: Math.round(food.kcal * factor),
    proteinG: round1(food.proteinG * factor),
    carbsG: round1(food.carbsG * factor),
    fatG: round1(food.fatG * factor),
  }
}

export function sumNutrients(items: Nutrients[]): Nutrients {
  const total = items.reduce(
    (acc, n) => ({
      kcal: acc.kcal + n.kcal,
      proteinG: acc.proteinG + n.proteinG,
      carbsG: acc.carbsG + n.carbsG,
      fatG: acc.fatG + n.fatG,
    }),
    ZERO,
  )
  return {
    kcal: Math.round(total.kcal),
    proteinG: round1(total.proteinG),
    carbsG: round1(total.carbsG),
    fatG: round1(total.fatG),
  }
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function shiftDateKey(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return toDateKey(new Date(y, m - 1, d + days))
}
