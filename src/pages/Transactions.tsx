import Header from "../components/Header.tsx";
import MenuAside from "../components/MenuAside.tsx";
import { BarChart3, Calendar, List, Grid3X3 } from "lucide-react";
import TablePreview from "../components/TablePreview";
import TransactionsListView from "../components/TransactionsListView";
import PeriodNavigator, { PeriodType } from "../components/PeriodNavigator";
import CustomPeriodModal from "../components/CustomPeriodModal";
import { useState } from "react";
import { DateTime } from "luxon";
import { ITransaction } from "../types/transactions.ts";

// React Query imports
import { useCategories } from "../queries/categoriesQueries";
import { useCreditCards } from "../queries/creditCardsQueries";
import {
  useCreateCompleteTransaction,
  useCreateInstallmentTransaction,
  useCreateRecurringTransaction,
  useCreateTransaction,
  useDeleteTransaction,
  useDeleteInstallmentTransaction,
  useDeleteRecurringTransaction,
  useTransactionsPreview,
  useUpdateInstallmentTransaction,
  useUpdateRecurringTransaction,
  useUpdateTransaction,
} from "../queries/transactionsQueries";

const Transactions = () => {
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    transaction: {} as ITransaction,
    type: "",
  });
  const [resetScroll] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [isCustomPeriodModalOpen, setIsCustomPeriodModalOpen] = useState(false);
  const [currentPeriodType, setCurrentPeriodType] = useState<PeriodType>('month');
  const [currentPeriodRange, setCurrentPeriodRange] = useState<{start: string, end: string} | null>(null);
  const [currentDate, setCurrentDate] = useState<DateTime>(DateTime.now());
  const [isLoading, setIsLoading] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{startDate?: DateTime, endDate?: DateTime}>({});

  // React Query hooks - Por padrão sempre pega o mês atual
  const { data: rows = [], refetch: refetchRows } = useTransactionsPreview(
    currentDate, 
    customDateRange.startDate, 
    customDateRange.endDate
  );
  const { data: categories = [], refetch: retryCategories } = useCategories();
  const { data: creditCards = [] } = useCreditCards();

  // Mutations
  const createTransactionMutation = useCreateTransaction();
  const createCompleteTransactionMutation = useCreateCompleteTransaction();
  const createInstallmentTransactionMutation = useCreateInstallmentTransaction();
  const createRecurringTransactionMutation = useCreateRecurringTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const updateRecurringTransactionMutation = useUpdateRecurringTransaction();
  const deleteRecurringTransactionMutation = useDeleteRecurringTransaction();
  const updateInstallmentTransactionMutation = useUpdateInstallmentTransaction();
  const deleteInstallmentTransactionMutation = useDeleteInstallmentTransaction();

  // Current month and year for UI
  const currentMonth = currentDate.month;
  const currentYear = currentDate.year;

  // Function to handle date range changes (para períodos customizados)
  const handleDateRangeChange = async (startDate: string, endDate: string, type: PeriodType) => {
    setIsLoading(true);
    try {
      const luxonStartDate = DateTime.fromISO(startDate).startOf('day');
      const luxonEndDate = DateTime.fromISO(endDate).endOf('day');
      
      setCurrentDate(luxonStartDate);
      setCurrentPeriodType(type);
      setCurrentPeriodRange({ start: startDate, end: endDate });
      setCustomDateRange({ startDate: luxonStartDate, endDate: luxonEndDate });
      
      // Refetch data with new date range
      await refetchRows();
      
    } catch (error) {
      console.error('Error changing period:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle month/year changes
  const handleMonthChange = async (month: number | ((prevState: number) => number)) => {
    setIsLoading(true);
    try {
      const monthValue = typeof month === 'function' ? month(currentMonth) : month;
      const newDate = currentDate.set({ month: monthValue }) as DateTime<true>;
      setCurrentDate(newDate);
      setCurrentPeriodType('month');
      setCurrentPeriodRange(null);
      setCustomDateRange({}); // Remove custom range para usar o padrão
      await refetchRows();
    } catch (error) {
      console.error('Error changing month:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper function for compatibility with ISetCurrentMonth type
  const setCurrentMonth = (month: number | ((prevState: number) => number)) => {
    handleMonthChange(month);
  };

  const handleYearChange = async (year: number) => {
    setIsLoading(true);
    try {
      const newDate = currentDate.set({ year });
      setCurrentDate(newDate);
      setCurrentPeriodType('month');
      setCurrentPeriodRange(null);
      setCustomDateRange({}); // Remove custom range para usar o padrão
      await refetchRows();
    } catch (error) {
      console.error('Error changing year:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle today - startDate: hoje, endDate: hoje
  const handleToday = async () => {
    setIsLoading(true);
    try {
      const today = DateTime.now();
      const startDate = today.startOf('day'); // 00:00:00.000
      const endDate = today.endOf('day');     // 23:59:59.999
      
      setCurrentDate(today);
      setCurrentPeriodType('today' as PeriodType);
      setCurrentPeriodRange({ 
        start: startDate.toISODate() || '', 
        end: endDate.toISODate() || '' 
      });
      setCustomDateRange({ startDate, endDate });
      
      await refetchRows();
    } catch (error) {
      console.error('Error going to today:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle this week - hoje -3 para startDate, hoje +3 para endDate
  const handleThisWeek = async () => {
    setIsLoading(true);
    try {
      const today = DateTime.now();
      const startDate = today.minus({ days: 3 }).startOf('day'); // hoje -3 às 00:00:00.000
      const endDate = today.plus({ days: 3 }).endOf('day');       // hoje +3 às 23:59:59.999
      
      setCurrentDate(today);
      setCurrentPeriodType('week');
      setCurrentPeriodRange({ 
        start: startDate.toISODate() || '', 
        end: endDate.toISODate() || '' 
      });
      setCustomDateRange({ startDate, endDate });
      
      await refetchRows();
    } catch (error) {
      console.error('Error going to this week:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle this month - volta para o padrão (mês atual)
  const handleThisMonth = async () => {
    setIsLoading(true);
    try {
      const now = DateTime.now();
      setCurrentDate(now);
      setCurrentPeriodType('month');
      setCurrentPeriodRange(null);
      setCustomDateRange({}); // Remove custom range para usar o padrão
      
      await refetchRows();
    } catch (error) {
      console.error('Error going to this month:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if today is available
  const hasToday = () => {
    return currentPeriodType === 'today' || (currentPeriodType === 'month' && currentDate.hasSame(DateTime.now(), 'day'));
  };

  // Transaction handlers using mutations
  const handleCreateTransaction = async (
    type: 'incomes' | 'outcomes',
    row: any,
    value: any,
    setValue: any,
  ) => {
    try {
      const now = DateTime.now();
      const transactionDay = DateTime.fromISO(row.date).set({
        hour: now.hour,
        minute: now.minute,
        second: now.second,
        millisecond: now.millisecond,
      });

      await createTransactionMutation.mutateAsync({
        description: 'Insira uma descrição',
        price: value.originalValue,
        category_id: type === 'incomes' ? "10" : "4",
        type: type.substring(0, type.length - 1) as 'income' | 'outcome',
        transaction_day: transactionDay.toISO() || '',
      });

      setValue({ formattedValue: '', originalValue: 0 });
    } catch (err) {
      console.error('Error creating transaction:', err);
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

  const handleDeleteTransaction = async (id?: string) => {
    if (!id) return;
    try {
      await deleteTransactionMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleUpdateTransaction = async (transaction: ITransaction) => {
    try {
      await updateTransactionMutation.mutateAsync(transaction);
    } catch (err) {
      console.error('Error updating transaction:', err);
    }
  };

  // Legacy handlers for backward compatibility
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
            <p className="text-zinc-600 dark:text-zinc-400 text-base mb-4">
              Acompanhe suas transações mensais
            </p>
            
            {/* Period Type Indicator */}
            {currentPeriodType !== 'month' && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    isLoading ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'
                  }`}></div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    Modo de visualização: {currentPeriodType === 'week' ? 'Semanal' : 'Período Customizado'}
                  </span>
                  {currentPeriodRange && (
                    <span className="text-blue-600 dark:text-blue-400">
                      ({new Date(currentPeriodRange.start).toLocaleDateString('pt-BR')} - {new Date(currentPeriodRange.end).toLocaleDateString('pt-BR')})
                    </span>
                  )}
                  {isLoading && (
                    <span className="text-orange-600 dark:text-orange-400 text-xs">
                      Carregando dados...
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Loading Indicator for Data Fetch */}
            {isLoading && (
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-orange-700 dark:text-orange-300 font-medium">
                    Carregando dados do período selecionado...
                  </span>
                </div>
              </div>
            )}
            
            {/* Month Summary Stats */}
            {rows.length > 0 && !isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <BarChart3 size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      Total de Receitas
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {rows.reduce((total: number, row: any) => total + (row.incomes?.transactions?.length || 0), 0)} transações
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <BarChart3 size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-red-700 dark:text-red-300">
                      Total de Despesas
                    </div>
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {rows.reduce((total: number, row: any) => total + (row.outcomes?.transactions?.length || 0), 0)} transações
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-600">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                    <BarChart3 size={20} className="text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Total Geral
                    </div>
                    <div className="text-lg font-bold text-zinc-600 dark:text-zinc-400">
                      {rows.reduce((total: number, row: any) => 
                        total + (row.incomes?.transactions?.length || 0) + (row.outcomes?.transactions?.length || 0), 0
                      )} transações
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Controls Header */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              {/* Period Navigator */}
                             <PeriodNavigator
                 currentMonth={currentMonth}
                 currentYear={currentYear}
                 onMonthChange={handleMonthChange}
                 onYearChange={handleYearChange}
                 onQuickPeriod={(type) => {
                   switch (type) {
                     case 'today':
                       handleToday();
                       break;
                     case 'thisWeek':
                       handleThisWeek();
                       break;
                     case 'thisMonth':
                       handleThisMonth();
                       break;
                     case 'custom':
                       setIsCustomPeriodModalOpen(true);
                       break;
                   }
                 }}
                 onPeriodChange={handleDateRangeChange}
                 onCustomPeriod={async (startDate, endDate) => {
                   await handleDateRangeChange(startDate, endDate, 'custom');
                 }}
                 isLoading={isLoading}
               />

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
                handleCreateInstallmentTransaction={handleCreateInstallmentTransaction}
                handleCreateRecurringTransaction={handleCreateRecurringTransaction}
                handleDeleteTransaction={handleDeleteTransaction}
                handleUpdateTransaction={handleUpdateTransaction}
                handleUpdateRecurringTransaction={handleUpdateRecurringTransaction}
                handleDeleteRecurringTransaction={handleDeleteRecurringTransaction}
                handleUpdateInstallmentTransaction={handleUpdateInstallmentTransaction}
                handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth as any}
                openModal={openModal}
                setOpenModal={setOpenModal}
                categories={categories}
                creditCards={creditCards}
                from="transacoes"
                resetScroll={resetScroll}
                retryCategories={retryCategories}
              />
            </div>
          ) : (
            <TransactionsListView
              rows={rows}
              setOpenModal={setOpenModal}
              categories={categories}
              handleCreateTransaction={handleCreateTransaction as any}
              handleUpdateTransaction={handleUpdateTransaction}
              handleDeleteTransaction={handleDeleteTransaction}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth as any}
            />
          )}
          
                     {/* Custom Period Modal */}
           <CustomPeriodModal
             isOpen={isCustomPeriodModalOpen}
             onClose={() => setIsCustomPeriodModalOpen(false)}
             onApply={async (startDate, endDate) => {
               // Fetch data for the custom date range
               await handleDateRangeChange(startDate, endDate, 'custom');
               

             }}
             currentMonth={currentMonth}
             currentYear={currentYear}
           />
        </main>
      </div>
    </div>
  );
};

export default Transactions;
