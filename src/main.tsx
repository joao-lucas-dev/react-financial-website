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
import Settings from './pages/Settings'
import CreditCardBillsPage from './pages/CreditCardBills'
import CreditCardDetailsPage from './pages/CreditCardDetails'
import SavingsPage from './pages/Savings'
import ThemeProvider from './context/ThemeProvider.tsx'
import ScrollToTop from './components/ScrollToTop'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <Routes>
              <Route element={<RedirectIfAuthenticated />}>
                <Route path="/login" element={<Login />} />
              </Route>

              <Route element={<ProtectPage />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transacoes" element={<Transactions />} />
                <Route path="/faturas" element={<CreditCardBillsPage />} />
                <Route path="/faturas/:cardId" element={<CreditCardDetailsPage />} />
                <Route path="/relatorios" element={<CategoryReports />} />
                <Route path="/caixinhas" element={<SavingsPage />} />
                <Route path="/configuracoes" element={<Settings />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>,
  )
}
