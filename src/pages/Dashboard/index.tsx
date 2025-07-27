import {
  ChevronRight,
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  BarChart3,
  ArrowRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

import TablePreview from "../../components/TablePreview";
import EmptyChartState from "../../components/EmptyChartState";
import FloatingButton from "../../components/FloatingButton.tsx";
import CreditCardBills from "../../components/CreditCardBills";

import "./styles.css";
import MenuAside from "../../components/MenuAside.tsx";
import "react-loading-skeleton/dist/skeleton.css";
import useDashboard from "../../hooks/useDashboard.ts";
import useTransactions from "../../hooks/useTransactions.ts";
import CountUp from "../../components/CountUp.tsx";
import useCategories from "../../hooks/useCategories.ts";
import { useState } from "react";
import { ITransaction } from "../../types/transactions.ts";
import TableTransactions from "../../components/TableTransactions";
import { Filter } from "../../components/Filter";
import ModernDonutChart from "../../components/ModernDonutChart.tsx";
import CategoryIcon from "../../components/CategoryIcon/index.tsx";

export default function Dashboard() {
  const [openModal, setOpenModal] = useState({
    isOpen: false,
    transaction: {} as ITransaction,
    type: "",
  });

  const { chartCategories, handleGetChartCategories, categories } =
    useCategories();

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
    handleDeleteMultipleTransactions,
  } = useTransactions(handleGetChartCategories);
  const { getGreeting, currentMonth, setCurrentMonth } = useDashboard(
    rows,
    handleGetChartCategories,
    handleGetOverviewTransactions,
    handleGetBalance,
    handleGetPreviewTransactions,
    handleGetRecentTransactions,
  );

  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    "desc",
  );
  const [filter, setFilter] = useState<"before" | "after" | "both">("both");
  const [typeFilter, setTypeFilter] = useState<"income" | "outcome" | "all">(
    "all",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (field: string, order: "asc" | "desc") => {
    setSortBy(field);
    setSortOrder(order);
    handleGetRecentTransactions(filter, field, order, typeFilter);
  };

  const handleFilterChange = (
    newFilter: "before" | "after" | "both",
    newType: "income" | "outcome" | "all",
  ) => {
    setFilter(newFilter);
    setTypeFilter(newType);
    setSortBy("updated_at");
    setSortOrder("desc");
    handleGetRecentTransactions(newFilter, "updated_at", "desc", newType);
  };

  return (
    <div className="font-sans">
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
        {/* <Header title="Dashboard" activePage="dashboard" /> */}

        <div className="flex h-full">
          <MenuAside activePage="dashboard" />

          <main className="flex-1 mt-4 pl-0 xl-lg:pl-64 max-w-7xl mx-auto p-8">
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
                    <CountUp valueNumber={balance} />
                  </div>
                </div>
              </div>
            </div>

            {/* Credit Card Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mb-8">
              <div>
                <div className="relative group max-w-md">
                  {/* Second Card (Background) */}
                  <div
                    className="absolute cursor-pointer transition-all duration-300 top-2.5 -right-5 w-[350px] h-[220px] rounded-2xl bg-gradient-to-br from-zinc-500/30 via-zinc-600/30 to-zinc-700/30 rotate-[5deg] z-[1] opacity-40 backdrop-blur-[10px] border border-white/20"
                    onMouseEnter={(e) => {
                      const container = e.currentTarget.parentElement;
                      const button = container?.querySelector(
                        ".add-card-button",
                      ) as HTMLElement;

                      e.currentTarget.style.opacity = "0.8";
                      e.currentTarget.style.transform =
                        "rotate(3deg) translateX(-5px)";

                      if (button) {
                        button.style.background =
                          "linear-gradient(135deg, #4CAF50, #388E3C)";
                        button.style.boxShadow =
                          "0 12px 40px rgba(76, 175, 80, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const container = e.currentTarget.parentElement;
                      const button = container?.querySelector(
                        ".add-card-button",
                      ) as HTMLElement;

                      e.currentTarget.style.opacity = "0.4";
                      e.currentTarget.style.transform =
                        "rotate(5deg) translateX(0px)";

                      if (button) {
                        button.style.background =
                          "linear-gradient(135deg, #616161, #424242)";
                        button.style.boxShadow =
                          "0 8px 32px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                  />

                  {/* Main Card */}
                  <div className="relative overflow-hidden w-full max-w-sm h-60 rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-teal-400 text-white p-8 z-[2] shadow-2xl">
                    {/* Decorative background orb */}
                    <div className="absolute -top-12 -right-12 w-50 h-50 rounded-full bg-gradient-to-br from-amber-400/30 to-teal-600/20 blur-[60px]" />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-sm opacity-80 mb-1">
                            Cartão Principal
                          </p>
                          <p className="text-lg font-medium tracking-wider">
                            •••• •••• •••• 4532
                          </p>
                        </div>
                        <CreditCard className="w-8 h-8 opacity-80" />
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm opacity-80">Saldo Disponível</p>
                          <p className="text-2xl font-bold">
                            <CountUp valueNumber={balance} />
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm opacity-80">Vencimento</p>
                          <p className="text-lg font-medium">12/28</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Card Button */}
                  <button
                    className="add-card-button absolute top-1/2 -right-2.5 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800 text-white border-0 cursor-pointer z-[3] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                    onMouseEnter={(e) => {
                      const container = e.currentTarget.parentElement;
                      const card = container?.querySelector(
                        ".absolute.cursor-pointer",
                      ) as HTMLElement;

                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #4CAF50, #388E3C)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 40px rgba(76, 175, 80, 0.3)";

                      if (card) {
                        card.style.opacity = "0.8";
                        card.style.transform = "rotate(3deg) translateX(-5px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const container = e.currentTarget.parentElement;
                      const card = container?.querySelector(
                        ".absolute.cursor-pointer",
                      ) as HTMLElement;

                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #616161, #424242)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 32px rgba(0, 0, 0, 0.1)";

                      if (card) {
                        card.style.opacity = "0.4";
                        card.style.transform = "rotate(5deg) translateX(0px)";
                      }
                    }}
                    onClick={() => {
                      // Aqui você pode adicionar a lógica para criar um novo cartão
                      console.log("Adicionar novo cartão");
                    }}
                  >
                    <Plus size={24} />
                  </button>
                </div>
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
                      <CountUp valueNumber={overview?.income?.total} />
                    </p>
                    {overview?.income?.percentage !== undefined && (
                      <div className="flex items-center gap-1">
                        {(() => {
                          const percentage = Number(overview.income.percentage)
                          if (isNaN(percentage)) return null
                          
                          return percentage >= 0 ? (
                            <>
                              <ChevronUp className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-500">
                                +{percentage.toFixed(1)}%
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
                      <CountUp valueNumber={overview?.outcome?.total} />
                    </p>
                    {overview?.outcome?.percentage !== undefined && (
                      <div className="flex items-center gap-1">
                        {(() => {
                          const percentage = Number(overview.outcome.percentage)
                          if (isNaN(percentage)) return null
                          
                          return percentage <= 0 ? (
                            <>
                              <ChevronDown className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-green-500">
                                {percentage.toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <ChevronUp className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-500">
                                +{percentage.toFixed(1)}%
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

            {/* Enhanced Transactions Preview */}
            <div className="hidden bg-white dark:bg-zinc-800 rounded-xl p-6 mb-6 shadow-2xl border border-white border-opacity-20 dark:border-zinc-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200">
                  Transações Recentes
                </h2>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-300">
                    5 transações hoje
                  </div>
                  <Link
                    to="/transacoes"
                    className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline transition-all"
                  >
                    Ver todas
                  </Link>
                </div>
              </div>

              {/* Modern Transaction Cards */}
              <div className="space-y-3 mb-6">
                {/* Transaction 1 - Income */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 transition-all duration-200 hover:shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-600 hover:border-teal-500 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg bg-gradient-to-br from-green-500 to-green-700">
                      💰
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
                        Salário Janeiro
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300">
                          Receita
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          26 Jan, 09:15
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-500 dark:text-green-400">
                      +R$ 5.500,00
                    </div>
                    <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                      Conta Corrente
                    </div>
                  </div>
                </div>

                {/* Transaction 2 - Expense */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 transition-all duration-200 hover:shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-600 hover:border-teal-500 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg bg-gradient-to-br from-orange-500 to-red-600">
                      🍽️
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
                        Almoço Restaurante
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-300">
                          Alimentação
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          25 Jan, 13:45
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-500 dark:text-red-400">
                      -R$ 45,90
                    </div>
                    <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                      Cartão Débito
                    </div>
                  </div>
                </div>

                {/* Transaction 3 - Transfer */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 transition-all duration-200 hover:shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-600 hover:border-teal-500 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg bg-gradient-to-br from-blue-500 to-blue-700">
                      🚗
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
                        Combustível Posto Shell
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                          Transporte
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          24 Jan, 18:30
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-500 dark:text-red-400">
                      -R$ 120,00
                    </div>
                    <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                      Cartão Crédito
                    </div>
                  </div>
                </div>

                {/* Transaction 4 - Recurring */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-700 transition-all duration-200 hover:shadow-md hover:bg-zinc-100 dark:hover:bg-zinc-600 hover:border-teal-500 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg relative bg-gradient-to-br from-purple-500 to-purple-700">
                      🎮
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs bg-orange-500 text-white">
                        ↻
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
                        Netflix Assinatura
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                          Lazer
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300">
                          Recorrente
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          23 Jan, 10:00
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-red-500 dark:text-red-400">
                      -R$ 39,90
                    </div>
                    <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
                      Débito Automático
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-700">
                <div className="text-center">
                  <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                    Hoje
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    +R$ 5.294,20
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                    Esta Semana
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    +R$ 4.850,40
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium mb-1 text-zinc-500 dark:text-zinc-400">
                    Este Mês
                  </div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    +R$ 3.245,80
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid: TablePreview + Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 mb-8">
              {/* Left Column: TablePreview Vertical */}
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl transition-colors flex flex-col">
                <div className="flex items-center justify-between mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                      <BarChart3
                        size={20}
                        className="text-teal-600 dark:text-teal-400"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-700 dark:text-zinc-100">
                        Visão Financeira
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Acompanhe suas transações diárias
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
                    handleDeleteTransaction={handleDeleteTransaction}
                    handleUpdateTransaction={handleUpdateTransaction}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    categories={categories}
                    from="dashboard"
                    maxDays={3}
                    showViewAllButton={true}
                    variant="vertical"
                  />
                </div>
              </div>

              {/* Right Column: Categories */}
              <div className="space-y-6 h-full flex flex-col">
                {/* Outcome Categories - Now on Top */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl flex-1 transition-colors">
                  <h3 className="text-base font-medium mb-4 text-zinc-700 dark:text-zinc-200">
                    Maiores Despesas
                  </h3>
                  {chartCategories.notIncome.config.length === 0 ? (
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
                        {chartCategories.notIncome.config
                          .slice(0, 5)
                          .map((item, index) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-start py-3 ${index !== chartCategories.notIncome.config.slice(0, 5).length - 1 ? "border-b border-zinc-100 dark:border-zinc-700" : ""}`}
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
                          <ModernDonutChart />
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

                {/* Income Categories - Now on Bottom */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-2xl flex-1 transition-colors">
                  <h3 className="text-base font-medium mb-4 text-zinc-700 dark:text-zinc-200">
                    Maiores Receitas
                  </h3>
                  {chartCategories.income.config.length === 0 ? (
                    <EmptyChartState
                      type="receitas"
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
                        {chartCategories.income.config
                          .slice(0, 5)
                          .map((item, index) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-start py-3 ${index !== chartCategories.income.config.slice(0, 5).length - 1 ? "border-b border-zinc-100 dark:border-zinc-700" : ""}`}
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
                          <ModernDonutChart />
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
              </div>
            </div>

            {/* Credit Card Bills */}
            {/* <div className="mb-8">
              <CreditCardBills />
            </div> */}

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 mt-8 shadow-2xl transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h3 className="text-lg font-medium mb-4 sm:mb-0 text-zinc-700 dark:text-zinc-200">
                  Transações Recentes
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600 dark:text-zinc-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Buscar transação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-400 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 w-64"
                    />
                  </div>
                  <Filter
                    currentFilter={filter}
                    currentType={typeFilter}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-auto">
                <TableTransactions
                  recentTransactions={recentTransactions}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  openModal={openModal}
                  setOpenModal={setOpenModal}
                  handleUpdateTransaction={handleUpdateTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                  handleDeleteMultipleTransactions={
                    handleDeleteMultipleTransactions
                  }
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  categories={categories}
                  from="dashboard"
                  searchTerm={searchTerm}
                />
              </div>

              <div className="flex justify-center mt-6">
                <Link
                  to={{ pathname: "/transacoes" }}
                  className="flex items-center px-6 py-2 rounded-lg border border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 transition-all text-sm font-medium hover:bg-teal-600 hover:text-white dark:hover:bg-teal-400 dark:hover:text-zinc-900"
                >
                  Ver completo
                  <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>

      <FloatingButton setOpenModal={setOpenModal} />
    </div>
  );
}
