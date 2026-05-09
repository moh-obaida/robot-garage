import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './App'
import { RouteErrorFallback } from './components/RouteErrorFallback'
import { Dashboard } from './views/Dashboard'
import { Garage } from './views/Garage'
import { Upgrades } from './views/Upgrades'
import { Missions } from './views/Missions'
import { Colors } from './views/Colors'
import { Arcade } from './views/Arcade'
import { Arena } from './views/Arena'
import { Shop } from './views/Shop'
import { Vehicles } from './views/Vehicles'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'garage', element: <Garage /> },
      { path: 'upgrades', element: <Upgrades /> },
      { path: 'missions', element: <Missions /> },
      { path: 'colors', element: <Colors /> },
      { path: 'arena', element: <Arena /> },
      { path: 'shop', element: <Shop /> },
      { path: 'vehicles', element: <Vehicles /> },
      { path: 'arcade', element: <Arcade /> },
    ],
  },
])
