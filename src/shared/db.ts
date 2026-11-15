import Dexie, { type EntityTable } from 'dexie'
import type { Profile } from '../features/calories/domain/energy'
import type { Food, FoodLogEntry } from '../features/nutrition/domain/nutrition'
import type { Routine } from '../features/routines/domain/routine'

export interface StoredProfile extends Profile {
  id: 'me'
}

export class GymStatsDb extends Dexie {
  profile!: EntityTable<StoredProfile, 'id'>
  foods!: EntityTable<Food, 'id'>
  logs!: EntityTable<FoodLogEntry, 'id'>
  routines!: EntityTable<Routine, 'id'>

  constructor(name = 'gymstats') {
    super(name)
    this.version(1).stores({
      profile: 'id',
      foods: '++id, name',
      logs: '++id, date, foodId',
      routines: '++id, name',
    })
  }
}

export const db = new GymStatsDb()

/** Asks the browser not to evict our data under storage pressure. */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  if (await navigator.storage.persisted()) return true
  return navigator.storage.persist()
}
