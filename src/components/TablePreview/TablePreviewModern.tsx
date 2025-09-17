import {
  ArrowRight,
  BarChart3,
  Calendar,
  Eye,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";

// Hooks and Stores
import { useTablePreviewStore } from "../../stores/tablePreviewStore";
import { useDashboardStore } from "../../stores/dashboardStore";
import { 
  useTransactionsPreview,
  useCreateCompleteTransaction,
  useCreateInstallmentTransaction,
  useCreateRecurringTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useUpdateRecurringTransaction,
  useDeleteRecurringTransaction,
  useUpdateInstallmentTransaction,
  useDeleteInstallmentTransaction
} from "../../queries/transactionsQueries";
import { useCategories } from "../../queries/categoriesQueries";
import { useCreditCards } from "../../queries/creditCardsQueries";

// Components
import CardSkeleton from "../CardSkeleton";
import DayDetailsModal from "../DayDetailsModal";
import ModalCreate from "../ModalCreate";
import ModalDelete from "../ModalDelete";
import ModalEdit from "../ModalEdit";
import QuickAddModal from "../QuickAddModal";
import VerticalCardSkeleton from "../VerticalCardSkeleton";

// Types
import { ITransaction, ISetCurrentMonth, IRow } from "../../types/transactions";

// Styles
import "./styles.css";

interface TablePreviewModernProps {
  from?: string;
  maxDays?: number;
  showViewAllButton?: boolean;
  variant?: "horizontal" | "vertical";
  date?: DateTime;
  startDate?: DateTime;
  endDate?: DateTime;
}

const TablePreviewModern = ({
  from = "dashboard",
  maxDays = undefined,
  showViewAllButton = false,
  variant = "horizontal",
  date = DateTime.now(),
  startDate,
  endDate,
}: TablePreviewModernProps) => {
  const targetRowRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Zustand stores
  const {
    dayDetailsModal,
    setDayDetailsModal,
    quickAddModal,
    setQuickAddModal,
    currentMonth,
    setCurrentMonth,
    resetScroll,
    setResetScroll,
  } = useTablePreviewStore();

  const { openModal, setOpenModal } = useDashboardStore();

  // React Query hooks
  const { data: rows = [], isLoading: rowsLoading } = useTransactionsPreview(date, startDate, endDate);
  const { data: categories = [], refetch: retryCategories } = useCategories();
  const { data: creditCards = [] } = useCreditCards();

  // Mutations

  const createCompleteTransactionMutation = useCreateCompleteTransaction();
  const createInstallmentTransactionMutation = useCreateInstallmentTransaction();
  const createRecurringTransactionMutation = useCreateRecurringTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const updateRecurringTransactionMutation = useUpdateRecurringTransaction();
  const deleteRecurringTransactionMutation = useDeleteRecurringTransaction();
  const updateInstallmentTransactionMutation = useUpdateInstallmentTransaction();
  const deleteInstallmentTransactionMutation = useDeleteInstallmentTransaction();

  // Effects
  useEffect(() => {
    if (targetRowRef.current && tableContainerRef.current) {
      const rowTop = targetRowRef.current.offsetTop;
      const containerHeight = tableContainerRef.current.clientHeight;
      const rowHeight = targetRowRef.current.clientHeight;

      tableContainerRef.current.scrollTo({
        top: rowTop - containerHeight / 2 + rowHeight / 2,
        behavior: "smooth",
      });
    }
  }, [rows]);

  useEffect(() => {
    if (resetScroll && tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setResetScroll(false);
    }
  }, [resetScroll, setResetScroll]);

  // Memoized data
  const limitedRows = useMemo(() => {
    return maxDays ? rows.slice(0, maxDays) : rows;
  }, [rows, maxDays]);

  // Wrapper for setCurrentMonth compatibility
  const setCurrentMonthWrapper: ISetCurrentMonth = (value: any) => {
    if (typeof value === 'function') {
      setCurrentMonth(value(currentMonth));
    } else {
      setCurrentMonth(value);
    }
  };



  const handleCreateCompleteTransaction = async (transaction: ITransaction) => {
    try {
      await createCompleteTransactionMutation.mutateAsync(transaction);
    } catch (err) {
      console.error('Error creating complete transaction:', err);
    }
  };

  const handleCreateInstallmentTransaction = async (transaction: ITransaction) => {
    try {
      await createInstallmentTransactionMutation.mutateAsync(transaction);
    } catch (err) {
      console.error('Error creating installment transaction:', err);
    }
  };

  const handleCreateRecurringTransaction = async (transaction: ITransaction) => {
    try {
      await createRecurringTransactionMutation.mutateAsync(transaction);
    } catch (err) {
      console.error('Error creating recurring transaction:', err);
    }
  };

  const handleUpdateTransaction = async (transaction: ITransaction) => {
    try {
      await updateTransactionMutation.mutateAsync(transaction);
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  const handleDeleteTransaction = async (id?: string) => {
    if (!id) return;
    try {
      await deleteTransactionMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleUpdateRecurringTransaction = async (
    transaction: ITransaction,
    editMode: 'instance_only' | 'instance_and_future' | 'all_instances' = 'instance_only'
  ) => {
    try {
      await updateRecurringTransactionMutation.mutateAsync({ transaction, editMode });
    } catch (err) {
      console.error('Error updating recurring transaction:', err);
    }
  };

  const handleDeleteRecurringTransaction = async (
    id: string,
    editMode: 'instance_only' | 'instance_and_future' | 'all_instances' = 'instance_only'
  ) => {
    try {
      await deleteRecurringTransactionMutation.mutateAsync({ id, editMode });
    } catch (err) {
      console.error('Error deleting recurring transaction:', err);
    }
  };

  const handleUpdateInstallmentTransaction = async (
    transaction: ITransaction,
    editMode: 'installment_only' | 'installment_and_future' | 'all_installments' = 'installment_only'
  ) => {
    try {
      await updateInstallmentTransactionMutation.mutateAsync({ transaction, editMode });
    } catch (err) {
      console.error('Error updating installment transaction:', err);
    }
  };

  const handleDeleteInstallmentTransaction = async (
    id: string,
    editMode: 'installment_only' | 'installment_and_future' | 'all_installments' = 'installment_only'
  ) => {
    try {
      await deleteInstallmentTransactionMutation.mutateAsync({ id, editMode });
    } catch (err) {
      console.error('Error deleting installment transaction:', err);
    }
  };

  // Render memoized transactions
  const memoizedTransactions = useMemo(() => {
    if (rowsLoading) {
      return variant === "vertical" ? (
        <VerticalCardSkeleton count={maxDays || 3} />
      ) : (
        <CardSkeleton count={maxDays || 3} />
      );
    }

    return limitedRows.map((row: IRow) => {
      const today = new Date();
      today.setHours(0, 0, 0);
      const transactionDate = new Date(`${row.date}T00:00:00`);

      if (transactionDate.toDateString() === today.toDateString()) {
        row.isToday = true;
      }

      // Determine balance color and icon
      const totalValue = parseFloat(String(row.total.value || "0"));
      const isPositive = totalValue > 0;
      const isNegative = totalValue < 0;

      const balanceColor = isPositive
        ? "text-green-600 dark:text-green-400"
        : isNegative
          ? "text-red-600 dark:text-red-400"
          : "text-zinc-600 dark:text-zinc-400";

      const balanceIcon = isPositive ? (
        <TrendingUp size={16} className="inline mr-1" />
      ) : isNegative ? (
        <TrendingDown size={16} className="inline mr-1" />
      ) : null;

      // Renderização condicional baseada na variant
      if (variant === "vertical") {
        return (
          <div
            key={row.formatted_date}
            ref={row.isToday ? targetRowRef : null}
            className={`group relative bg-white dark:bg-zinc-800 rounded-xl p-4 border transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1 ${
              row.isToday
                ? "border-teal-500 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 shadow-lg"
                : "border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600"
            }`}
          >
            {/* Today Badge */}
            {row.isToday && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                Hoje
              </div>
            )}

            {/* Vertical Layout: Date Left, Financial Data Right */}
            <div className="flex gap-4">
              {/* Date Section - Left */}
              <div className="flex-shrink-0 w-20">
                <div className="text-center">
                  <div className="p-2.5 bg-zinc-100 dark:bg-zinc-700 rounded-lg mb-1.5">
                    <Calendar
                      size={18}
                      className="text-zinc-600 dark:text-zinc-400 mx-auto"
                    />
                  </div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                    {new Date(`${row.date}T00:00:00`).getDate()}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {new Date(`${row.date}T00:00:00`)
                      .toLocaleDateString("pt-BR", { month: "short" })
                      .toUpperCase()}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(`${row.date}T00:00:00`)
                      .toLocaleDateString("pt-BR", { weekday: "short" })
                      .toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Financial Data Section - Right */}
              <div className="flex-1 space-y-2.5">
                {/* Income */}
                <div 
                  className="group/income-v relative p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 transition-all duration-200 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105 hover:shadow-md"
                  onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'income' })}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        size={12}
                        className="text-green-600 dark:text-green-400"
                      />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        Receitas
                      </span>
                    </div>
                    <p className="font-semibold text-green-700 dark:text-green-300 text-sm">
                      {row.incomes?.valueFormatted || "R$ 0,00"}
                    </p>
                  </div>
                  
                  {/* Transaction Count and Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 dark:text-green-400">
                      {row.incomes?.transactions?.length || 0} transações
                    </span>
                    {row.incomes?.transactions && row.incomes.transactions.length > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-green-600 dark:text-green-400">
                          {row.incomes.transactions.filter((t: any) => {
                            const today = new Date();
                            const transDate = new Date(`${t.transaction_day}T00:00:00`);
                            today.setHours(0, 0, 0, 0);
                            transDate.setHours(0, 0, 0, 0);
                            return t.is_paid !== undefined ? t.is_paid : transDate <= today;
                          }).length} pagas
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Income Button */}
                  <button
                    className="absolute top-1 right-1 p-1 bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 rounded-full opacity-0 group-hover/income-v:opacity-100 transition-all duration-200 transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenModal({
                        isOpen: true,
                        transaction: {
                          category_id: '',
                          description: '',
                          price: '',
                          category: { id: '', name: '', color: '', icon: '', iconName: '', icon_name: '', type: 'income' },
                          transaction_day: row.date,
                          type: 'income'
                        } as any,
                        type: 'create',
                      });
                    }}
                    title="Adicionar receita"
                  >
                    <Plus
                      size={10}
                      className="text-green-700 dark:text-green-300"
                    />
                  </button>
                </div>

                {/* Outcome */}
                <div 
                  className="group/outcome-v relative p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 transition-all duration-200 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 hover:shadow-md"
                  onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'outcome' })}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <TrendingDown
                        size={12}
                        className="text-red-600 dark:text-red-400"
                      />
                      <span className="text-xs font-medium text-red-700 dark:text-red-300">
                        Despesas
                      </span>
                    </div>
                    <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                      {row.outcomes?.valueFormatted || "R$ 0,00"}
                    </p>
                  </div>
                  
                  {/* Transaction Count and Status */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600 dark:text-red-400">
                      {row.outcomes?.transactions?.length || 0} transações
                    </span>
                    {row.outcomes?.transactions && row.outcomes.transactions.length > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-red-600 dark:text-red-400">
                          {row.outcomes.transactions.filter((t: any) => {
                            const today = new Date();
                            const transDate = new Date(`${t.transaction_day}T00:00:00`);
                            today.setHours(0, 0, 0, 0);
                            transDate.setHours(0, 0, 0, 0);
                            return t.is_paid !== undefined ? t.is_paid : transDate <= today;
                          }).length} pagas
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Outcome Button */}
                  <button
                    className="absolute top-1 right-1 p-1 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 rounded-full opacity-0 group-hover/outcome-v:opacity-100 transition-all duration-200 transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenModal({
                        isOpen: true,
                        transaction: {
                          category_id: '',
                          description: '',
                          price: '',
                          category: { id: '', name: '', color: '', icon: '', iconName: '', icon_name: '', type: 'outcome' },
                          transaction_day: row.date,
                          type: 'outcome'
                        } as any,
                        type: 'create',
                      });
                    }}
                    title="Adicionar despesa"
                  >
                    <Plus
                      size={10}
                      className="text-red-700 dark:text-red-300"
                    />
                  </button>
                </div>

                {/* Balance */}
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <BarChart3
                        size={12}
                        className="text-zinc-600 dark:text-zinc-400"
                      />
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Saldo
                      </span>
                    </div>
                    <p
                      className={`font-bold text-sm flex items-center ${balanceColor}`}
                    >
                      {balanceIcon}
                      {row.total.valueFormatted}
                    </p>
                  </div>
                  
                  {/* Total Transaction Count */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Total: {((row.incomes?.transactions?.length || 0) + (row.outcomes?.transactions?.length || 0))} transações
                    </span>
                    <button
                      onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'all' })}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      title="Ver todas"
                    >
                      <Eye size={11} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Horizontal variant (simplified for now)
      return (
        <div key={row.formatted_date} className="p-4 border rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {DateTime.fromISO(row.date).toFormat('dd/MM')} - {row.total.valueFormatted}
          </div>
        </div>
      );
    });
  }, [limitedRows, rowsLoading, variant, maxDays, targetRowRef, setDayDetailsModal, setOpenModal]);

  return (
    <>
      {rows.length > 0 ? (
        <div className="w-full pt-2">
          {/* Content Container */}
          <div
            ref={tableContainerRef}
            className="w-full flex flex-auto relative"
          >
            <div className="w-full grid gap-4 auto-rows-min">
              {memoizedTransactions}
            </div>
          </div>

          {/* View All Button */}
          {showViewAllButton && (
            <div className="flex justify-center mt-6">
              <Link
                to="/transacoes"
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                Ver todas transações
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      ) : variant === "vertical" ? (
        <VerticalCardSkeleton count={maxDays || 3} />
      ) : (
        <CardSkeleton count={maxDays || 3} />
      )}

      {/* Modals */}
      {openModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {openModal.type === "edit" ? (
              <ModalEdit
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleUpdateTransaction={handleUpdateTransaction}
                handleUpdateInstallmentTransaction={handleUpdateInstallmentTransaction}
                handleUpdateRecurringTransaction={handleUpdateRecurringTransaction}
                handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonthWrapper}
                categories={categories}
                creditCards={creditCards}
                from={from}
                retryCategories={retryCategories}
              />
            ) : openModal.type === "delete" ? (
              <ModalDelete
                setOpenModal={setOpenModal}
                openModal={openModal}
                handleDeleteTransaction={handleDeleteTransaction}
                handleDeleteRecurringTransaction={handleDeleteRecurringTransaction}
                handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonthWrapper}
                from={from}
              />
            ) : (
              <ModalCreate
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleCreateRecurringTransaction={handleCreateRecurringTransaction}
                handleCreateInstallmentTransaction={handleCreateInstallmentTransaction}
                handleCreateCompleteTransaction={handleCreateCompleteTransaction}
                creditCards={creditCards}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonthWrapper}
                categories={categories}
                from={from}
                retryCategories={retryCategories}
              />
            )}
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      {dayDetailsModal.isOpen && dayDetailsModal.dayData && (
        <DayDetailsModal
          isOpen={dayDetailsModal.isOpen}
          onClose={() => setDayDetailsModal({ isOpen: false, dayData: null })}
          dayData={dayDetailsModal.dayData}
          setOpenModal={setOpenModal}
          initialFilter={dayDetailsModal.initialFilter}
        />
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddModal.isOpen}
        onClose={() => setQuickAddModal({ isOpen: false, date: '' })}
        date={quickAddModal.date}
        setOpenModal={setOpenModal}
      />
    </>
  );
};

export default TablePreviewModern;
