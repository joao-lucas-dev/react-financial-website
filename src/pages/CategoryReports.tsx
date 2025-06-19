import React, { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import ChartComponent from '../components/ChartComponent';
import CategoryIcon from '../components/CategoryIcon';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { DateTime } from 'luxon';
import MenuAside from '../components/MenuAside';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';
import useCategories from '../hooks/useCategories';
import { MessageCircleQuestion } from 'lucide-react';

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

const TABS = [
    { label: 'Entradas', value: 'incomes' },
    { label: 'Saídas', value: 'outcomes' },
];

function formatChartData(categories: Category[]) {
    return {
        labels: categories.map((c) => c.name),
        datasets: [
            {
                data: categories.map((c) => c.total),
                backgroundColor: categories.map((c) => `var(--${c.color})`),
                hoverBackgroundColor: categories.map((c) => `var(--${c.color})`),
            },
        ],
    };
}

const CategoryReports: React.FC = () => {
    const axiosPrivate = useAxiosPrivate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const initialDate = params.get('date') || DateTime.now().toFormat('yyyy-MM');
    const [tab, setTab] = useState<'incomes' | 'outcomes'>('incomes');
    const [data, setData] = useState<CategorySummaryResponse | null>(null);
    const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState(initialDate);
    const { chartCategories, handleGetChartCategories } = useCategories();

    // Detect query param on mount (apenas para tab)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        if (type === 'incomes' || type === 'outcomes') {
            setTab(type);
        }
    }, [location.search]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const startDate = DateTime.fromFormat(date, 'yyyy-MM').startOf('month').toISO();
                const endDate = DateTime.fromFormat(date, 'yyyy-MM').endOf('month').toISO();
                const res = await axiosPrivate.get(`/transactions/category-summary?startDate=${startDate}&endDate=${endDate}`);
                setData(res.data);
            } catch (e) {
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [date, axiosPrivate]);

    // Buscar dados do gráfico ao mudar data ou aba
    useEffect(() => {
        const fetchChart = async () => {
            try {
                const luxonDate = DateTime.fromFormat(date, 'yyyy-MM').setZone('utc', { keepLocalTime: true }) as import("luxon").DateTime;
                await handleGetChartCategories(luxonDate, false);
            } catch (e) {
                console.log(e);
            }
        };
        fetchChart();
    }, [date, tab, handleGetChartCategories]);

    const categories = data ? data[tab] : [];

    return (
        <div>
            <div className="w-full h-full bg-background dark:bg-orangeDark">
                <Header title="Relatórios" activePage="relatorios" />

                <div className="flex h-full">
                    <MenuAside activePage="relatorios" />
                    
                    <div className="w-full min-h-screen bg-background dark:bg-orangeDark mt-24">
                        <div className="max-w-4xl mx-auto py-8 px-4">
                            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-grayWhite">Relatórios por Categoria</h1>
                            <div className="flex items-center justify-between mb-4">
                                <Tabs tabs={TABS} selected={tab} onChange={(v) => setTab(v as 'incomes' | 'outcomes')} />
                                <input
                                    type="month"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="ml-4 border rounded px-2 py-1 text-sm dark:bg-zinc-800 dark:text-grayWhite"
                                />
                            </div>
                            <div className="bg-white dark:bg-black-bg rounded-xl p-6 shadow mb-6">
                                {loading ? (
                                    <div className="text-center py-8">Carregando...</div>
                                ) : (
                                    (() => {
                                        const chartData = tab === 'incomes' ? chartCategories.income.chartConfig : chartCategories.notIncome.chartConfig;
                                        if (!chartData.labels || chartData.labels.length === 0 || !chartData.datasets[0].data.some((v: number) => v > 0)) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                                                    <MessageCircleQuestion size={48} className="mb-2" />
                                                    <span className="text-lg">Nenhum dado para exibir neste período.</span>
                                                </div>
                                            );
                                        }
                                        return <ChartComponent categories={chartData} />;
                                    })()
                                )}
                            </div>
                            <div className="space-y-4">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="bg-white dark:bg-black-bg rounded-lg shadow p-4">
                                        <button
                                            className="flex items-center w-full justify-between focus:outline-none"
                                            onClick={() => setExpanded((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                                        >
                                            <div className="flex items-center gap-3">
                                                <CategoryIcon category={{
                                                    iconName: cat.icon_name,
                                                    color: cat.color,
                                                    icon_name: cat.icon_name,
                                                    id: cat.id,
                                                    name: cat.name,
                                                    type: cat.type,
                                                }} size="large" />
                                                <span className="font-medium text-gray-800 dark:text-grayWhite">{cat.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={tab === 'incomes' ? 'text-green-600' : 'text-red-600'}>
                                                    {tab === 'incomes' ? '+' : '-'}
                                                    {cat.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </span>
                                                <svg className={`w-5 h-5 transition-transform ${expanded[cat.id] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </button>
                                        {expanded[cat.id] && (
                                            <div className="mt-4 border-t pt-4">
                                                {cat.transactions.length === 0 ? (
                                                    <div className="text-gray-500 text-sm">Nenhuma transação nesta categoria.</div>
                                                ) : (
                                                    <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                                                        {cat.transactions.map((tx) => (
                                                            <li key={tx.id} className="py-2 flex justify-between items-center">
                                                                <div>
                                                                    <div className="text-sm text-gray-800 dark:text-grayWhite">{tx.description}</div>
                                                                    <div className="text-xs text-gray-500">{DateTime.fromISO(tx.transaction_day).toFormat('dd/MM/yyyy')}</div>
                                                                </div>
                                                                <div className={tab === 'incomes' ? 'text-green-600' : 'text-red-600'}>
                                                                    {tab === 'incomes' ? '+' : '-'}
                                                                    {tx.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {/* Total geral de entradas ou saídas */}
                            <div className="flex justify-end mt-8">
                                <span className={tab === 'incomes' ? 'text-green-600' : 'text-red-600'}>
                                <span className="ml-2 text-base font-medium text-gray-500">Total: </span>
                                    <span className="font-semibold text-lg">
                                        {tab === 'incomes' ? '+' : '-'}
                                        {categories.reduce((acc, cat) => acc + (cat.total || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryReports; 