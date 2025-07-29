import Header from "../components/Header.tsx";
import MenuAside from "../components/MenuAside.tsx";
import Skeleton from "react-loading-skeleton";
import { BarChart3, Calendar, ChevronLeft, ChevronRight, List, Grid3X3 } from "lucide-react";
import TablePreview from "../components/TablePreview";
import TransactionsListView from "../components/TransactionsListView";
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
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');

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
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    getNextWeek,
    isLoading,
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
    // Only trigger scroll reset in table view
    if (viewMode === 'table') {
      setResetScroll(true);
    }
    
    await getToday();
    
    // Reset the flag after a short delay to allow the scroll to complete (only in table view)
    if (viewMode === 'table') {
      setTimeout(() => setResetScroll(false), 100);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
      <Header title="Transações" activePage="transacoes" />

      <div className="flex min-h-screen pt-4">
        <MenuAside activePage="transacoes" />

        <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-zinc-700 dark:text-zinc-200 mb-2 leading-tight">
              Transações Financeiras
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-base">
              Acompanhe suas transações mensais
            </p>
          </div>
          {/* Controls Header */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              {/* Month/Year Selectors */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Período:
                  </label>
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(Number(e.target.value))}
                    disabled={isLoading}
                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      const monthName = new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' });
                      return (
                        <option key={month} value={month}>
                          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                        </option>
                      );
                    })}
                  </select>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    disabled={isLoading}
                    className="px-3 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-50"
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Right side controls */}
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'table'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                    }`}
                    title="Visualização em tabela"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                    }`}
                    title="Visualização em lista"
                  >
                    <List size={16} />
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
            </div>
          </div>

          {/* Content Views */}
          {viewMode === 'table' ? (
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors">
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
          ) : (
            <TransactionsListView
              rows={rows}
              setOpenModal={setOpenModal}
              categories={categories}
              handleCreateTransaction={handleCreateTransaction}
              handleUpdateTransaction={handleUpdateTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Transactions;
