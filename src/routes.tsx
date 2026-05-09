import { lazy, Suspense, type ReactElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './App'
import { RouteFallback } from './components/RouteFallback'

const Dashboard = lazy(() =>
  import('./views/Dashboard').then((m) => ({ default: m.Dashboard })),
)
const Garage = lazy(() => import('./views/Garage').then((m) => ({ default: m.Garage })))
const Upgrades = lazy(() =>
  import('./views/Upgrades').then((m) => ({ default: m.Upgrades })),
)
const Missions = lazy(() =>
  import('./views/Missions').then((m) => ({ default: m.Missions })),
)
const Colors = lazy(() => import('./views/Colors').then((m) => ({ default: m.Colors })))
const Arcade = lazy(() => import('./views/Arcade').then((m) => ({ default: m.Arcade })))
const Arena = lazy(() => import('./views/Arena').then((m) => ({ default: m.Arena })))
const Shop = lazy(() => import('./views/Shop').then((m) => ({ default: m.Shop })))
const Vehicles = lazy(() =>
  import('./views/Vehicles').then((m) => ({ default: m.Vehicles })),
)

function wrap(node: ReactElement) {
  return <Suspense fallback={<RouteFallback />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: wrap(<Dashboard />) },
      { path: 'garage', element: wrap(<Garage />) },
      { path: 'upgrades', element: wrap(<Upgrades />) },
      { path: 'missions', element: wrap(<Missions />) },
      { path: 'colors', element: wrap(<Colors />) },
      { path: 'arena', element: wrap(<Arena />) },
      { path: 'shop', element: wrap(<Shop />) },
      { path: 'vehicles', element: wrap(<Vehicles />) },
      { path: 'arcade', element: wrap(<Arcade />) },
    ],
  },
])
