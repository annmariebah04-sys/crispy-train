import { useState } from 'react'
import { StoreProvider, useStore } from './lib/store'
import { missingFirebaseConfig } from './lib/firebase'
import HomeScreen from './components/HomeScreen'
import KidHome from './components/kid/KidHome'
import ParentGate from './components/parent/ParentGate'
import ParentDashboard from './components/parent/ParentDashboard'

type Route = { view: 'home' } | { view: 'kid'; kidId: string } | { view: 'parent-gate' } | { view: 'parent' }

function AppShell() {
  const [route, setRoute] = useState<Route>({ view: 'home' })
  const { loading } = useStore()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass flex items-center gap-3 rounded-full px-6 py-3 text-sm text-white/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
          Loading ChoreQuest…
        </div>
      </div>
    )
  }

  return (
    <>
      {route.view === 'home' && (
        <HomeScreen
          onSelectKid={(kidId) => setRoute({ view: 'kid', kidId })}
          onParent={() => setRoute({ view: 'parent-gate' })}
        />
      )}
      {route.view === 'kid' && (
        <KidHome kidId={route.kidId} onBack={() => setRoute({ view: 'home' })} />
      )}
      {route.view === 'parent-gate' && (
        <ParentGate
          onSuccess={() => setRoute({ view: 'parent' })}
          onBack={() => setRoute({ view: 'home' })}
        />
      )}
      {route.view === 'parent' && <ParentDashboard onBack={() => setRoute({ view: 'home' })} />}
    </>
  )
}

function MissingConfigScreen() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-bold">Firebase isn't configured yet</h1>
      <p className="mt-3 text-white/60">
        ChoreQuest needs a Firebase project so chores &amp; points sync across every device. Missing:
      </p>
      <code className="glass mt-3 rounded-lg px-4 py-2 text-sm text-amber-300">
        {missingFirebaseConfig.join(', ')}
      </code>
      <p className="mt-4 text-sm text-white/40">
        Copy <code className="text-white/60">.env.example</code> to <code className="text-white/60">.env</code>,
        fill in your Firebase project's config, and restart the app. See README.md for step-by-step setup.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-noise text-white">
      {missingFirebaseConfig.length > 0 ? (
        <MissingConfigScreen />
      ) : (
        <StoreProvider>
          <AppShell />
        </StoreProvider>
      )}
    </div>
  )
}
