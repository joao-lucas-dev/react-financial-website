import {
  ChartColumnDecreasing,
  MoveDownLeft,
  MoveUpRight,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus
} from 'lucide-react'
import { Link } from 'react-router-dom'

import TablePreview from '../../components/TablePreview'
import ChartComponent from '../../components/ChartComponent.tsx'
import EnhancedChartComponent from '../../components/EnhancedChartComponent.tsx'
import FloatingButton from '../../components/FloatingButton.tsx'

import './styles.css'
import Header from '../../components/Header.tsx'
import MenuAside from '../../components/MenuAside.tsx'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import useDashboard from '../../hooks/useDashboard.ts'
import useTransactions from '../../hooks/useTransactions.ts'
import CountUp from '../../components/CountUp.tsx'
import useCategories from '../../hooks/useCategories.ts'
import { useState, useEffect } from 'react'
import { ITransaction } from '../../types/transactions.ts'
import CategoryIcon from '../../components/CategoryIcon'
import TableTransactions from '../../components/TableTransactions'
import { Filter } from '../../components/Filter'

export default function Dashboard() {
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    transaction: {} as ITransaction,
    type: '',
  })

  const { chartCategories, handleGetChartCategories, categories } =
    useCategories()

  const {
    rows,
    handleCreateTransaction,
    handleCreateCompleteTransaction,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleGetOverviewTransactions,
    overview,
    handleGetBalance,
    balance,
    handleGetPreviewTransactions,
    handleGetRecentTransactions,
    recentTransactions,
    handleDeleteMultipleTransactions,
  } = useTransactions(handleGetChartCategories)
  const {
    getMonth,
    getGreeting,
    getNextMonth,
    getPreviousMonth,
    getToday,
    hasToday,
    currentMonth,
    setCurrentMonth,
  } = useDashboard(
    rows,
    handleGetChartCategories,
    handleGetOverviewTransactions,
    handleGetBalance,
    handleGetPreviewTransactions,
    handleGetRecentTransactions,
  )

  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>('desc');
  const [filter, setFilter] = useState<'before' | 'after' | 'both'>('both');
  const [typeFilter, setTypeFilter] = useState<'income' | 'outcome' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    handleGetRecentTransactions(filter, field, order, typeFilter);
  };

  const handleFilterChange = (newFilter: 'before' | 'after' | 'both', newType: 'income' | 'outcome' | 'all') => {
    setFilter(newFilter);
    setTypeFilter(newType);
    setSortBy('updated_at');
    setSortOrder('desc');
    handleGetRecentTransactions(newFilter, 'updated_at', 'desc', newType);
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div className="w-full h-full" style={{ backgroundColor: '#F5F5F5' }}>
        {/* <Header title="Dashboard" activePage="dashboard" /> */}

        <div className="flex h-full">
          <MenuAside activePage="dashboard" />

          <main 
            className="flex-1 mt-4 pl-0 xl-lg:pl-64" 
            style={{ 
              maxWidth: '1200px', 
              margin: '0 auto',
              padding: '2rem'
            }}
          >
            {/* Welcome Section */}
            <div 
              className="bg-white rounded-2xl p-6 mb-8" 
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 
                    className="text-2xl font-semibold mb-2" 
                    style={{ color: '#424242' }}
                  >
                    {getGreeting()}
                  </h1>
                  <p style={{ color: '#616161', fontSize: '0.875rem' }}>
                    Bem-vindo de volta ao seu painel financeiro
                  </p>
                </div>
                <div className="text-right">
                  <p style={{ color: '#616161', fontSize: '0.875rem' }}>Saldo Total</p>
                  <div 
                    className="text-2xl font-bold" 
                    style={{ color: '#009688' }}
                  >
                    <CountUp valueNumber={balance} />
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Card Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <div className="relative group" style={{ maxWidth: '450px' }}>
                  {/* Second Card (Background) */}
                  <div 
                    className="absolute cursor-pointer transition-all duration-300"
                    style={{
                      top: '10px',
                      right: '-20px',
                      width: '350px',
                      height: '220px',
                      borderRadius: '1rem',
                      background: 'linear-gradient(135deg, rgba(66, 66, 66, 0.3), rgba(97, 97, 97, 0.3), rgba(117, 117, 117, 0.3))',
                      transform: 'rotate(5deg)',
                      zIndex: 1,
                      opacity: 0.4,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      const container = e.currentTarget.parentElement
                      const button = container?.querySelector('.add-card-button') as HTMLElement
                      
                      e.currentTarget.style.opacity = '0.8'
                      e.currentTarget.style.transform = 'rotate(3deg) translateX(-5px)'
                      
                      if (button) {
                        button.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)'
                        button.style.boxShadow = '0 12px 40px rgba(76, 175, 80, 0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      const container = e.currentTarget.parentElement
                      const button = container?.querySelector('.add-card-button') as HTMLElement
                      
                      e.currentTarget.style.opacity = '0.4'
                      e.currentTarget.style.transform = 'rotate(5deg) translateX(0px)'
                      
                      if (button) {
                        button.style.background = 'linear-gradient(135deg, #616161, #424242)'
                        button.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  />
                  
                  {/* Main Card */}
                  <div 
                    className="relative overflow-hidden"
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '240px',
                      borderRadius: '1rem',
                      background: 'linear-gradient(135deg, #00695C, #009688, #4DB6AC)',
                      color: 'white',
                      padding: '2rem',
                      position: 'relative',
                      zIndex: 2,
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Decorative background orb */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,184,0,0.3), rgba(0,150,136,0.2))',
                        filter: 'blur(60px)'
                      }}
                    />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-sm opacity-80 mb-1">Cartão Principal</p>
                          <p className="text-lg font-medium tracking-wider">•••• •••• •••• 4532</p>
                        </div>
                        <CreditCard className="w-8 h-8 opacity-80" />
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm opacity-80">Saldo Disponível</p>
                          <p className="text-2xl font-bold">
                            <CountUp valueNumber={balance} />
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-80">Vencimento</p>
                          <p className="text-lg font-medium">12/28</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Add Card Button */}
                  <button
                    className="add-card-button absolute transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                      top: '50%',
                      right: '-10px',
                      transform: 'translateY(-50%)',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #616161, #424242)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      zIndex: 3,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      const container = e.currentTarget.parentElement
                      const card = container?.querySelector('.absolute.cursor-pointer') as HTMLElement
                      
                      e.currentTarget.style.background = 'linear-gradient(135deg, #4CAF50, #388E3C)'
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(76, 175, 80, 0.3)'
                      
                      if (card) {
                        card.style.opacity = '0.8'
                        card.style.transform = 'rotate(3deg) translateX(-5px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      const container = e.currentTarget.parentElement
                      const card = container?.querySelector('.absolute.cursor-pointer') as HTMLElement
                      
                      e.currentTarget.style.background = 'linear-gradient(135deg, #616161, #424242)'
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)'
                      
                      if (card) {
                        card.style.opacity = '0.4'
                        card.style.transform = 'rotate(5deg) translateX(0px)'
                      }
                    }}
                    onClick={() => {
                      // Aqui você pode adicionar a lógica para criar um novo cartão
                      console.log('Adicionar novo cartão')
                    }}
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-4">
                <div 
                  className="bg-white rounded-lg p-4 text-center"
                  style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                >
                  <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: '#009688' }} />
                  <p style={{ fontSize: '0.75rem', color: '#616161' }}>Total de Entradas</p>
                  <p className="text-lg font-bold" style={{ color: '#424242' }}>
                    <CountUp valueNumber={overview?.income?.total} />
                  </p>
                </div>
                
                <div 
                  className="bg-white rounded-lg p-4 text-center"
                  style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                >
                  <TrendingDown className="w-6 h-6 mx-auto mb-2" style={{ color: '#FF9800' }} />
                  <p style={{ fontSize: '0.75rem', color: '#616161' }}>Total de Saídas</p>
                  <p className="text-lg font-bold" style={{ color: '#424242' }}>
                    <CountUp valueNumber={overview?.outcome?.total} />
                  </p>
                </div>
                
                <div 
                  className="bg-white rounded-lg p-4 text-center"
                  style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                >
                  <PiggyBank className="w-6 h-6 mx-auto mb-2" style={{ color: '#4CAF50' }} />
                  <p style={{ fontSize: '0.75rem', color: '#616161' }}>Economias</p>
                  <p className="text-lg font-bold" style={{ color: '#424242' }}>
                    <CountUp valueNumber={overview?.remaining?.total} />
                  </p>
                </div>
              </div>
            </div>

            {/* Monthly Overview Table - Full Width */}
            <div 
              className="bg-white rounded-xl p-6 mb-8"
              style={{ 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => getPreviousMonth()}
                    style={{ color: '#616161' }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 
                    className="text-lg font-medium" 
                    style={{ color: '#424242' }}
                  >
                    {getMonth ? `${getMonth()}` : <Skeleton height={20} width={100} />}
                  </h2>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => getNextMonth()}
                    style={{ color: '#616161' }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <button
                  disabled={hasToday()}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-all"
                  style={{ 
                    backgroundColor: hasToday() ? '#E0E0E0' : '#009688'
                  }}
                  onClick={() => getToday()}
                >
                  <Calendar size={16} className="mr-2 inline" />
                  Hoje
                </button>
              </div>
              
              <div style={{ height: '350px', overflow: 'auto', border: '1px solid #E0E0E0', borderRadius: '0.75rem' }}>
                <TablePreview
                  rows={rows}
                  handleCreateTransaction={handleCreateTransaction}
                  handleCreateCompleteTransaction={handleCreateCompleteTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                  handleUpdateTransaction={handleUpdateTransaction}
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                  categories={categories}
                  from="dashboard"
                />
              </div>
            </div>
              
            {/* Category Spending - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Income Categories */}
              <div 
                className="bg-white rounded-xl p-6"
                style={{ 
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  height: '320px'
                }}
              >
                <h3 
                  className="text-base font-medium mb-4" 
                  style={{ color: '#424242' }}
                >
                  Maiores Entradas
                </h3>
                {chartCategories.income.config.length === 0 ? (
                  <div className="h-56 flex items-center justify-center">
                    <p style={{ color: '#A0A0A0' }}>Sem valores registrados</p>
                  </div>
                ) : (
                  <div className="flex h-56">
                    {/* Lista de categorias - metade esquerda */}
                    <div className="w-1/2 pr-4 overflow-y-auto">
                      {chartCategories.income.config.slice(0, 5).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                          style={{ borderBottomColor: '#F5F5F5' }}
                        >
                          <div className="flex items-center min-w-0">
                            <CategoryIcon size="small" category={item} />
                            <span 
                              className="ml-2 text-sm truncate" 
                              style={{ color: '#424242' }}
                            >
                              {item.name}
                            </span>
                          </div>
                          <span 
                            className="text-sm font-medium ml-2 flex-shrink-0" 
                            style={{ color: '#424242' }}
                          >
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart e botão - metade direita */}
                    <div className="w-1/2 flex flex-col items-center">
                      <div className="flex-1 flex items-center justify-center">
                        <EnhancedChartComponent 
                          categories={chartCategories.income.chartConfig} 
                          size={200}
                        />
                      </div>
                      <Link 
                        to={{ pathname: '/relatorios', search: `?type=incomes&date=${rows.length > 0 ? rows[0].date.substring(0, 7) : ''}` }}
                        className="text-xs px-3 py-2 rounded border transition-all mt-2"
                        style={{
                          borderColor: '#009688',
                          color: '#009688'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#009688'
                          e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = '#009688'
                        }}
                      >
                        Ver relatório completo
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Outcome Categories */}
              <div 
                className="bg-white rounded-xl p-6"
                style={{ 
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  height: '320px'
                }}
              >
                <h3 
                  className="text-base font-medium mb-4" 
                  style={{ color: '#424242' }}
                >
                  Maiores Saídas
                </h3>
                {chartCategories.notIncome.config.length === 0 ? (
                  <div className="h-56 flex items-center justify-center">
                    <p style={{ color: '#A0A0A0' }}>Sem valores registrados</p>
                  </div>
                ) : (
                  <div className="flex h-56">
                    {/* Lista de categorias - metade esquerda */}
                    <div className="w-1/2 pr-4 overflow-y-auto">
                      {chartCategories.notIncome.config.slice(0, 5).map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                          style={{ borderBottomColor: '#F5F5F5' }}
                        >
                          <div className="flex items-center min-w-0">
                            <CategoryIcon size="small" category={item} />
                            <span 
                              className="ml-2 text-sm truncate" 
                              style={{ color: '#424242' }}
                            >
                              {item.name}
                            </span>
                          </div>
                          <span 
                            className="text-sm font-medium ml-2 flex-shrink-0" 
                            style={{ color: '#424242' }}
                          >
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chart e botão - metade direita */}
                    <div className="w-1/2 flex flex-col items-center">
                      <div className="flex-1 flex items-center justify-center">
                        <EnhancedChartComponent 
                          categories={chartCategories.notIncome.chartConfig} 
                          size={200}
                        />
                      </div>
                      <Link 
                        to={{ pathname: '/relatorios', search: `?type=outcomes&date=${rows.length > 0 ? rows[0].date.substring(0, 7) : ''}` }}
                        className="text-xs px-3 py-2 rounded border transition-all mt-2"
                        style={{
                          borderColor: '#009688',
                          color: '#009688'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#009688'
                          e.currentTarget.style.color = 'white'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = '#009688'
                        }}
                      >
                        Ver relatório completo
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div 
              className="bg-white rounded-xl p-6 mt-8"
              style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 
                  className="text-lg font-medium mb-4 sm:mb-0" 
                  style={{ color: '#424242' }}
                >
                  Transações Recentes
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="relative">
                    <Search 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      size={16} 
                      style={{ color: '#616161' }} 
                    />
                    <input
                      type="text"
                      placeholder="Buscar transação..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                      style={{
                        borderColor: '#E0E0E0',
                        focusRingColor: '#009688',
                        width: '250px'
                      }}
                    />
                  </div>
                  <Filter 
                    currentFilter={filter}
                    currentType={typeFilter}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
              
              <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                <TableTransactions
                  recentTransactions={recentTransactions}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                  handleUpdateTransaction={handleUpdateTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                  handleDeleteMultipleTransactions={handleDeleteMultipleTransactions}
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  categories={categories}
                  from="dashboard"
                  searchTerm={searchTerm}
                />
              </div>
              
              <div className="flex justify-center mt-6">
                <Link
                  to={{ pathname: '/transacoes' }}
                  className="flex items-center px-6 py-2 rounded-lg border transition-all text-sm font-medium"
                  style={{
                    borderColor: '#009688',
                    color: '#009688'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#009688'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#009688'
                  }}
                >
                  Ver todas as transações
                  <ChevronRight size={16} className="ml-2" />
                </Link>
              </div>
            </div>

          </main>
        </div>
      </div>

      <FloatingButton setOpenModal={setOpenModal} />
    </div>
  )
}
