import type { GymStatsDb, StoredProfile } from './db'
import type { Food, FoodLogEntry } from '../features/nutrition/domain/nutrition'
import type { Routine } from '../features/routines/domain/routine'

export const BACKUP_VERSION = 1

export interface Backup {
  app: 'gymstats'
  version: number
  exportedAt: string
  profile: StoredProfile[]
  foods: Food[]
  logs: FoodLogEntry[]
  routines: Routine[]
}

export async function exportBackup(db: GymStatsDb): Promise<Backup> {
  const [profile, foods, logs, routines] = await Promise.all([
    db.profile.toArray(),
    db.foods.toArray(),
    db.logs.toArray(),
    db.routines.toArray(),
  ])
  return { app: 'gymstats', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), profile, foods, logs, routines }
}

export type BackupErrorCode = 'invalidJson' | 'notBackup' | 'newerVersion' | 'missingKey'

/** Carries a code so the UI can show a translated message; `message` stays English for debugging. */
export class BackupError extends Error {
  readonly code: BackupErrorCode
  readonly key?: string

  constructor(code: BackupErrorCode, message: string, key?: string) {
    super(message)
    this.name = 'BackupError'
    this.code = code
    this.key = key
  }
}

export function parseBackup(text: string): Backup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new BackupError('invalidJson', 'The file is not valid JSON.')
  }
  const b = data as Partial<Backup>
  if (b?.app !== 'gymstats' || typeof b.version !== 'number') {
    throw new BackupError('notBackup', 'This is not a GymStats backup.')
  }
  if (b.version > BACKUP_VERSION) {
    throw new BackupError('newerVersion', 'This backup comes from a newer version of the app.')
  }
  for (const key of ['profile', 'foods', 'logs', 'routines'] as const) {
    if (!Array.isArray(b[key])) throw new BackupError('missingKey', `Backup is missing "${key}".`, key)
  }
  return b as Backup
}

/** Replaces ALL local data with the backup contents, atomically. */
export async function restoreBackup(db: GymStatsDb, backup: Backup): Promise<void> {
  await db.transaction('rw', [db.profile, db.foods, db.logs, db.routines], async () => {
    await Promise.all([db.profile.clear(), db.foods.clear(), db.logs.clear(), db.routines.clear()])
    await db.profile.bulkAdd(backup.profile)
    await db.foods.bulkAdd(backup.foods)
    await db.logs.bulkAdd(backup.logs)
    await db.routines.bulkAdd(backup.routines)
  })
}
