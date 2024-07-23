import React, { useEffect, useState } from 'react'

import ReactDOM from 'react-dom/client'

import LoginPage from './pages/login_register/LoginPage.jsx'

import ErrorPage from './error-page.jsx'

import LandingPage from './pages/common/LandingPage.jsx'

import CalendarPage from './pages/calendar/CalendarPage.jsx'

import NotesPage from './pages/notes/NotesPage.jsx'

import TimerPage from './pages/timer/TimerPage.jsx'

import HomePage from './pages/common/Homepage.jsx'

import NavPage from './pages/common/NavPage.jsx'

import Navbar from './pages/navbar/Navbar.jsx'

import PomodoroPage from './pages/pomodoro/PomodoPage.jsx'

import TimeMachine from './pages/common/TimeMachine.jsx'

import CustomDate from './pages/common/overrideDate';


import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


function App() {
  
  window.Date = CustomDate;

  const router = createBrowserRouter([
    // Landing page
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/home",
      element: <HomePage />
    },
    {
      path: "/timemachine",
      element: <TimeMachine />,
    },
    {
      element: <NavPage />,
      children: [
        {
          path: "/calendar",
          element: <CalendarPage />,
        },
        {
          path: "/notes",
          element: <NotesPage />,
        },
        {
          path: "/timer/:studyTime/:breakTime/:cycles/:totalMinutes",
          element: <PomodoroPage />,
        },
        // Route without parameters
        {
          path: "/timer",
          element: <PomodoroPage />,
        },
      ]
    },
    // Routes without a navbar on the side
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
