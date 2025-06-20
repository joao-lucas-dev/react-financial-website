import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Login from './pages/Login'
import AuthProvider from './context/AuthProvider.tsx'
import ProtectPage from './pages/ProtectPage.tsx'
import RedirectIfAuthenticated from './pages/RedirectIfAuthenticated.tsx'
import CategoryReports from './pages/CategoryReports'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<RedirectIfAuthenticated />}>
              <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectPage />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/transacoes" element={<Transactions />} />
              <Route path="/relatorios" element={<CategoryReports />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  )
}
