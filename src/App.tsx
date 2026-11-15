import { useEffect, useState } from 'react'
import { TodayScreen } from './features/nutrition/ui/TodayScreen'
import { FoodsScreen } from './features/nutrition/ui/FoodsScreen'
import { RoutinesScreen } from './features/routines/ui/RoutinesScreen'
import { ProfileScreen } from './features/calories/ui/ProfileScreen'
import { requestPersistentStorage } from './shared/db'
import { useI18n } from './shared/i18n/context'

type Tab = 'today' | 'foods' | 'routines' | 'profile'

const TABS: { id: Tab; icon: string }[] = [
  { id: 'today', icon: '🍽️' },
  { id: 'foods', icon: '📒' },
  { id: 'routines', icon: '🏋️' },
  { id: 'profile', icon: '👤' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const { t } = useI18n()

  useEffect(() => {
    requestPersistentStorage().catch(() => undefined)
  }, [])

  return (
    <div className="app">
      <main className="screen">
        {tab === 'today' && <TodayScreen onGoToProfile={() => setTab('profile')} onGoToFoods={() => setTab('foods')} />}
        {tab === 'foods' && <FoodsScreen />}
        {tab === 'routines' && <RoutinesScreen />}
        {tab === 'profile' && <ProfileScreen />}
      </main>
      <nav className="tabbar">
        {TABS.map((item) => (
          <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => setTab(item.id)}>
            <span aria-hidden>{item.icon}</span>
            {t.nav[item.id]}
          </button>
        ))}
      </nav>
    </div>
  )
}
