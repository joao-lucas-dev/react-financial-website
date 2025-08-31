import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Edit3,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { DateTime } from "luxon";
import { useEffect, useRef, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";

import CategoryIcon from "../../components/CategoryIcon/index.tsx";
import CountUp from "../../components/CountUp.tsx";
import CreditCardCarousel from "../../components/CreditCardCarousel";
import CreditCardEmptyState from "../../components/CreditCardEmptyState";
import EmptyChartState from "../../components/EmptyChartState";
import FloatingButton from "../../components/FloatingButton.tsx";
import MenuAside from "../../components/MenuAside.tsx";
import ModalCreate from "../../components/ModalCreate.tsx";
import ModalDelete from "../../components/ModalDelete";
import ModalEdit from "../../components/ModalEdit";
import ModernDonutChart from "../../components/ModernDonutChart.tsx";
import PaymentStatusIcon from "../../components/PaymentStatusIcon.tsx";
import SavingsGoalsSimple from "../../components/SavingsGoalsSimple";
import TablePreview from "../../components/TablePreview";

// New imports
import { useCategories, useCategoriesChart } from "../../queries/categoriesQueries";
import { useCreditCards } from "../../queries/creditCardsQueries";
import {
  useCreateCompleteTransaction,
  useCreateInstallmentTransaction,
  useCreateRecurringTransaction,
  useCreateTransaction,
  useDeleteTransaction,
  useDeleteInstallmentTransaction,
  useDeleteRecurringTransaction,
  usePeriodsSummary,
  useRecentTransactions,
  useTransactionsBalance,
  useTransactionsOverview,
  useTransactionsPreview,
  useUpdateInstallmentTransaction,
  useUpdateRecurringTransaction,
  useUpdateTransaction,
} from "../../queries/transactionsQueries";
import { useDashboardStore } from "../../stores/dashboardStore";
import { IHandleDeleteTransaction } from "../../types/queryTypes.ts";
import { IHandleUpdateTransaction, ITransaction } from "../../types/transactions.ts";
import "./styles.css";

export default function Dashboard() {
  // Zustand store for UI state
  const {
    openModal,
    setOpenModal,
    recentSearchTerm,
    setRecentSearchTerm,
    paymentStatusFilter,
    setPaymentStatusFilter,
    recentTypeFilter,
    setRecentTypeFilter,
    filtersExpanded,
    setFiltersExpanded,
    searchExpanded,
    setSearchExpanded,
    activeMenuId,
    setActiveMenuId,
    itemsToShow,
    setItemsToShow,
    getActiveFiltersCount,
  } = useDashboardStore();

  // Current date for queries
  const [currentDate] = useState(DateTime.now());
  const [currentMonth, setCurrentMonth] = useState(currentDate.month);

  // React Query hooks with loading states
  const { data: overview, isLoading: overviewLoading } = useTransactionsOverview(currentDate);
  const { data: balance } = useTransactionsBalance(currentDate);
  const { data: recentTransactions = [] } = useRecentTransactions();
  const { data: rows = [] } = useTransactionsPreview(currentDate);
  const { data: periodsSummary } = usePeriodsSummary();
  const { data: chartCategories, isLoading: chartLoading } = useCategoriesChart(currentDate);
  const { data: categories = [], refetch: retryCategories } = useCategories();
  const { data: creditCards = [], isLoading: creditCardsLoading } = useCreditCards();

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

  // Refs and constants
  const menuRef = useRef<HTMLDivElement>(null);
  const itemsPerLoad = 5;

  // Função para determinar se uma transação está paga
  const isTransactionPaid = (transaction: any) => {
    // Se tem campo is_paid, usar ele (tem prioridade)
    if (transaction.is_paid !== undefined) {
      return transaction.is_paid;
    }
    // Se tem payment_status, usar ele
    if (transaction.payment_status) {
      return transaction.payment_status === 'paid';
    }
    // Para transações sem status específico, considerar não paga por padrão
    // (não usar fallback de data para evitar marcação incorreta)
    return false;
  };

  // Função para filtrar transações recentes
  const filteredRecentTransactions = recentTransactions.filter(transaction => {
    // Filtro por busca na descrição
    const searchMatch = transaction.description?.toLowerCase().includes(recentSearchTerm.toLowerCase()) || 
                       transaction.category?.name?.toLowerCase().includes(recentSearchTerm.toLowerCase());
    
    // Filtro por tipo (receita/despesa)
    const typeMatch = recentTypeFilter === "all" || transaction.type === recentTypeFilter;
    
    // Filtro por status de pagamento
    const paymentMatch = paymentStatusFilter === "all" || 
                        (paymentStatusFilter === "paid" && isTransactionPaid(transaction)) ||
                        (paymentStatusFilter === "unpaid" && !isTransactionPaid(transaction));
    
    return searchMatch && typeMatch && paymentMatch;
  });

  // Get active filters count from store
  const activeFiltersCount = getActiveFiltersCount();

  // Calcular transações visíveis e restantes
  const visibleTransactions = filteredRecentTransactions.slice(0, itemsToShow);
  const remainingTransactions = filteredRecentTransactions.length - itemsToShow;
  const hasMoreTransactions = remainingTransactions > 0;

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handlers para ações das transações
  const handleEditTransaction = (transaction: any) => {
    setOpenModal({
      isOpen: true,
      transaction: transaction,
      type: "edit"
    });
    setActiveMenuId(null);
  };

  const handleDeleteRecentTransaction = (transaction: any) => {
    setOpenModal({
      isOpen: true,
      transaction: { ...transaction },
      type: 'delete',
    });
    setActiveMenuId(null);
  };

  // Função para carregar mais transações
  const handleLoadMore = () => {
    setItemsToShow(itemsToShow + itemsPerLoad);
  };

  // Reset itemsToShow when filters change
  useEffect(() => {
    setItemsToShow(5);
  }, [recentSearchTerm, recentTypeFilter, paymentStatusFilter, setItemsToShow]);
  
  // Helper functions
  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour <= 12) {
      return 'Bom dia';
    } else if (hour > 12 && hour <= 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  // Credit Card Handlers
  const handleCardClick = (card: any) => {
    // TODO: Implementar navegação para detalhes do cartão ou ações
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

  const handleDeleteTransaction: IHandleDeleteTransaction = async (
    id?: string, 
  ) => {
    if (!id) return;
    try {
      await deleteTransactionMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleUpdateTransaction: IHandleUpdateTransaction = async (
    transaction: ITransaction,
  ) => {
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

  // Default values for undefined data
  const defaultChartCategories = {
    notIncome: {
      config: [],
      total: 0,
      chartConfig: {
        labels: ['sem valor'],
        datasets: [{ data: [0], backgroundColor: ['#000'], hoverBackgroundColor: ['#000'] }],
      },
    },
    income: {
      config: [],
      total: 0,
      chartConfig: {
        labels: ['sem valor'],
        datasets: [{ data: [0], backgroundColor: ['#000'], hoverBackgroundColor: ['#000'] }],
      },
    },
  };

  const defaultPeriodsSummary = {
    today: { balance: 0 },
    thisWeek: { balance: 0 },
    thisMonth: { balance: 0 },
  };

  const defaultOverview = {
    income: { total: 0, type: 'income' as const, percentage: 0, isPositive: false },
    outcome: { total: 0, type: 'outcome' as const, percentage: 0, isPositive: false },
    remaining: { total: 0, type: 'remaining' as const, percentage: 0, isPositive: false },
  };

  return (
    <div className="font-sans">
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
        {/* <Header title="Dashboard" activePage="dashboard" /> */}

        <div className="flex h-full">
          <MenuAside activePage="dashboard" />

          <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 mb-8 shadow-2xl transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold mb-2 text-zinc-700 dark:text-zinc-200">
                    {getGreeting()}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Bem-vindo de volta ao seu painel financeiro
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    Saldo Hoje
                  </p>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    <CountUp valueNumber={balance || 0} />
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Card Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mb-8">
              <div>
                {creditCardsLoading ? (
                  <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl">
                    <div className="animate-pulse">
                      <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded mb-4"></div>
                      <div className="h-40 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                  </div>
                ) : creditCards.length > 0 ? (
                  <CreditCardCarousel
                    cards={creditCards}
                    onCardClick={handleCardClick}
                  />
                ) : (
                  <CreditCardEmptyState />
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          Receitas
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          do mês atual
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      <CountUp valueNumber={(overview || defaultOverview).income.total} />
                    </p>
                    {overview?.income?.percentage !== undefined && (
                      <div className="flex items-center gap-1">
                        {(() => {
                          const percentage = Number(overview.income.percentage)
                          if (isNaN(percentage)) return null
                          
                          return overview?.income?.isPositive ? (
                            <>
                              <ChevronUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-500">
                                {percentage.toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-500">
                                {percentage.toFixed(1)}%
                              </span>
                            </>
                          )
                        })()}
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                          em relação ao mês passado
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          Despesas
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          do mês atual
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      <CountUp valueNumber={(overview || defaultOverview).outcome.total} />
                    </p>
                    {overview?.outcome?.percentage !== undefined && (
                      <div className="flex items-center gap-1">
                        {(() => {
                          const percentage = Number(overview.outcome.percentage)
                          if (isNaN(percentage)) return null
                          
                          return overview?.outcome?.isPositive ? (
                            <>
                              <ChevronDown className="w-4 h-4 text-green-500 dark:text-green-400" />
                              <span className="text-sm font-medium text-green-500 dark:text-green-400">
                                {percentage.toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <ChevronUp className="w-4 h-4 text-red-500 dark:text-red-400" />
                              <span className="text-sm font-medium text-red-500 dark:text-red-400">
                                {percentage.toFixed(1)}%
                              </span>
                            </>
                          )
                        })()}
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                          em relação ao mês passado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid: TablePreview + Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mb-8">
              {/* Left Column: TablePreview Vertical */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-2xl transition-colors flex flex-col">
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                      <BarChart3
                        size={18}
                        className="text-teal-600 dark:text-teal-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                        Visão Financeira
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Últimos dias
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <TablePreview
                    rows={rows}
                    handleCreateTransaction={handleCreateTransaction}
                    handleCreateCompleteTransaction={
                      handleCreateCompleteTransaction
                    }
                    handleCreateInstallmentTransaction={
                      handleCreateInstallmentTransaction
                    }
                    handleCreateRecurringTransaction={
                      handleCreateRecurringTransaction
                    }
                    handleDeleteTransaction={handleDeleteTransaction}
                    handleUpdateTransaction={handleUpdateTransaction}
                    handleUpdateRecurringTransaction={handleUpdateRecurringTransaction}
                    handleDeleteRecurringTransaction={handleDeleteRecurringTransaction}
                    handleUpdateInstallmentTransaction={handleUpdateInstallmentTransaction}
                    handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    categories={categories}
                    creditCards={creditCards}
                    from="dashboard"
                    maxDays={2}
                    showViewAllButton={true}
                    variant="vertical"
                    retryCategories={retryCategories}
                  />
                </div>
              </div>

              {/* Right Column: Categories */}
              <div className="space-y-6 h-full flex flex-col">
                {/* Outcome Categories - Now on Top */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl flex-1 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          Maiores Despesas
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Principais categorias do mês
                        </p>
                      </div>
                    </div>
                  </div>
                  {chartLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded mb-4"></div>
                      <div className="h-32 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                    </div>
                  ) : (chartCategories || defaultChartCategories).notIncome.config.length === 0 ? (
                    <EmptyChartState
                      type="despesas"
                      onAddTransaction={() =>
                        setOpenModal({
                          isOpen: true,
                          transaction: {} as ITransaction,
                          type: "create",
                        })
                      }
                    />
                  ) : (
                    <div className="flex">
                      {/* Lista de categorias centralizadas - metade esquerda */}
                      <div className="w-1/2 pr-4 flex flex-col justify-center">
                        {(chartCategories || defaultChartCategories).notIncome.config
                          .slice(0, 5)
                          .map((item, index) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-start py-3 ${index !== (chartCategories || defaultChartCategories).notIncome.config.slice(0, 5).length - 1 ? "border-b border-zinc-100 dark:border-zinc-700" : ""}`}
                            >
                              <div className="flex justify-between items-center gap-3 w-full">
                                <div className="flex items-center gap-3">
                                  <CategoryIcon size="small" category={item} />
                                  <span className="text-sm text-zinc-700 dark:text-zinc-200 min-w-0 truncate max-w-24">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="text-base font-bold text-zinc-600 dark:text-zinc-400">
                                  {item.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Chart e botão - metade direita */}
                      <div className="w-1/2 flex flex-col items-center">
                        <div className="w-full">
                          <ModernDonutChart data={(chartCategories || defaultChartCategories).notIncome.config} />
                        </div>
                        <Link
                          to={{
                            pathname: "/relatorios",
                            search: `?type=incomes&date=${rows.length > 0 ? rows[0].date.substring(0, 7) : ""}`,
                          }}
                          className="mt-4 flex items-center px-6 py-2 rounded-lg border border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 transition-all text-sm font-medium hover:bg-teal-600 hover:text-white dark:hover:bg-teal-400 dark:hover:text-zinc-900"
                        >
                          Ver relatório
                          <ArrowRight size={16} className="ml-2" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <SavingsGoalsSimple />
              </div>
            </div>

            {/* Enhanced Transactions Preview */}
            <div className="mt-8 bg-white dark:bg-zinc-800 rounded-xl p-6 mb-6 shadow-2xl border border-white border-opacity-20 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      Transações Recentes
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Suas últimas movimentações
                    </p>
                  </div>
                </div>

                {/* Controles de Busca e Filtro */}
                <div className="flex items-center gap-2">
                  {/* Busca Expansível */}
                  <div className="flex items-center">
                    {searchExpanded ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Buscar transações..."
                            value={recentSearchTerm}
                            onChange={(e) => setRecentSearchTerm(e.target.value)}
                            className="pl-3 pr-8 py-2 w-64 border border-zinc-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-all"
                            autoFocus
                            onBlur={() => {
                              if (!recentSearchTerm) {
                                setSearchExpanded(false);
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              setRecentSearchTerm("");
                              setSearchExpanded(false);
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-all"
                          >
                            <X size={14} className="text-zinc-400" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSearchExpanded(true)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-all"
                        title="Buscar transações"
                      >
                        <Search size={18} className="text-zinc-500 dark:text-zinc-400" />
                      </button>
                    )}
                  </div>

                  {/* Botão de Filtros */}
                  <button
                    onClick={() => setFiltersExpanded(!filtersExpanded)}
                    className={`p-2 rounded-lg transition-all ${
                      activeFiltersCount > 0 || filtersExpanded
                        ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                    }`}
                    title="Filtros"
                  >
                    <div className="relative">
                      <SlidersHorizontal size={18} />
                      {activeFiltersCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Painel de Filtros Expandido */}
              {filtersExpanded && (
                <div className="mb-6 bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Filtrar transações
                    </h4>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={() => {
                          setRecentSearchTerm("");
                          setRecentTypeFilter("all");
                          setPaymentStatusFilter("all");
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-all"
                      >
                        <X size={12} />
                        Limpar filtros
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Filtro de Tipo com Chips */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Tipo de Transação
                        </label>
                        <div className="flex gap-2">
                          {[
                            { value: 'all', label: 'Todas', icon: null },
                            { value: 'income', label: 'Receitas', icon: TrendingUp },
                            { value: 'outcome', label: 'Despesas', icon: TrendingDown }
                          ].map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              onClick={() => setRecentTypeFilter(value as any)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                recentTypeFilter === value
                                  ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700'
                                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                              }`}
                            >
                              {Icon && <Icon size={14} />}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filtro de Status com Chips */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          Status de Pagamento
                        </label>
                        <div className="flex gap-2">
                          {[
                            { value: 'all', label: 'Todos', icon: null },
                            { value: 'paid', label: 'Pagas/Recebidas', icon: CheckCircle2 },
                            { value: 'unpaid', label: 'Não Pagas/Não Recebidas', icon: Clock }
                          ].map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              onClick={() => setPaymentStatusFilter(value as any)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                paymentStatusFilter === value
                                  ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700'
                                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                              }`}
                            >
                              {Icon && <Icon size={14} />}
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Chips de Filtros Ativos */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {recentSearchTerm && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                      <Search size={12} />
                      <span>"{recentSearchTerm}"</span>
                      <button
                        onClick={() => setRecentSearchTerm("")}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {recentTypeFilter !== "all" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full">
                      {recentTypeFilter === 'income' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{recentTypeFilter === 'income' ? 'Receitas' : 'Despesas'}</span>
                      <button
                        onClick={() => setRecentTypeFilter("all")}
                        className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  {paymentStatusFilter !== "all" && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-full">
                      {paymentStatusFilter === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{paymentStatusFilter === 'paid' ? 'Pagas/Recebidas' : 'Não Pagas/Não Recebidas'}</span>
                      <button
                        onClick={() => setPaymentStatusFilter("all")}
                        className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Modern Transaction Cards */}
              <div className="space-y-3 mb-6">
                {visibleTransactions.length > 0 ? (
                  visibleTransactions.map((transaction) => {
                    const isIncome = transaction.type === 'income'
                    const formattedPrice = new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(transaction.price))
                    const formattedDate = new Date(transaction.transaction_day).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short'
                    })
                    
                    return (
                      <div key={transaction.id} className="relative flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 transition-all duration-200 hover:shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-600 hover:border-teal-500">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 flex items-center justify-center relative">
                            {transaction.category ? (
                              <CategoryIcon 
                                category={transaction.category} 
                                size="large"
                              />
                            ) : (
                              <span className="text-lg">💳</span>
                            )}
                            {transaction.is_recurring && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs bg-orange-500 text-white">
                                ↻
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {(transaction.fromCreditCard || transaction.card_id) && (
                                <CreditCard className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                              )}
                              <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
                                {transaction.description}
                              </h4>
                              {(transaction.installment_info || transaction.installments) && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                                  {transaction.installment_info || `${transaction.installments}x parcelas`}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${transaction.category.color} text-white`}>
                                {transaction.category?.name}
                              </span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <div className={`text-lg font-semibold ${
                              isIncome
                                ? 'text-green-500 dark:text-green-400'
                                : 'text-red-500 dark:text-red-400'
                            }`}>
                              {isIncome ? '+' : '-'}{formattedPrice}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium `}>
                              <PaymentStatusIcon
                                isPaid={isTransactionPaid(transaction)}
                                isAnimating={false}
                                onClick={() => {}}
                                title={isTransactionPaid(transaction) ? 
                                  (transaction.type === 'income' ? 'Recebido' : 'Pago') : 
                                  (transaction.type === 'income' ? 'Não Recebido' : 'Não Pago')
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Menu de Ações */}
                        <div className="relative ml-2" ref={activeMenuId === transaction.id ? menuRef : null}>
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === transaction.id ? null : (transaction.id || null))}
                            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all"
                          >
                            <MoreHorizontal size={16} className="text-zinc-500 dark:text-zinc-400" />
                          </button>
                          
                          {activeMenuId === transaction.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-600 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditTransaction(transaction)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                                >
                                  <Edit3 size={14} />
                                  Editar Transação
                                </button>
                                <button
                                  onClick={() => handleDeleteRecentTransaction(transaction)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                  <Trash2 size={14} />
                                  Excluir Transação
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex items-center justify-center p-8 text-zinc-500 dark:text-zinc-400">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <p className="text-sm">Nenhuma transação recente encontrada</p>
                      <p className="text-xs mt-1">As transações aparecerão aqui quando disponíveis</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão Ver Mais */}
              {hasMoreTransactions && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={handleLoadMore}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl border border-zinc-200 dark:border-zinc-600 transition-all duration-200 hover:shadow-md group"
                  >
                    <span className="text-sm font-medium">
                      Ver mais {Math.min(remainingTransactions, itemsPerLoad)} transações
                    </span>
                    <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                    <div className="px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-xs text-zinc-600 dark:text-zinc-400 rounded-full">
                      +{remainingTransactions}
                    </div>
                  </button>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                <div className="text-center">
                  <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                    Hoje
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    <CountUp valueNumber={(periodsSummary || defaultPeriodsSummary).today.balance} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                    Esta Semana
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    <CountUp valueNumber={(periodsSummary || defaultPeriodsSummary).thisWeek.balance} />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                    Este Mês
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    <CountUp valueNumber={(periodsSummary || defaultPeriodsSummary).thisMonth.balance} />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <FloatingButton setOpenModal={setOpenModal} />
      
      {/* Modais para transações recentes */}
      {openModal.isOpen && (
        <>
          {openModal.type === "edit" ? (
            <ModalEdit
              openModal={openModal}
              setOpenModal={setOpenModal}
              handleUpdateTransaction={handleUpdateTransaction}
              handleUpdateInstallmentTransaction={handleUpdateInstallmentTransaction}
              handleUpdateRecurringTransaction={handleUpdateRecurringTransaction}
              handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              categories={categories}
              creditCards={creditCards}
              from="dashboard"
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
              setCurrentMonth={setCurrentMonth}
              from="dashboard"
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
              setCurrentMonth={setCurrentMonth}
              categories={categories}
              from="dashboard"
              retryCategories={retryCategories}
            />
          )}
        </>
      )}
    </div>
  );
}
