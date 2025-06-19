import {
  ChartColumnDecreasing,
  MoveDownLeft,
  MoveUpRight,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import TablePreview from '../../components/TablePreview'
import ChartComponent from '../../components/ChartComponent.tsx'
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
  } = useTransactions(handleGetChartCategories)
  const {
    getMonth,
    getGreeting,
    getNextWeek,
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
  const [typeFilter, setTypeFilter] = useState<'income' | 'outcome' | 'daily' | 'all'>('all');

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    handleGetRecentTransactions(filter, field, order, typeFilter);
  };

  useEffect(() => {
    handleGetRecentTransactions('both', 'updated_at', 'desc', 'all');
  }, []);

  const handleFilterChange = (newFilter: 'before' | 'after' | 'both', newType: 'income' | 'outcome' | 'daily' | 'all') => {
    setFilter(newFilter);
    setTypeFilter(newType);
    handleGetRecentTransactions(newFilter, sortBy, sortOrder || 'desc', newType);
  };

  return (
    <div>
      <div className="w-full h-full bg-background dark:bg-orangeDark">
        <Header title="Dashboard" activePage="dashboard" />

        <div className="flex h-full">
          <MenuAside activePage="dashboard" />

          <main className="flex w-full h-full justify-center items-center mt-24 pl-0 xl-lg:pl-[210px]">
            <div className="w-full px-2 md:px-10 pt-6 pb-2">
              <div className="flex justify-center">
                <div className="w-full mx-2 md:mx-0 bg-white dark:bg-black-bg h-20 rounded-2xl flex justify-between px-4 sm:px-10">
                  <div className="flex items-center">
                    <h1 className="text-lg font-semibold text-gray dark:text-softGray">
                      <span>{getGreeting()}</span>
                    </h1>
                  </div>
                  <div className="flex items-center">
                    <div className="border-l-2 border-primary h-12 px-2 flex flex-col justify-center">
                      <span className="text-xs md:text-sm text-gray dark:text-grayWhite">
                        Saldo hoje
                      </span>
                      <div>
                        <strong className="text-lg dark:text-softGray">
                          <CountUp valueNumber={balance} />
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center mt-6 average-spending-area px-2 sm:px-0">
                <div className="w-full h-full bg-white dark:bg-black-bg rounded-xl p-6 mr-6 average-info">
                  <div className="flex justify-center">
                    <div className="bg-green-600 w-12 h-12 flex justify-center items-center rounded-xl">
                      <MoveDownLeft size={24} className="text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xs text-gray dark:text-softGray">
                        Total de entradas
                      </h3>
                      <span className="text-lg font-semibold text-green-600 mt-4">
                        <CountUp valueNumber={overview?.income?.total} />
                      </span>
                    </div>
                    <div className="ml-8 flex items-end">
                      <span className="flex justify-center items-center bg-green-200 text-green-600 dark:text-green-400 dark:bg-green-700 rounded-full w-16 h-6 text-xs px-4 py-2">
                        <CountUp
                          valueNumber={overview?.income?.percentage}
                          isPercentage={true}
                        />
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-full bg-white dark:bg-black-bg rounded-xl p-6 mr-6 average-info">
                  <div className="flex justify-center">
                    <div className="bg-red-600 w-12 h-12 flex justify-center items-center rounded-xl">
                      <MoveUpRight size={24} className="text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xs text-gray dark:text-softGray">
                        Total de saídas
                      </h3>
                      <span className="text-lg font-semibold text-red-600 mt-4">
                        <CountUp valueNumber={overview?.outcome?.total} />
                      </span>
                    </div>
                    <div className="ml-8 flex items-end">
                      <span className="flex justify-center items-center bg-red-200 text-red-600 dark:text-red-400 dark:bg-red-700 da rounded-full w-16 h-6 text-xs px-4 py-2">
                        <CountUp
                          valueNumber={overview?.outcome?.percentage}
                          isPercentage={true}
                        />
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-full bg-white dark:bg-black-bg rounded-xl p-6 average-info">
                  <div className="flex justify-center">
                    <div className="bg-purple-600 w-12 h-12 flex justify-center items-center rounded-xl">
                      <ChartColumnDecreasing size={24} className="text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xs text-gray dark:text-softGray">
                        Gastos p/dia
                      </h3>
                      <span className="text-lg font-semibold text-purple-600 mt-4">
                        <CountUp valueNumber={overview?.daily?.total} />
                      </span>
                    </div>
                    <div className="ml-8 flex items-end ">
                      <span className="flex justify-center items-center bg-purple-200 text-purple-600 dark:text-purple-400 dark:bg-purple-700 rounded-full w-16 h-6 text-xs px-4 py-2">
                        <CountUp
                          valueNumber={overview?.daily?.percentage}
                          isPercentage={true}
                        />
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                <div className="h-[600px] flex flex-col bg-white dark:bg-black-bg rounded-xl px-6 py-6 sm:p-6  lg:col-span-2 lg:row-span-2">
                  <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-4">
                    <h2 className="text-base mb-2 sm:mb-0 font-medium text-gray dark:text-softGray">
                      {getMonth ? (
                        `${getMonth()}`
                      ) : (
                        <Skeleton height={20} width={100} />
                      )}
                    </h2>
                    <div className="flex flex-1 items-center justify-center">
                      <button
                        className="text-base font-semibold text-gray dark:text-softGray active:opacity-50 rounded-2xl hover:bg-zinc-100 p-2"
                        onClick={() => getNextWeek(true)}
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-base font-medium text-gray dark:text-softGray mx-2">
                        {rows.length > 0 ? (
                          `${rows[0].formatted_date} à ${rows[rows.length - 1].formatted_date}`
                        ) : (
                          <Skeleton height={20} width={100} />
                        )}
                      </span>
                      <button
                        className="text-sm font-semibold text-gray dark:text-softGray active:opacity-50 rounded-2xl hover:bg-zinc-100 p-2"
                        onClick={() => getNextWeek(false)}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                    <div className="hidden sm:block">
                      <button
                        disabled={hasToday()}
                        className="bg-primary px-4 py-1 text-white rounded-lg disabled:bg-orange-300 dark:disabled:bg-auto flex justify-center items-center active:opacity-50"
                        onClick={() => getToday()}
                      >
                        <Calendar size={16} className="mr-2" />
                        Hoje
                      </button>
                    </div>
                  </div>

                  <TablePreview
                    rows={rows}
                    handleCreateTransaction={handleCreateTransaction}
                    handleCreateCompleteTransaction={
                      handleCreateCompleteTransaction
                    }
                    handleDeleteTransaction={handleDeleteTransaction}
                    handleUpdateTransaction={handleUpdateTransaction}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    categories={categories}
                    from="dashboard"
                  />
                  <div className="w-full flex justify-end items-center mt-6">
                    <Link
                      to={{ pathname: '/transacoes' }}
                      className="text-sm text-gray flex justify-center items-center hover:opacity-40"
                    >
                      Ver transações por mês
                      <ChevronRight size={16} className="text-gray" />
                    </Link>
                  </div>
                </div>

                <div className="h-[600px]">
                  <div className="h-[288px] w-full bg-white dark:bg-black-bg rounded-xl p-6">
                    {chartCategories.income.config.length === 0 ? (
                      <div className="h-full w-full">
                        <h3 className="font-base font-medium">
                          Maiores entradas do mês atual
                        </h3>
                        <div className="h-full flex justify-center items-center">
                          <h3 className="flex justify-center items-center text-[#A0A0A0] h-full dark:text-softGray">
                            Sem valores registrados
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-full h-full">
                        <div className="h-full w-[70%] pr-8">
                          <h3 className="font-base font-medium">
                            Maiores entradas do mês atual
                          </h3>
                          <ul className="h-full flex flex-col justify-center">
                            {chartCategories.income.config.map((item) => {
                              return (
                                <li
                                  key={item.id}
                                  className="flex py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 justify-center items-center border-b-[1px] border-b-zinc-100"
                                >
                                  <div className="flex h-full">
                                    <CategoryIcon
                                      size="large"
                                      category={item}
                                    />
                                  </div>
                                  <div className="flex flex-1">
                                    <p className="px-4 max-w-32 text-sm">
                                      {item.name}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm">
                                      {item.percentage}%
                                    </span>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                        <div className="flex flex-col w-[30%] pt-6">
                          <div>
                            <ChartComponent
                              categories={chartCategories.income.chartConfig}
                            />
                          </div>
                          <div className="flex justify-center items-center">
                            <button className="border border-zinc-300 px-4 py-1 rounded text-[#A0A0A0] text-sm hover:bg-primary hover:text-white transition-all duration-200 hover:border-primary">
                              Ver relatório
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="h-[288px] w-full bg-white dark:bg-black-bg rounded-xl p-6 mt-6">
                    {chartCategories.notIncome.config.length === 0 ? (
                      <div className="h-full w-full">
                        <h3 className="font-base font-medium">
                          Maiores saídas do mês atual
                        </h3>
                        <div className="h-full flex justify-center items-center">
                          <h3 className="flex justify-center items-center text-[#A0A0A0] h-full dark:text-softGray">
                            Sem valores registrados
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center w-full h-full">
                        <div className="h-full w-[70%] pr-8">
                          <h3 className="font-base font-medium">
                            Maiores saídas do mês atual
                          </h3>
                          <ul className="h-full flex flex-col justify-center">
                            {chartCategories.notIncome.config.map((item) => {
                              return (
                                <li
                                  key={item.id}
                                  className="flex py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 justify-center items-center border-b-[1px] border-b-zinc-100"
                                >
                                  <div className="flex h-full">
                                    <CategoryIcon
                                      size="large"
                                      category={item}
                                    />
                                  </div>
                                  <div className="flex flex-1">
                                    <p className="px-4 max-w-32 text-sm">
                                      {item.name}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-sm">
                                      {item.percentage}%
                                    </span>
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                        <div className="flex flex-col w-[30%] pt-6">
                          <div>
                            <ChartComponent
                              categories={chartCategories.notIncome.chartConfig}
                            />
                          </div>
                          <div className="flex justify-center items-center">
                            <button className="border border-zinc-300 px-4 py-1 rounded text-[#A0A0A0] text-sm hover:bg-primary hover:text-white transition-all duration-200 hover:border-primary">
                              Ver relatório
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="max-h-[600px] flex flex-col bg-white dark:bg-black-bg rounded-xl sm:p-6 lg:col-span-2 lg:row-span-2">
                <div className="flex justify-between items-center px-2 mb-4">
                  <h3 className="font-base font-medium">
                    Transações cadastradas
                  </h3>

                  <Filter 
                    currentFilter={filter}
                    currentType={typeFilter}
                    onFilterChange={handleFilterChange}
                  />
                </div>

                <TableTransactions
                  recentTransactions={recentTransactions}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      <FloatingButton setOpenModal={setOpenModal} />
    </div>
  )
}
