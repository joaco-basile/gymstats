import { describe, expect, it } from 'vitest'
import { nutrientsFor, sumNutrients, type Food } from './nutrition'

const rice: Food = { id: 1, name: 'Rice (cooked)', basis: 'per100g', kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3 }
const egg: Food = { id: 2, name: 'Egg', basis: 'perUnit', kcal: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8 }

describe('nutrientsFor', () => {
  it('scales per-100g foods by grams', () => {
    expect(nutrientsFor(rice, 250)).toEqual({ kcal: 325, proteinG: 6.8, carbsG: 70, fatG: 0.8 })
  })

  it('scales per-unit foods by number of units', () => {
    expect(nutrientsFor(egg, 3)).toEqual({ kcal: 216, proteinG: 18.9, carbsG: 1.2, fatG: 14.4 })
  })
})

describe('sumNutrients', () => {
  it('adds every macro and returns zeros for an empty list', () => {
    expect(sumNutrients([])).toEqual({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 })
    expect(
      sumNutrients([
        { kcal: 325, proteinG: 6.8, carbsG: 70, fatG: 0.8 },
        { kcal: 216, proteinG: 18.9, carbsG: 1.2, fatG: 14.4 },
      ]),
    ).toEqual({ kcal: 541, proteinG: 25.7, carbsG: 71.2, fatG: 15.2 })
  })
})
