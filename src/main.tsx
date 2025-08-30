import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
import AuthTestPage from './pages/AuthTestPage'
import ThemeProvider from './context/ThemeProvider.tsx'
import ScrollToTop from './components/ScrollToTop'

// Inicializa os interceptors globais de autenticação
import { setupAxiosInterceptors } from './api/setupInterceptors'
setupAxiosInterceptors()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Não tenta novamente se for erro 401 (será tratado pelo authManager)
        if (error?.response?.status === 401) {
          return false
        }
        return failureCount < 1
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Não tenta novamente se for erro 401 (será tratado pelo authManager)
        if (error?.response?.status === 401) {
          return false
        }
        return failureCount < 1
      },
    },
  },
})

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
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
                  <Route path="/cartoes" element={<CreditCardBillsPage />} />
                  <Route path="/cartoes/:cardId" element={<CreditCardDetailsPage />} />
                  <Route path="/relatorios" element={<CategoryReports />} />
                  <Route path="/caixinhas" element={<SavingsPage />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  <Route path="/auth-test" element={<AuthTestPage />} />
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
