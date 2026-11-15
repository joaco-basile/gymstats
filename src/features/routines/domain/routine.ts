export interface Exercise {
  id: string
  name: string
  sets: number
  reps: string // free text: "10", "8-12", "AMRAP", "30s"
  restSec: number
  notes: string
}

export interface Routine {
  id?: number
  name: string
  exercises: Exercise[]
  updatedAt: number
}

export function newExercise(): Exercise {
  return { id: crypto.randomUUID(), name: '', sets: 3, reps: '10', restSec: 90, notes: '' }
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items
  const copy = [...items]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}
