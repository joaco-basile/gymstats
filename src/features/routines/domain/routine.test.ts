import { describe, expect, it } from 'vitest'
import { moveItem, newExercise } from './routine'

describe('moveItem', () => {
  it('moves an item without mutating the original array', () => {
    const items = ['a', 'b', 'c']
    expect(moveItem(items, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(items, 2, 1)).toEqual(['a', 'c', 'b'])
    expect(items).toEqual(['a', 'b', 'c'])
  })

  it('ignores moves out of bounds', () => {
    const items = ['a', 'b']
    expect(moveItem(items, 0, -1)).toBe(items)
    expect(moveItem(items, 1, 2)).toBe(items)
  })
})

describe('newExercise', () => {
  it('creates exercises with unique ids and sensible defaults', () => {
    const a = newExercise()
    const b = newExercise()
    expect(a.id).not.toBe(b.id)
    expect(a).toMatchObject({ name: '', sets: 3, reps: '10', restSec: 90, notes: '' })
  })
})
