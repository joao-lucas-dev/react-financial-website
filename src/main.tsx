import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import App from './App.tsx'
import DashboardProvider from './context/DashboardProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/dashboard"
          element={
            <DashboardProvider>
              <Dashboard />
            </DashboardProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
