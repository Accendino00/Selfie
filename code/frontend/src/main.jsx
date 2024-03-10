import React from 'react'

import ReactDOM from 'react-dom/client'

import LoginPage from './pages/login_register/LoginPage.jsx'

import ErrorPage from './error-page.jsx'

import LandingPage from './pages/common/LandingPage.jsx'

import CalendarPage from './pages/calendar/CalendarPage.jsx'


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
      path: "/home",
      element: <CalendarPage />,
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
