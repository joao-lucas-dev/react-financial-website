import {
  ChartColumnDecreasing,
  MoveDownLeft,
  MoveUpRight,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from 'lucide-react'

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
import { useState } from 'react'
import { ITransaction } from '../../types/transactions.ts'

export default function Dashboard() {
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    transaction: {} as ITransaction,
    type: '',
  })

  const { chartCategories, handleGetChartCategories } = useCategories()
  const {
    rows,
    handleGetPreviewTransactions,
    handleCreateTransaction,
    handleCreateCompleteTransaction,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleGetOverviewTransactions,
    overview,
    handleGetBalance,
    balance,
    handleGetTransactionsMonth,
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
    handleGetPreviewTransactions,
    handleGetChartCategories,
    handleGetOverviewTransactions,
    handleGetBalance,
    handleGetTransactionsMonth,
  )

  return (
    <div className="dark">
      <div className="w-full h-full bg-background dark:bg-orangeDark">
        <Header title="Dashboard" />

        <div className="flex h-screen">
          <MenuAside />

          <main className="flex w-full h-full pt-24 overflow-auto">
            <div className="w-full px-2 md:px-10 py-6">
              <div className="flex justify-center">
                <div className="w-full mx-2 md:mx-0 bg-white dark:bg-black-bg h-20 rounded-2xl flex justify-between px-4 sm:px-10">
                  <div className="flex items-center">
                    <h1 className="text-base md:text-lg lg:text-xl font-semibold text-gray dark:text-softGray">
                      <span>{getGreeting()}, João</span>
                    </h1>
                  </div>
                  <div className="flex items-center">
                    <div className="border-l-2 border-primary h-12 px-2 flex flex-col justify-center">
                      <span className="text-xs md:text-sm text-gray dark:text-grayWhite">
                        Saldo geral
                      </span>
                      <div>
                        <strong className="text-lg md:text-xl dark:text-softGray">
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
                      <span className="text-xl font-semibold text-green-600 mt-4">
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
                      <span className="text-xl font-semibold text-red-600 mt-4">
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
                        Média Diária
                      </h3>
                      <span className="text-xl font-semibold text-purple-600 mt-4">
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

              <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 pb-2">
                <div className="h-[600px] flex flex-col bg-white dark:bg-black-bg rounded-xl px-6 py-6 sm:p-6  lg:col-span-2 lg:row-span-2">
                  <div className="flex flex-none justify-between items-center mb-4">
                    <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray dark:text-softGray w-24">
                      {getMonth ? (
                        `${getMonth()}`
                      ) : (
                        <Skeleton height={20} width={100} />
                      )}
                    </h2>
                    <div className="flex flex-1 items-center justify-center pr-20">
                      <button
                        className="text-xl md:text-md lg:text-lg font-semibold text-gray dark:text-softGray"
                        onClick={() => getNextWeek(true)}
                      >
                        <ChevronLeft />
                      </button>
                      <span className="text-xl md:text-md lg:text-lg font-semibold text-gray dark:text-softGray mx-2">
                        {rows.length > 0 ? (
                          `${rows[0].formatted_date} a ${rows[rows.length - 1].formatted_date}`
                        ) : (
                          <Skeleton height={20} width={100} />
                        )}
                      </span>
                      <button
                        className="text-sm md:text-md lg:text-lg font-semibold text-gray dark:text-softGray"
                        onClick={() => getNextWeek(false)}
                      >
                        <ChevronRight />
                      </button>
                    </div>
                    <div>
                      <button
                        disabled={hasToday()}
                        className="bg-primary px-4 py-1 text-white rounded-lg disabled:bg-orange-300 dark:disabled:bg-auto flex justify-center items-center"
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
                  />
                </div>

                <div>
                  <div className="h-72 w-full bg-white dark:bg-black-bg rounded-xl px-3 py-6 sm:p-6">
                    <h1 className="text-lg font-bold text-gray dark:text-softGray">
                      Entradas
                    </h1>
                    <ChartComponent categories={chartCategories.income} />
                  </div>

                  <div className="h-72 w-full bg-white dark:bg-black-bg rounded-xl px-3 py-6 sm:p-6 mt-6">
                    <h1 className="text-lg font-bold text-gray dark:text-softGray">
                      Saídas
                    </h1>
                    <ChartComponent categories={chartCategories.notIncome} />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <FloatingButton setOpenModal={setOpenModal} />
    </div>
  )
}
