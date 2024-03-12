import React from 'react'

import ReactDOM from 'react-dom/client'

import LoginPage from './pages/login_register/LoginPage.jsx'

import ErrorPage from './error-page.jsx'

import LandingPage from './pages/common/LandingPage.jsx'

import CalendarPage from './pages/calendar/CalendarPage.jsx'

import NotesPage from './pages/notes/NotesPage.jsx'

import TimerPage from './pages/timer/TimerPage.jsx'


import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";




function App() {

  const router = createBrowserRouter([
    // Landing page
    {
      path: "/",
      element: <LandingPage />,
    },
    // Routes without a navbar on the side
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/calendar",
      element: <CalendarPage />,
    },
    {
      path: "/notes",
      element: <NotesPage />,
    },
    {
      path: "/timer",
      element: <TimerPage />,
    },
    // Routes with a navbar on the side
    {
      path: "*",
      element: <ErrorPage />,
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
