import Header from "../components/Header.tsx";
import MenuAside from "../components/MenuAside.tsx";
import Skeleton from "react-loading-skeleton";
import { BarChart3, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import TablePreview from "../components/TablePreview";
import { useState } from "react";
import { ITransaction } from "../types/transactions.ts";
import useCategories from "../hooks/useCategories.ts";
import useTransactions from "../hooks/useTransactions.ts";
import useDashboard from "../hooks/useDashboard.ts";

const Transactions = () => {
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    transaction: {} as ITransaction,
    type: "",
  });
  const [resetScroll, setResetScroll] = useState(false);

  const { handleGetChartCategories, categories } = useCategories();

  const {
    rows,
    handleCreateTransaction,
    handleCreateCompleteTransaction,
    handleDeleteTransaction,
    handleUpdateTransaction,
    handleGetOverviewTransactions,
    handleGetBalance,
    handleGetTransactionsMonth,
    handleGetRecentTransactions,
  } = useTransactions(handleGetChartCategories);
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
    handleGetRecentTransactions,
  );

  const handleNextWeek = async (isBeforeWeek: boolean) => {
    setResetScroll(true);
    await getNextWeek(isBeforeWeek);
    // Reset the flag after a short delay to allow the scroll to complete
    setTimeout(() => setResetScroll(false), 100);
  };

  const handleToday = async () => {
    setResetScroll(true);
    await getToday();
    // Reset the flag after a short delay to allow the scroll to complete
    setTimeout(() => setResetScroll(false), 100);
  };

  return (
    <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
      <Header title="Transações" activePage="transacoes" />

      <div className="flex min-h-screen pt-24">
        <MenuAside activePage="transacoes" />

        <main className="flex-1 mt-4 pl-0 xl-lg:pl-64 max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-zinc-700 dark:text-zinc-200 mb-2 leading-tight">
              Transações Financeiras
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base">
              Acompanhe suas transações mensais
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors">
            {/* <div className="flex items-center justify-between mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                      <BarChart3 size={20} className="text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-700 dark:text-zinc-100">Transações Financeiras</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Acompanhe suas transações mensais</p>
                    </div>
                  </div>
                </div> */}

            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center mb-4">
              <h2 className="text-base mb-2 font-medium text-gray dark:text-softGray">
                {getMonth ? (
                  `${getMonth()}`
                ) : (
                  <Skeleton height={20} width={100} />
                )}
              </h2>
              <div className="flex flex-1 items-center justify-center">
                <button
                  className="text-base font-medium text-gray dark:text-softGray active:opacity-50 rounded-2xl hover:bg-zinc-100 p-2"
                  onClick={() => handleNextWeek(true)}
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
                  className="text-sm font-medium text-gray dark:text-softGray active:opacity-50 rounded-2xl hover:bg-zinc-100 p-2"
                  onClick={() => handleNextWeek(false)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="hidden sm:block">
                <button
                  disabled={hasToday()}
                  className="bg-teal-600 px-4 py-1 text-white rounded-lg disabled:opacity-30 dark:disabled:bg-auto flex justify-center items-center active:opacity-50"
                  onClick={handleToday}
                >
                  <Calendar size={16} className="mr-2" />
                  Hoje
                </button>
              </div>
            </div>

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
              from="transacoes"
              resetScroll={resetScroll}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Transactions;
