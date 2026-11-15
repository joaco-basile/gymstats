import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../../shared/db'
import { calculateTargets, type DailyTargets, type Profile } from '../domain/energy'

/** undefined while loading, null when no profile was saved yet. */
export function useProfile(): { profile: Profile | null | undefined; targets: DailyTargets | null } {
  const profile = useLiveQuery(async () => (await db.profile.get('me')) ?? null, [])
  return { profile, targets: profile ? calculateTargets(profile) : null }
}

export async function saveProfile(profile: Profile): Promise<void> {
  await db.profile.put({ ...profile, id: 'me' })
}
