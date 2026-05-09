import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './App'
import { Dashboard } from './views/Dashboard'
import { Garage } from './views/Garage'
import { Upgrades } from './views/Upgrades'
import { Missions } from './views/Missions'
import { Colors } from './views/Colors'
import { Arena } from './views/Arena'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'garage', element: <Garage /> },
      { path: 'upgrades', element: <Upgrades /> },
      { path: 'missions', element: <Missions /> },
      { path: 'colors', element: <Colors /> },
      { path: 'arena', element: <Arena /> },
    ],
  },
])
