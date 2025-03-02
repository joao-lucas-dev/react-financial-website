import Header from '../components/Header.tsx'
import MenuAside from '../components/MenuAside.tsx'
import Skeleton from 'react-loading-skeleton'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import TablePreview from '../components/TablePreview'
import { useState } from 'react'
import { ITransaction } from '../types/transactions.ts'
import useCategories from '../hooks/useCategories.ts'
import useTransactions from '../hooks/useTransactions.ts'
import useDashboard from '../hooks/useDashboard.ts'

const Transactions = () => {
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    transaction: {} as ITransaction,
    type: '',
  })

  const { handleGetChartCategories, categories } = useCategories()

  const {
    rows,
    handleCreateTransaction,
    handleCreateCompleteTransaction,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleGetOverviewTransactions,
    handleGetBalance,
    handleGetTransactionsMonth,
  } = useTransactions(handleGetChartCategories)
  const {
    getMonth,
    getToday,
    hasToday,
    currentMonth,
    setCurrentMonth,
    getNextWeek,
  } = useDashboard(
    rows,
    handleGetChartCategories,
    handleGetOverviewTransactions,
    handleGetBalance,
    handleGetTransactionsMonth,
  )

  return (
    <div className="w-full h-full bg-background dark:bg-orangeDark">
      <Header title="Transações" />

      <div className="flex h-dvh">
        <MenuAside activePage="transacoes" />

        <main className="flex justify-center items-center w-full h-full pt-28 pb-4">
          <div className="flex w-full h-full pl-10 pr-10">
            <div className="w-full h-full flex flex-col bg-white dark:bg-black-bg rounded-xl px-6 py-6 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-4">
                <h2 className="text-[18px] mb-2 sm:mb-0 md:text-lg lg:text-xl font-semibold text-gray dark:text-softGray">
                  {getMonth ? (
                    `${getMonth()}`
                  ) : (
                    <Skeleton height={20} width={100} />
                  )}
                </h2>
                <div className="flex flex-1 items-center justify-center">
                  <button
                    className="text-base md:text-md lg:text-lg font-semibold text-gray dark:text-softGray active:opacity-50"
                    onClick={() => getNextWeek(true)}
                  >
                    <ChevronLeft />
                  </button>
                  <span className="text-base md:text-md lg:text-lg font-semibold text-gray dark:text-softGray mx-2">
                    {rows.length > 0 ? (
                      `${rows[0].formatted_date} a ${rows[rows.length - 1].formatted_date}`
                    ) : (
                      <Skeleton height={20} width={100} />
                    )}
                  </span>
                  <button
                    className="text-sm md:text-md lg:text-lg font-semibold text-gray dark:text-softGray active:opacity-50"
                    onClick={() => getNextWeek(false)}
                  >
                    <ChevronRight />
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
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Transactions
