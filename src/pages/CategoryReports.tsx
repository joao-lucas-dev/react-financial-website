import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    DollarSign,
    LineChart,
    MessageCircleQuestion,
    PieChart,
    Target,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AnimatedLineChart from '../components/AnimatedLineChart';
import CategoryIcon from '../components/CategoryIcon';
import MenuAside from '../components/MenuAside';
import ModernDonutChart from '../components/ModernDonutChart';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useCategories from '../hooks/useCategories';

interface Transaction {
    id: number;
    description: string;
    price: number;
    transaction_day: string;
    created_at: string;
    updated_at: string;
}

interface Category {
    id: number;
    name: string;
    icon_name: string;
    color: string;
    type: string;
    total: number;
    transactions: Transaction[];
}

interface CategorySummaryResponse {
    incomes: Category[];
    outcomes: Category[];
}

interface MonthlyData {
    month: string;
    income: number;
    outcome: number;
    balance: number;
}

interface GrowthData {
    current: number;
    previous: number;
    growth: number;
    isPositive: boolean;
}

const REPORT_TYPES = [
    { label: 'Categorias', value: 'categories', icon: PieChart },
    { label: 'Entradas x Saídas', value: 'comparison', icon: LineChart },
    { label: 'Crescimento', value: 'growth', icon: TrendingUp },
];

const PERIOD_OPTIONS = [
    { label: '3 meses', value: 3 },
    { label: '6 meses', value: 6 },
    { label: '9 meses', value: 9 },
    { label: '12 meses', value: 12 },
];

// Mock data generator for visualization
const generateMockData = (months: number) => {
    const data = [];
    const now = DateTime.now();
    
    for (let i = months - 1; i >= 0; i--) {
        const monthDate = now.minus({ months: i });
        const monthName = monthDate.toFormat('MMM/yy', { locale: 'pt-BR' });
        
        // Generate realistic looking data with some trends
        const baseIncome = 5000 + Math.random() * 3000; // 5k-8k base
        const baseOutcome = 3000 + Math.random() * 2500; // 3k-5.5k base
        
        // Add some seasonal variation
        const seasonalMultiplier = 1 + 0.2 * Math.sin((monthDate.month / 12) * Math.PI * 2);
        
        const income = Math.round(baseIncome * seasonalMultiplier);
        const outcome = Math.round(baseOutcome * seasonalMultiplier);
        
        data.push({
            month: monthName,
            income,
            outcome,
            balance: income - outcome
        });
    }
    
    return data;
};

const CategoryReports: React.FC = () => {
    const axiosPrivate = useAxiosPrivate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const initialDate = params.get('date') || DateTime.now().toFormat('yyyy-MM');
    
    // Estados principais
    const [reportType, setReportType] = useState<'categories' | 'comparison' | 'growth'>('categories');
    const [categoryTab, setCategoryTab] = useState<'incomes' | 'outcomes'>('incomes');
    const [selectedPeriod, setSelectedPeriod] = useState(6); // 6 meses por padrão
    const [useMockData, setUseMockData] = useState(true); // Para usar dados mockados
    const [data, setData] = useState<CategorySummaryResponse | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [growthData, setGrowthData] = useState<{income: GrowthData, outcome: GrowthData} | null>(null);
    const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(initialDate);
    const { chartCategories, handleGetChartCategories } = useCategories();

    // Funções para buscar dados
    const fetchMonthlyComparison = async () => {
        try {
            if (useMockData) {
                // Usar dados mockados para visualização
                const mockData = generateMockData(selectedPeriod);
                setMonthlyData(mockData);
                return;
            }

            const currentDate = DateTime.fromFormat(date, 'yyyy-MM');
            const months = [];
            
            // Buscar dados dos últimos N meses baseado no período selecionado
            for (let i = selectedPeriod - 1; i >= 0; i--) {
                const monthDate = currentDate.minus({ months: i });
                const startDate = monthDate.startOf('month').toISO();
                const endDate = monthDate.endOf('month').toISO();
                
                const res = await axiosPrivate.get(`/transactions/category-summary?startDate=${startDate}&endDate=${endDate}`);
                const monthData = res.data;
                
                const totalIncome = monthData.incomes?.reduce((acc: number, cat: Category) => acc + cat.total, 0) || 0;
                const totalOutcome = monthData.outcomes?.reduce((acc: number, cat: Category) => acc + cat.total, 0) || 0;
                
                months.push({
                    month: monthDate.toFormat('MMM/yy'),
                    income: totalIncome,
                    outcome: totalOutcome,
                    balance: totalIncome - totalOutcome
                });
            }
            
            setMonthlyData(months);
        } catch (error) {
            console.error('Error fetching monthly comparison:', error);
            // Fallback para dados mockados em caso de erro
            const mockData = generateMockData(selectedPeriod);
            setMonthlyData(mockData);
        }
    };

    const fetchGrowthData = async () => {
        try {
            const currentDate = DateTime.fromFormat(date, 'yyyy-MM');
            const previousDate = currentDate.minus({ months: 1 });
            
            // Dados do mês atual
            const currentStartDate = currentDate.startOf('month').toISO();
            const currentEndDate = currentDate.endOf('month').toISO();
            const currentRes = await axiosPrivate.get(`/transactions/category-summary?startDate=${currentStartDate}&endDate=${currentEndDate}`);
            
            // Dados do mês anterior
            const previousStartDate = previousDate.startOf('month').toISO();
            const previousEndDate = previousDate.endOf('month').toISO();
            const previousRes = await axiosPrivate.get(`/transactions/category-summary?startDate=${previousStartDate}&endDate=${previousEndDate}`);
            
            const currentIncome = currentRes.data.incomes?.reduce((acc: number, cat: Category) => acc + cat.total, 0) || 0;
            const currentOutcome = currentRes.data.outcomes?.reduce((acc: number, cat: Category) => acc + cat.total, 0) || 0;
            const previousIncome = previousRes.data.incomes?.reduce((acc: number, cat: Category) => acc + cat.total, 0) || 0;
            const previousOutcome = previousRes.data.outcomes?.reduce((acc: number, cat: Category) => acc + cat.total, 0) || 0;
            
            const incomeGrowth = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
            const outcomeGrowth = previousOutcome > 0 ? ((currentOutcome - previousOutcome) / previousOutcome) * 100 : 0;
            
            setGrowthData({
                income: {
                    current: currentIncome,
                    previous: previousIncome,
                    growth: incomeGrowth,
                    isPositive: incomeGrowth >= 0
                },
                outcome: {
                    current: currentOutcome,
                    previous: previousOutcome,
                    growth: outcomeGrowth,
                    isPositive: outcomeGrowth < 0 // Para despesas, crescimento negativo é positivo
                }
            });
        } catch (error) {
            console.error('Error fetching growth data:', error);
            setGrowthData(null);
        }
    };

    // Buscar dados baseado no tipo de relatório
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (reportType === 'categories') {
                    // Dados para categorias
                    const startDate = DateTime.fromFormat(date, 'yyyy-MM').startOf('month').toISO();
                    const endDate = DateTime.fromFormat(date, 'yyyy-MM').endOf('month').toISO();
                    const res = await axiosPrivate.get(`/transactions/category-summary?startDate=${startDate}&endDate=${endDate}`);
                    setData(res.data);
                    
                    // Dados do gráfico
                    const luxonDate = DateTime.fromFormat(date, 'yyyy-MM').setZone('utc', { keepLocalTime: true }) as import("luxon").DateTime;
                    await handleGetChartCategories(luxonDate, false);
                } else if (reportType === 'comparison') {
                    await fetchMonthlyComparison();
                } else if (reportType === 'growth') {
                    await fetchGrowthData();
                }
            } catch (e) {
                console.error('Error fetching data:', e);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [date, reportType, selectedPeriod, axiosPrivate, handleGetChartCategories]);

    const categories = data ? data[categoryTab] : [];

    return (
        <div className="font-sans">
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .slide-in {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
            <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
                <div className="flex min-h-screen">
                    <MenuAside activePage="relatorios" />
                    
                    <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
                        {/* Header Section */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-zinc-700 dark:text-zinc-200 mb-2 leading-tight">
                                Relatórios Financeiros
                            </h1>
                            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                                Análises completas das suas finanças
                            </p>
                        </div>

                        {/* Report Type Selection */}
                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors mb-8">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                {/* Report Type Tabs */}
                                <div className="flex flex-wrap gap-2">
                                    {REPORT_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.value}
                                                onClick={() => setReportType(type.value as any)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                                                    reportType === type.value
                                                        ? 'bg-teal-600 text-white shadow-lg scale-105'
                                                        : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600'
                                                }`}
                                            >
                                                <Icon size={18} />
                                                {type.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Date Selector */}
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-zinc-600 dark:text-zinc-400" />
                                    <input
                                        type="month"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="border border-zinc-200 dark:border-zinc-600 rounded-lg px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-12 shadow-2xl transition-colors mb-8">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-zinc-200 dark:border-zinc-600 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-zinc-600 dark:text-zinc-400">Carregando dados...</p>
                                </div>
                            </div>
                        )}

                        {/* Content based on report type */}
                        {!loading && (
                            <div className="slide-in">
                                {reportType === 'categories' && (
                                    <div>
                                        {/* Category Type Selection */}
                                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors mb-8">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setCategoryTab('incomes')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                                        categoryTab === 'incomes'
                                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-green-50 dark:hover:bg-green-900/10'
                                                    }`}
                                                >
                                                    <TrendingUp size={18} />
                                                    Receitas
                                                </button>
                                                <button
                                                    onClick={() => setCategoryTab('outcomes')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                                        categoryTab === 'outcomes'
                                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                            : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10'
                                                    }`}
                                                >
                                                    <TrendingDown size={18} />
                                                    Despesas
                                                </button>
                                            </div>
                                        </div>

                                        {/* Main Content - Chart and Categories */}
                                        {(() => {
                                            const chartData = categoryTab === 'incomes' ? chartCategories.income.chartConfig : chartCategories.notIncome.chartConfig;
                                            const hasData = chartData.labels && chartData.labels.length > 0 && chartData.datasets[0].data.some((v: number) => v > 0);
                                            
                                            if (!hasData) {
                                                return (
                                                    <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors mb-8">
                                                        <div className="min-h-96 flex items-center justify-center">
                                                            <div className="text-center max-w-md">
                                                                {/* Empty State Illustration */}
                                                                <div className="relative mb-6">
                                                                    <div className="w-32 h-32 mx-auto rounded-full border-8 border-dashed border-zinc-200 dark:border-zinc-600 flex items-center justify-center">
                                                                        {categoryTab === 'incomes' ? (
                                                                            <TrendingUp size={48} className="text-zinc-300 dark:text-zinc-600" />
                                                                        ) : (
                                                                            <TrendingDown size={48} className="text-zinc-300 dark:text-zinc-600" />
                                                                        )}
                                                                    </div>
                                                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                                                                        <MessageCircleQuestion size={16} className="text-zinc-400" />
                                                                    </div>
                                                                </div>
                                                                
                                                                <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                                                                    {categoryTab === 'incomes' ? 'Nenhuma receita encontrada' : 'Nenhuma despesa encontrada'}
                                                                </h3>
                                                                
                                                                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                                                                    Não há {categoryTab === 'incomes' ? 'receitas' : 'despesas'} registradas para o período selecionado.
                                                                </p>
                                                                
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                                                                        <Calendar size={16} />
                                                                        <span>Período: {DateTime.fromFormat(date, 'yyyy-MM').toFormat('MMMM yyyy', { locale: 'pt-BR' })}</span>
                                                                    </div>
                                                                    
                                                                    <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                                                                        <h4 className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Sugestões:</h4>
                                                                        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                                                                            <li>• Selecione um período diferente</li>
                                                                            <li>• Verifique se há transações cadastradas</li>
                                                                            <li>• {categoryTab === 'incomes' ? 'Adicione suas receitas' : 'Registre suas despesas'}</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors mb-8">
                                                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                                                        {/* Categories List - Left Side */}
                                                        <div className="space-y-4">
                                                            {categories.length === 0 ? (
                                                                <div className="p-8">
                                                                    <div className="text-center">
                                                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                                                            {categoryTab === 'incomes' ? (
                                                                                <TrendingUp size={24} className="text-zinc-400" />
                                                                            ) : (
                                                                                <TrendingDown size={24} className="text-zinc-400" />
                                                                            )}
                                                                        </div>
                                                                        <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                                                            Nenhuma categoria encontrada
                                                                        </h3>
                                                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                                                            Não há categorias de {categoryTab === 'incomes' ? 'receitas' : 'despesas'} para este período.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                categories.map((cat) => (
                                                                    <div key={cat.id} className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl shadow-lg transition-all overflow-hidden">
                                                                        <button
                                                                            onClick={() => setExpanded((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                                                                            className="w-full flex items-center justify-between p-4 hover:bg-zinc-100 dark:hover:bg-zinc-600/50 transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <CategoryIcon 
                                                                                    category={{
                                                                                        iconName: cat.icon_name,
                                                                                        color: cat.color,
                                                                                        icon_name: cat.icon_name,
                                                                                        id: cat.id,
                                                                                        name: cat.name,
                                                                                        type: cat.type,
                                                                                    }} 
                                                                                    size="medium" 
                                                                                />
                                                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className={`font-bold text-base ${
                                                                                    categoryTab === 'incomes' 
                                                                                        ? 'text-green-600 dark:text-green-400' 
                                                                                        : 'text-red-600 dark:text-red-400'
                                                                                }`}>
                                                                                    {categoryTab === 'incomes' ? '+' : '-'}
                                                                                    {cat.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                                </span>
                                                                                <ChevronRight 
                                                                                    size={18} 
                                                                                    className={`transition-transform duration-200 ${
                                                                                        expanded[cat.id] ? 'rotate-90' : ''
                                                                                    }`} 
                                                                                />
                                                                            </div>
                                                                        </button>
                                                                        {expanded[cat.id] && (
                                                                            <div className="border-t border-zinc-200 dark:border-zinc-600 p-4">
                                                                                {cat.transactions.length === 0 ? (
                                                                                    <p className="text-center text-zinc-500 italic text-sm">Nenhuma transação nesta categoria</p>
                                                                                ) : (
                                                                                    <div className="space-y-2">
                                                                                        {cat.transactions
                                                                                            .sort((a, b) => new Date(b.transaction_day).getTime() - new Date(a.transaction_day).getTime())
                                                                                            .map((tx) => (
                                                                                                <div key={tx.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-600/50 rounded-lg">
                                                                                                    <div>
                                                                                                        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">{tx.description}</p>
                                                                                                        <p className="text-xs text-zinc-500">{new Date(tx.transaction_day).toLocaleDateString('pt-BR')}</p>
                                                                                                    </div>
                                                                                                    <span className={`font-semibold text-sm ${
                                                                                                        categoryTab === 'incomes' 
                                                                                                            ? 'text-green-600 dark:text-green-400' 
                                                                                                            : 'text-red-600 dark:text-red-400'
                                                                                                    }`}>
                                                                                                        {categoryTab === 'incomes' ? '+' : '-'}
                                                                                                        {tx.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                                                    </span>
                                                                                                </div>
                                                                                            ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>

                                                        {/* Chart - Right Side */}
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-full flex justify-center">
                                                                <ModernDonutChart categories={chartData} size={320} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Total */}
                                        {categories.length > 0 && (
                                            <div className="bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-6 mt-8">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                                                            Total {categoryTab === 'incomes' ? 'de Receitas' : 'de Despesas'}
                                                        </h3>
                                                        <p className="text-zinc-600 dark:text-zinc-400">Soma de todas as categorias do período</p>
                                                    </div>
                                                    <div className={`text-3xl font-bold ${
                                                        categoryTab === 'incomes' 
                                                            ? 'text-green-600 dark:text-green-400' 
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {categoryTab === 'incomes' ? '+' : '-'}
                                                        {categories.reduce((acc, cat) => acc + (cat.total || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {reportType === 'comparison' && (
                                    <div>
                                        {/* Period Selection and Controls */}
                                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors mb-8">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                        <LineChart size={24} />
                                                        Evolução Temporal - Entradas x Saídas
                                                    </h3>
                                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                                                        Acompanhe a evolução das suas receitas e despesas ao longo do tempo
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center gap-4">
                                                    {/* Period Selector */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Período:</span>
                                                        <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                                                            {PERIOD_OPTIONS.map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => setSelectedPeriod(option.value)}
                                                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                                                                        selectedPeriod === option.value
                                                                            ? 'bg-teal-600 text-white shadow-sm'
                                                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                                                                    }`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Mock Data Toggle */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mock:</span>
                                                        <button
                                                            onClick={() => setUseMockData(!useMockData)}
                                                            className={`w-12 h-6 rounded-full transition-all duration-200 ${
                                                                useMockData 
                                                                    ? 'bg-teal-600' 
                                                                    : 'bg-zinc-300 dark:bg-zinc-600'
                                                            }`}
                                                        >
                                                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                                                                useMockData ? 'translate-x-6' : 'translate-x-0.5'
                                                            }`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Animated Line Chart */}
                                        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-2xl transition-colors mb-8">
                                            {monthlyData.length > 0 ? (
                                                <div className="w-full overflow-x-auto">
                                                    <AnimatedLineChart 
                                                        data={monthlyData}
                                                        width={Math.max(800, monthlyData.length * 80)}
                                                        height={450}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <MessageCircleQuestion size={48} className="mx-auto mb-4 text-zinc-400" />
                                                    <p className="text-lg font-medium text-zinc-500 mb-2">Nenhum dado disponível</p>
                                                    <p className="text-sm text-zinc-400">Ative os dados mockados para visualizar o gráfico</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Summary Statistics */}
                                        {monthlyData.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {/* Average Income */}
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                            <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <h4 className="font-semibold text-green-800 dark:text-green-300">Receita Média</h4>
                                                    </div>
                                                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                        {(monthlyData.reduce((acc, m) => acc + m.income, 0) / monthlyData.length).toLocaleString('pt-BR', { 
                                                            style: 'currency', 
                                                            currency: 'BRL' 
                                                        })}
                                                    </p>
                                                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                                        nos últimos {selectedPeriod} meses
                                                    </p>
                                                </div>

                                                {/* Average Expenses */}
                                                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                                            <TrendingDown size={20} className="text-red-600 dark:text-red-400" />
                                                        </div>
                                                        <h4 className="font-semibold text-red-800 dark:text-red-300">Despesa Média</h4>
                                                    </div>
                                                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                                                        {(monthlyData.reduce((acc, m) => acc + m.outcome, 0) / monthlyData.length).toLocaleString('pt-BR', { 
                                                            style: 'currency', 
                                                            currency: 'BRL' 
                                                        })}
                                                    </p>
                                                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                                                        nos últimos {selectedPeriod} meses
                                                    </p>
                                                </div>

                                                {/* Average Balance */}
                                                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-6">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                                                            <Activity size={20} className="text-teal-600 dark:text-teal-400" />
                                                        </div>
                                                        <h4 className="font-semibold text-teal-800 dark:text-teal-300">Saldo Médio</h4>
                                                    </div>
                                                    <p className={`text-2xl font-bold ${
                                                        (monthlyData.reduce((acc, m) => acc + m.balance, 0) / monthlyData.length) >= 0
                                                            ? 'text-green-700 dark:text-green-400'
                                                            : 'text-red-700 dark:text-red-400'
                                                    }`}>
                                                        {(monthlyData.reduce((acc, m) => acc + m.balance, 0) / monthlyData.length).toLocaleString('pt-BR', { 
                                                            style: 'currency', 
                                                            currency: 'BRL' 
                                                        })}
                                                    </p>
                                                    <p className="text-sm text-teal-600 dark:text-teal-500 mt-1">
                                                        nos últimos {selectedPeriod} meses
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {reportType === 'growth' && (
                                    <div>
                                        {/* Growth Analysis */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            {/* Income Growth */}
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                        <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Crescimento das Receitas</h3>
                                                </div>
                                                {growthData?.income ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="text-center p-3 bg-white/50 dark:bg-green-900/30 rounded-lg">
                                                                <p className="text-sm text-green-700 dark:text-green-400 mb-1">Mês Atual</p>
                                                                <p className="text-lg font-bold text-green-800 dark:text-green-300">
                                                                    {growthData.income.current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </p>
                                                            </div>
                                                            <div className="text-center p-3 bg-white/50 dark:bg-green-900/30 rounded-lg">
                                                                <p className="text-sm text-green-700 dark:text-green-400 mb-1">Mês Anterior</p>
                                                                <p className="text-lg font-bold text-green-800 dark:text-green-300">
                                                                    {growthData.income.previous.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-center p-4 bg-white/70 dark:bg-green-900/40 rounded-lg">
                                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                                {growthData.income.isPositive ? (
                                                                    <ArrowUpRight className="text-green-600 dark:text-green-400" size={20} />
                                                                ) : (
                                                                    <ArrowDownRight className="text-red-600 dark:text-red-400" size={20} />
                                                                )}
                                                                <span className={`text-2xl font-bold ${
                                                                    growthData.income.isPositive 
                                                                        ? 'text-green-600 dark:text-green-400' 
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }`}>
                                                                    {Math.abs(growthData.income.growth).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                                {growthData.income.isPositive ? 'Crescimento' : 'Redução'} em relação ao mês anterior
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <p className="text-green-700 dark:text-green-400">Dados insuficientes para análise</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Expense Growth */}
                                            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                                                        <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Variação das Despesas</h3>
                                                </div>
                                                {growthData?.outcome ? (
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="text-center p-3 bg-white/50 dark:bg-red-900/30 rounded-lg">
                                                                <p className="text-sm text-red-700 dark:text-red-400 mb-1">Mês Atual</p>
                                                                <p className="text-lg font-bold text-red-800 dark:text-red-300">
                                                                    {growthData.outcome.current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </p>
                                                            </div>
                                                            <div className="text-center p-3 bg-white/50 dark:bg-red-900/30 rounded-lg">
                                                                <p className="text-sm text-red-700 dark:text-red-400 mb-1">Mês Anterior</p>
                                                                <p className="text-lg font-bold text-red-800 dark:text-red-300">
                                                                    {growthData.outcome.previous.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-center p-4 bg-white/70 dark:bg-red-900/40 rounded-lg">
                                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                                {growthData.outcome.growth < 0 ? (
                                                                    <ArrowDownRight className="text-green-600 dark:text-green-400" size={20} />
                                                                ) : (
                                                                    <ArrowUpRight className="text-red-600 dark:text-red-400" size={20} />
                                                                )}
                                                                <span className={`text-2xl font-bold ${
                                                                    growthData.outcome.growth < 0 
                                                                        ? 'text-green-600 dark:text-green-400' 
                                                                        : 'text-red-600 dark:text-red-400'
                                                                }`}>
                                                                    {Math.abs(growthData.outcome.growth).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-red-700 dark:text-red-400">
                                                                {growthData.outcome.growth < 0 ? 'Redução' : 'Aumento'} em relação ao mês anterior
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <p className="text-red-700 dark:text-red-400">Dados insuficientes para análise</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Financial Health Summary */}
                                        {growthData && (
                                            <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-2xl p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                                                        <Activity size={24} className="text-teal-600 dark:text-teal-400" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-teal-800 dark:text-teal-300">Resumo da Saúde Financeira</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="text-center p-4 bg-white/70 dark:bg-teal-900/30 rounded-lg">
                                                        <Target className="mx-auto mb-2 text-teal-600 dark:text-teal-400" size={24} />
                                                        <p className="text-sm text-teal-700 dark:text-teal-400 mb-1">Saldo Atual</p>
                                                        <p className={`text-lg font-bold ${
                                                            (growthData.income.current - growthData.outcome.current) >= 0 
                                                                ? 'text-green-600 dark:text-green-400' 
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {(growthData.income.current - growthData.outcome.current).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-4 bg-white/70 dark:bg-teal-900/30 rounded-lg">
                                                        <DollarSign className="mx-auto mb-2 text-teal-600 dark:text-teal-400" size={24} />
                                                        <p className="text-sm text-teal-700 dark:text-teal-400 mb-1">Saldo Anterior</p>
                                                        <p className={`text-lg font-bold ${
                                                            (growthData.income.previous - growthData.outcome.previous) >= 0 
                                                                ? 'text-green-600 dark:text-green-400' 
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {(growthData.income.previous - growthData.outcome.previous).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </div>
                                                    <div className="text-center p-4 bg-white/70 dark:bg-teal-900/30 rounded-lg">
                                                        <Activity className="mx-auto mb-2 text-teal-600 dark:text-teal-400" size={24} />
                                                        <p className="text-sm text-teal-700 dark:text-teal-400 mb-1">Variação do Saldo</p>
                                                        <p className={`text-lg font-bold ${
                                                            ((growthData.income.current - growthData.outcome.current) - (growthData.income.previous - growthData.outcome.previous)) >= 0 
                                                                ? 'text-green-600 dark:text-green-400' 
                                                                : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                            {(((growthData.income.current - growthData.outcome.current) - (growthData.income.previous - growthData.outcome.previous))).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CategoryReports; 