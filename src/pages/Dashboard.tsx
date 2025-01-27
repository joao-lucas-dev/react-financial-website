import {
  ChartColumnDecreasing,
  Eye,
  MoveDownLeft,
  MoveUpRight,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from 'lucide-react'

import TablePreview from '../components/TablePreview'
import ChartComponent from '../components/ChartComponent'

import './styles.css'
import Header from '../components/Header'
import MenuAside from '../components/MenuAside'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import useDashboard from '../hooks/useDashboard.ts'
import useTransactions from '../hooks/useTransactions.ts'
import CountUp from '../components/CountUp.tsx'
import useCategories from '../hooks/useCategories.ts'

export default function Dashboard() {
  const { chartCategories, handleGetChartCategories } = useCategories()
  const {
    rows,
    handleGetPreviewTransactions,
    handleCreateTransaction,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleGetOverviewTransactions,
    overview,
  } = useTransactions(handleGetChartCategories)
  const { getMonth, getGreeting, getNextWeek, getToday, hasToday } =
    useDashboard(
      rows,
      handleGetPreviewTransactions,
      handleGetChartCategories,
      handleGetOverviewTransactions,
    )

  return (
    <div className="w-full h-full">
      <Header />

      <div className="flex h-screen">
        <MenuAside />

        <main className="flex w-full h-full pt-24 overflow-auto">
          <div className="w-full px-2 md:px-10 py-6">
            <div className="flex justify-center">
              <div className="w-full mx-2 md:mx-0 bg-white h-20 rounded-2xl flex justify-between px-4 sm:px-10">
                <div className="flex items-center">
                  <h1 className="text-base md:text-lg lg:text-xl font-semibold text-gray">
                    <span>{getGreeting()}, João</span>
                  </h1>
                </div>
                <div className="flex items-center">
                  <div className="border-l-2 border-primary h-12 px-2 flex flex-col justify-center">
                    <span className="text-xs md:text-sm text-gray">
                      Saldo geral
                    </span>
                    <div>
                      <span className="text-xs md:text-sm text-gray mr-1">
                        R$
                      </span>
                      <strong className="text-lg md:text-xl">15.473,90</strong>
                    </div>
                  </div>
                  <div className="h-12 flex items-end">
                    <div className="hidden md:block">
                      <Eye color="#393938" size={22} />
                    </div>
                    <div className="flex md:hidden h-full items-end pb-2">
                      <Eye color="#393938" size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center mt-6 average-spending-area px-2 sm:px-0">
              <div className="w-full h-full bg-white rounded-xl p-6 mr-6 average-info">
                <div className="flex justify-center">
                  <div className="bg-green-600 w-12 h-12 flex justify-center items-center rounded-xl">
                    <MoveDownLeft size={24} className="text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xs text-gray">Total de entradas</h3>
                    <span className="text-xl font-semibold text-green-600 mt-4">
                      <CountUp valueNumber={overview?.income?.total} />
                    </span>
                  </div>
                  <div className="ml-8 flex items-end">
                    <span className="flex justify-center items-center bg-green-200 text-green-600 rounded-full w-16 h-6 text-xs px-4 py-2">
                      {overview?.income?.percentage >= 0
                        ? `+${overview?.income?.percentage}`
                        : overview?.income?.percentage}
                      %
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-full bg-white rounded-xl p-6 mr-6 average-info">
                <div className="flex justify-center">
                  <div className="bg-red-600 w-12 h-12 flex justify-center items-center rounded-xl">
                    <MoveUpRight size={24} className="text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xs text-gray">Total de saídas</h3>
                    <span className="text-xl font-semibold text-red-600 mt-4">
                      <CountUp valueNumber={overview?.outcome?.total} />
                    </span>
                  </div>
                  <div className="ml-8 flex items-end">
                    <span className="flex justify-center items-center bg-red-200 text-red-600 rounded-full w-16 h-6 text-xs px-4 py-2">
                      {overview?.outcome?.percentage >= 0
                        ? `+${overview?.outcome?.percentage}`
                        : overview?.outcome?.percentage}
                      %
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-full bg-white rounded-xl p-6 average-info">
                <div className="flex justify-center">
                  <div className="bg-purple-600 w-12 h-12 flex justify-center items-center rounded-xl">
                    <ChartColumnDecreasing size={24} className="text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xs text-gray">Média Diária</h3>
                    <span className="text-xl font-semibold text-purple-600 mt-4">
                      <CountUp valueNumber={overview?.daily?.total} />
                    </span>
                  </div>
                  <div className="ml-8 flex items-end ">
                    <span className="flex justify-center items-center bg-purple-200 text-purple-600 rounded-full w-16 h-6 text-xs px-4 py-2">
                      {overview?.daily?.percentage >= 0
                        ? `+${overview?.daily?.percentage}`
                        : overview?.daily?.percentage}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 pb-24">
              <div className="flex flex-col bg-white rounded-xl px-6 py-6 sm:p-6  lg:col-span-2 lg:row-span-2">
                <div className="flex flex-none justify-between items-center mb-4">
                  <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray w-24">
                    {getMonth ? (
                      `${getMonth()}`
                    ) : (
                      <Skeleton height={20} width={100} />
                    )}
                  </h2>
                  <div className="flex flex-1 items-center justify-center pr-20">
                    <button
                      className="text-xl md:text-md lg:text-lg font-semibold text-gray"
                      onClick={() => getNextWeek(true)}
                    >
                      <ChevronLeft />
                    </button>
                    <span className="text-xl md:text-md lg:text-lg font-semibold text-gray mx-2">
                      {rows.length > 0 ? (
                        `${rows[0].formatted_date} a ${rows[rows.length - 1].formatted_date}`
                      ) : (
                        <Skeleton height={20} width={100} />
                      )}
                    </span>
                    <button
                      className="text-sm md:text-md lg:text-lg font-semibold text-gray"
                      onClick={() => getNextWeek(false)}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                  <div>
                    <button
                      disabled={hasToday()}
                      className="bg-primary px-4 py-1 text-white rounded-lg disabled:bg-orange-300 flex justify-center items-center"
                      onClick={() => getToday()}
                    >
                      <Calendar size={16} className="mr-2" />
                      Hoje
                    </button>
                  </div>
                </div>

                <div className="table-preview-area flex flex-auto py-6 relative">
                  <TablePreview
                    rows={rows}
                    handleCreateTransaction={handleCreateTransaction}
                    handleDeleteTransaction={handleDeleteTransaction}
                    handleUpdateTransaction={handleUpdateTransaction}
                  />
                </div>

                <div className="flex flex-none justify-end items-end text-right mt-4">
                  <a
                    href="/lancamentos"
                    className="text-sm text-gray font-semibold"
                  >
                    Todos lançamentos &gt;
                  </a>
                </div>
              </div>

              <div className="w-full h-full bg-white rounded-xl px-3 py-6 sm:p-6">
                <h1 className="text-lg font-bold text-gray">Contas a pagar</h1>
                <div className="mt-4">
                  <div className="flex justify-between items-center border-b-1 border-softGray py-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-softGray">
                        <StickyNote size={12} className="text-white" />
                      </div>
                      <span className="ml-2 text-sm text-gray font-semibold">
                        Fatura do Bradesco
                      </span>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      R$ 2.100,90
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b-1 border-softGray py-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-softGray">
                        <StickyNote size={12} className="text-white" />
                      </div>
                      <span className="ml-2 text-sm text-gray font-semibold">
                        Fatura do Bradesco
                      </span>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      R$ 2.100,90
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-softGray">
                        <StickyNote size={12} className="text-white" />
                      </div>
                      <span className="ml-2 text-sm text-gray font-semibold">
                        Fatura do Bradesco
                      </span>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      R$ 2.100,90
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-96 bg-white rounded-xl px-3 py-6 sm:p-6">
                <h1 className="text-lg font-bold text-gray">Categorias</h1>
                <ChartComponent categories={chartCategories} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
