import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { GymStatsDb } from './db'
import { BackupError, exportBackup, parseBackup, restoreBackup } from './backup'

async function seed(db: GymStatsDb) {
  await db.profile.put({ id: 'me', sex: 'male', age: 30, heightCm: 180, weightKg: 80, activity: 'moderate', goal: 'maintain' })
  const foodId = await db.foods.add({ name: 'Egg', basis: 'perUnit', kcal: 72, proteinG: 6.3, carbsG: 0.4, fatG: 4.8 })
  await db.logs.add({ date: '2026-11-15', meal: 'breakfast', foodId: foodId!, foodName: 'Egg', basis: 'perUnit', quantity: 2, kcal: 144, proteinG: 12.6, carbsG: 0.8, fatG: 9.6 })
  await db.routines.add({ name: 'Push', updatedAt: 1, exercises: [{ id: 'a', name: 'Bench press', sets: 4, reps: '8', restSec: 120, notes: '' }] })
}

describe('backup', () => {
  it('round-trips every table through JSON, replacing existing data', async () => {
    const source = new GymStatsDb('backup-source')
    await seed(source)
    const json = JSON.stringify(await exportBackup(source))

    const target = new GymStatsDb('backup-target')
    await target.foods.add({ name: 'Stale food', basis: 'per100g', kcal: 1, proteinG: 0, carbsG: 0, fatG: 0 })
    await restoreBackup(target, parseBackup(json))

    const restored = await exportBackup(target)
    const original = JSON.parse(json)
    expect({ ...restored, exportedAt: '' }).toEqual({ ...original, exportedAt: '' })
    expect(await target.foods.where('name').equals('Stale food').count()).toBe(0)
  })

  it('rejects files that are not GymStats backups', () => {
    expect(() => parseBackup('nope')).toThrow('The file is not valid JSON.')
    expect(() => parseBackup('{"app":"other"}')).toThrow('This is not a GymStats backup.')
    expect(() => parseBackup('{"app":"gymstats","version":99}')).toThrow('newer version')
    expect(() => parseBackup('{"app":"gymstats","version":1,"profile":[]}')).toThrow('Backup is missing "foods".')
  })

  it('exposes an error code (and the missing key) so the UI can translate the message', () => {
    const codeOf = (text: string) => {
      try {
        parseBackup(text)
      } catch (e) {
        return e instanceof BackupError ? { code: e.code, key: e.key } : 'not a BackupError'
      }
    }
    expect(codeOf('nope')).toEqual({ code: 'invalidJson', key: undefined })
    expect(codeOf('{"app":"other"}')).toEqual({ code: 'notBackup', key: undefined })
    expect(codeOf('{"app":"gymstats","version":99}')).toEqual({ code: 'newerVersion', key: undefined })
    expect(codeOf('{"app":"gymstats","version":1,"profile":[]}')).toEqual({ code: 'missingKey', key: 'foods' })
  })
})
