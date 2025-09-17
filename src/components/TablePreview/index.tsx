import {
  ArrowRight,
  BarChart3,
  Calendar,
  CreditCard,
  Eye,
  Plus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import { ICreditCard } from "../../types/creditCards.ts";
import {
  IHandleCreateCompleteTransaction,
  IHandleCreateTransaction,
  IHandleDeleteInstallmentTransaction,
  IHandleDeleteTransaction,
  IHandleUpdateInstallmentTransaction,
  IHandleUpdateTransaction,
  IOpenModal,
  IRow,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
} from "../../types/transactions";
import CardSkeleton from "../CardSkeleton";
import DayDetailsModal from "../DayDetailsModal";
import ModalCreate from "../ModalCreate.tsx";
import ModalDelete from "../ModalDelete";
import ModalEdit from "../ModalEdit";
import QuickAddModal from "../QuickAddModal";
import VerticalCardSkeleton from "../VerticalCardSkeleton";
import "./styles.css";

interface IParams {
  rows: IRow[];
  handleCreateTransaction: IHandleCreateTransaction;
  handleCreateCompleteTransaction: IHandleCreateCompleteTransaction;
  handleCreateInstallmentTransaction: (transaction: ITransaction, currentMonth: number, setCurrentMonth?: any, from?: string) => Promise<void>;
  handleCreateRecurringTransaction: (transaction: ITransaction, currentMonth: number, setCurrentMonth?: any, from?: string) => Promise<void>;
  handleUpdateTransaction: IHandleUpdateTransaction;
  handleDeleteTransaction: IHandleDeleteTransaction;
  handleUpdateRecurringTransaction?: (
    updateTransaction: ITransaction,
    editMode: 'instance_only' | 'instance_and_future' | 'all_instances',
    currentMonth: number,
    setCurrentMonth: ISetCurrentMonth,
    from: string,
  ) => Promise<void>;
  handleDeleteRecurringTransaction?: (
    id: string,
    editMode: 'instance_only' | 'instance_and_future' | 'all_instances',
    currentMonth: number,
    setCurrentMonth: ISetCurrentMonth,
    from: string,
  ) => Promise<void>;
  handleUpdateInstallmentTransaction?: IHandleUpdateInstallmentTransaction;
  handleDeleteInstallmentTransaction?: IHandleDeleteInstallmentTransaction;
  currentMonth: number;
  setCurrentMonth: ISetCurrentMonth;
  openModal: IOpenModal;
  setOpenModal: ISetOpenModal;
  categories: any[];
  creditCards: ICreditCard[];
  from: string;
  resetScroll?: boolean;
  maxDays?: number;
  showViewAllButton?: boolean;
  variant?: "horizontal" | "vertical";
  retryCategories?: () => void;
}

const TablePreview = ({
  rows,
  handleCreateTransaction,
  handleCreateCompleteTransaction,
  handleCreateInstallmentTransaction,
  handleCreateRecurringTransaction,
  handleDeleteTransaction,
  handleUpdateTransaction,
  handleUpdateRecurringTransaction,
  handleDeleteRecurringTransaction,
  handleUpdateInstallmentTransaction,
  handleDeleteInstallmentTransaction,
  currentMonth,
  setCurrentMonth,
  openModal,
  setOpenModal,
  categories,
  creditCards,
  from = "transacoes",
  resetScroll = false,
  maxDays = undefined,
  showViewAllButton = false,
  variant = "horizontal",
  retryCategories,
}: IParams) => {
  const targetRowRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [dayDetailsModal, setDayDetailsModal] = useState<{
    isOpen: boolean;
    dayData: IRow | null;
    initialFilter?: 'all' | 'income' | 'outcome';
  }>({
    isOpen: false,
    dayData: null,
    initialFilter: 'all',
  });

  const [quickAddModal, setQuickAddModal] = useState<{
    isOpen: boolean;
    date: string;
  }>({
    isOpen: false,
    date: '',
  });

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
    }
  }, [resetScroll]);

  const limitedRows = useMemo(() => {
    return maxDays ? rows.slice(0, maxDays) : rows;
  }, [rows, maxDays]);

  const memoizedTransactions = useMemo(() => {
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
                          {row.incomes.transactions.filter(t => {
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
                          category: { id: 0, name: '', color: '', icon: '', iconName: '', icon_name: '', type: 'income' },
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
                          {row.outcomes.transactions.filter(t => {
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
                          category: { id: 0, name: '', color: '', icon: '', iconName: '', icon_name: '', type: 'outcome' },
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
                
                {/* Quick Transaction Preview - Only show if there are transactions and limit to 1 transaction */}
                {((row.incomes?.transactions?.length || 0) + (row.outcomes?.transactions?.length || 0)) > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Última Transação
                      </span>
                      <button
                        onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'all' })}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        Ver todas
                      </button>
                    </div>
                    <div className="space-y-1">
                      {[
                        ...(row.incomes?.transactions || []).map(t => ({ ...t, type: 'income' as const })),
                        ...(row.outcomes?.transactions || []).map(t => ({ ...t, type: 'outcome' as const }))
                      ]
                        .slice(0, 1) // Show only first 1 transaction
                        .map((transaction, index) => (
                          <div
                            key={transaction.id || index}
                            className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 rounded border border-zinc-100 dark:border-zinc-600"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                transaction.type === 'income'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                  {(transaction.fromCreditCard || transaction.card_id) && (
                                    <CreditCard className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                                  )}
                                  <span className="truncate">{transaction.description}</span>
                                  {(transaction.installment_info || transaction.installments) && (
                                    <span className="ml-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full whitespace-nowrap">
                                      {transaction.installment_info || `${transaction.installments}x`}
                                    </span>
                                  )}
                                  {transaction.is_recurring && (
                                    <span className="ml-1 px-1 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded-full whitespace-nowrap">
                                      ↻
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                  {transaction.category?.name || 'Sem categoria'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <div className={`text-xs font-semibold ${
                                transaction.type === 'income'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {transaction.price}
                              </div>
                              <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${
                                (() => {
                                  const today = new Date();
                                  const transDate = new Date(`${transaction.transaction_day}T00:00:00`);
                                  today.setHours(0, 0, 0, 0);
                                  transDate.setHours(0, 0, 0, 0);
                                  const isPaid = transaction.is_paid !== undefined ? transaction.is_paid : transDate <= today;
                                  return isPaid ? 'bg-green-500' : 'bg-red-500';
                                })()
                              }`}
                              title={(() => {
                                const today = new Date();
                                const transDate = new Date(`${transaction.transaction_day}T00:00:00`);
                                today.setHours(0, 0, 0, 0);
                                transDate.setHours(0, 0, 0, 0);
                                const isPaid = transaction.is_paid !== undefined ? transaction.is_paid : transDate <= today;
                                return isPaid ? 'Pago' : 'Pendente';
                              })()}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                    {((row.incomes?.transactions?.length || 0) + (row.outcomes?.transactions?.length || 0)) > 1 && (
                      <div className="text-center mt-1.5">
                        <button
                          onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'all' })}
                          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          +{((row.incomes?.transactions?.length || 0) + (row.outcomes?.transactions?.length || 0)) - 1} mais
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Layout horizontal original
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

          {/* Date Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                <Calendar
                  size={16}
                  className="text-zinc-600 dark:text-zinc-400"
                />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {row.formatted_date}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(`${row.date}T00:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "long",
                  })}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="p-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-lg transition-colors"
                title="Ver detalhes"
                onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'all' })}
              >
                <Eye
                  size={14}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400"
                />
              </button>
              <button
                className="p-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-lg transition-colors"
                title="Adicionar transação"
                onClick={() => setQuickAddModal({ isOpen: true, date: row.date })}
              >
                <Plus
                  size={14}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400"
                />
              </button>
            </div>
          </div>

          {/* Financial Data Grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* Income */}
            <div 
              className="group/income relative p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 transition-all duration-200 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105 hover:shadow-md"
              onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'income' })}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp
                  size={14}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                  Receitas
                </span>
              </div>
              <p className="font-semibold text-green-700 dark:text-green-300 text-sm mb-1">
                {row.incomes?.valueFormatted || "R$ 0,00"}
              </p>
              <div className="text-xs text-green-600 dark:text-green-400">
                {row.incomes?.transactions?.length || 0} transações
                {row.incomes?.transactions && row.incomes.transactions.length > 0 && (
                  <span className="ml-2">
                    • {row.incomes.transactions.filter(t => {
                      const today = new Date();
                      const transDate = new Date(`${t.transaction_day}T00:00:00`);
                      today.setHours(0, 0, 0, 0);
                      transDate.setHours(0, 0, 0, 0);
                      return t.is_paid !== undefined ? t.is_paid : transDate <= today;
                    }).length} pagas
                  </span>
                )}
              </div>
              
              {/* Add Income Button */}
              <button
                className="absolute top-1 right-1 p-1 bg-green-200 dark:bg-green-800 hover:bg-green-300 dark:hover:bg-green-700 rounded-full opacity-0 group-hover/income:opacity-100 transition-all duration-200 transform hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    isOpen: true,
                    transaction: {
                      category_id: '',
                      description: '',
                      price: '',
                      category: { id: 0, name: '', color: '', icon: '', iconName: '', icon_name: '', type: 'income' },
                      transaction_day: row.date,
                      type: 'income'
                    } as any,
                    type: 'create',
                  });
                }}
                title="Adicionar receita"
              >
                <Plus
                  size={12}
                  className="text-green-700 dark:text-green-300"
                />
              </button>
            </div>

            {/* Outcome */}
            <div 
              className="group/outcome relative p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 transition-all duration-200 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 hover:scale-105 hover:shadow-md"
              onClick={() => setDayDetailsModal({ isOpen: true, dayData: row, initialFilter: 'outcome' })}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown
                  size={14}
                  className="text-red-600 dark:text-red-400"
                />
                <span className="text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wide">
                  Despesas
                </span>
              </div>
              <p className="font-semibold text-red-700 dark:text-red-300 text-sm mb-1">
                {row.outcomes?.valueFormatted || "R$ 0,00"}
              </p>
              <div className="text-xs text-red-600 dark:text-red-400">
                {row.outcomes?.transactions?.length || 0} transações
                {row.outcomes?.transactions && row.outcomes.transactions.length > 0 && (
                  <span className="ml-2">
                    • {row.outcomes.transactions.filter(t => {
                      const today = new Date();
                      const transDate = new Date(`${t.transaction_day}T00:00:00`);
                      today.setHours(0, 0, 0, 0);
                      transDate.setHours(0, 0, 0, 0);
                      return t.is_paid !== undefined ? t.is_paid : transDate <= today;
                    }).length} pagas
                  </span>
                )}
              </div>
              
              {/* Add Outcome Button */}
              <button
                className="absolute top-1 right-1 p-1 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 rounded-full opacity-0 group-hover/outcome:opacity-100 transition-all duration-200 transform hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenModal({
                    isOpen: true,
                    transaction: {
                      category_id: '',
                      description: '',
                      price: '',
                      category: { id: 0, name: '', color: '', icon: '', iconName: '', icon_name: '', type: 'outcome' },
                      transaction_day: row.date,
                      type: 'outcome'
                    } as any,
                    type: 'create',
                  });
                }}
                title="Adicionar despesa"
              >
                <Plus
                  size={12}
                  className="text-red-700 dark:text-red-300"
                />
              </button>
            </div>

            {/* Balance */}
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3
                  size={14}
                  className="text-zinc-600 dark:text-zinc-400"
                />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                  Saldo
                </span>
              </div>
              <p
                className={`font-bold text-sm flex items-center ${balanceColor} mb-1`}
              >
                {balanceIcon}
                {row.total.valueFormatted}
              </p>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Total: {((row.incomes?.transactions?.length || 0) + (row.outcomes?.transactions?.length || 0))} transações
              </div>
            </div>
          </div>

          {/* Progress bar for visual balance */}
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Receitas vs Despesas</span>
              <span>{Math.abs(totalValue) > 0 ? (isPositive ? '+' : '') + totalValue.toFixed(2) : '0.00'}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  totalValue === 0 
                    ? 'bg-zinc-400 dark:bg-zinc-500' 
                    : isPositive 
                      ? 'bg-gradient-to-r from-green-400 to-green-600' 
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: totalValue === 0 ? '100%' : `${Math.min(Math.abs(totalValue) / 1000 * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      );
    });
  }, [
    limitedRows,
    setOpenModal,
    handleCreateTransaction,
    currentMonth,
    setCurrentMonth,
    from,
  ]);

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

      {openModal.isOpen && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-800 w-96 rounded-xl shadow-2xl p-6 relative border border-zinc-200 dark:border-zinc-700">
            {openModal.type === "edit" ? (
              <ModalEdit
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleUpdateTransaction={handleUpdateTransaction}
                handleUpdateInstallmentTransaction={handleUpdateInstallmentTransaction}
                handleUpdateRecurringTransaction={handleUpdateRecurringTransaction}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
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
                setCurrentMonth={setCurrentMonth}
                from={from}
              />
            ) : (
              <ModalCreate
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleCreateRecurringTransaction={
                  handleCreateRecurringTransaction
                }
                handleCreateInstallmentTransaction={
                  handleCreateInstallmentTransaction
                }
                handleCreateCompleteTransaction={
                  handleCreateCompleteTransaction
                }
                creditCards={creditCards}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
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

export default TablePreview;
