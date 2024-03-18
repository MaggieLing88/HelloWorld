import 'inter-ui/inter.css'

import { ThemeProvider } from '@opengovsg/design-system-react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { PageLayout } from './pages/PageLayout'
import { theme } from './theme'
import { LoggedInPage } from './pages/LoggedIn'
import { ErrorPage } from './pages/Error'

const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'logged-in',
        element: <LoggedInPage />,
      },
      {
        path: 'error',
        element: <ErrorPage />,
      },
    ],
  },
])

const App = (): JSX.Element => {
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
