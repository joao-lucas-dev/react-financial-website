import { House, MessageCircleQuestion, Settings, Newspaper, ChartColumn } from 'lucide-react'
import { Link } from 'react-router-dom'
import LogoutButton from './LoggoutButton.tsx'

interface IParams {
  activePage: string
}

const MenuAside = ({ activePage }: IParams) => {
  const navigationItems = [
    { id: 'dashboard', icon: House, label: 'Dashboard', path: '/dashboard' },
    { id: 'transacoes', icon: Newspaper, label: 'Transações', path: '/transacoes' },
    { id: 'relatorios', icon: ChartColumn, label: 'Relatórios', path: '/relatorios' },
    { id: 'feedback', icon: MessageCircleQuestion, label: 'Feedback', path: '/feedback' },
    { id: 'configuracoes', icon: Settings, label: 'Configurações', path: '/configuracoes' }
  ]

  return (
    <aside 
      className="fixed top-4 left-4 h-[calc(100vh-2rem)] hidden xl-lg:flex flex-col justify-between"
      style={{
        width: '240px',
        backgroundColor: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}
    >
      {/* Logo/Brand Section */}
      <div className="mb-8">
        <h2 
          className="text-xl font-semibold" 
          style={{ color: '#009688' }}
        >
          FinanceApp
        </h2>
        <p 
          className="text-sm mt-1" 
          style={{ color: '#616161' }}
        >
          Gerencie suas finanças
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = activePage === item.id
            const IconComponent = item.icon
            
            return (
              <li key={item.id}>
                <Link 
                  to={{ pathname: item.path }} 
                  className="flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 group"
                  style={{
                    backgroundColor: isActive ? '#009688' : 'transparent',
                    color: isActive ? 'white' : '#616161',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '500' : '400'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F5F5F5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <IconComponent 
                    size={20} 
                    className="mr-3 flex-shrink-0"
                    style={{ 
                      color: isActive ? 'white' : '#616161'
                    }}
                  />
                  <span className="font-medium">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div 
        className="pt-6 border-t" 
        style={{ borderTopColor: '#E0E0E0' }}
      >
        <div className="flex items-center mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: '#009688' }}
          >
            <span className="text-white font-medium text-sm">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm font-medium truncate" 
              style={{ color: '#424242' }}
            >
              Usuário
            </p>
            <p 
              className="text-xs truncate" 
              style={{ color: '#616161' }}
            >
              usuario@email.com
            </p>
          </div>
        </div>
        
        <LogoutButton />
      </div>
    </aside>
  )
}

export default MenuAside
