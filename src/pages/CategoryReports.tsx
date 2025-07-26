import React, { useEffect, useState } from 'react';
import Tabs from '../components/Tabs';
import EnhancedChartComponent from '../components/EnhancedChartComponent';
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
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{ 
                backgroundColor: '#F5F5F5', 
                minHeight: '100vh',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
                <Header title="Relatórios" activePage="relatorios" />

            <div className="flex" style={{ paddingTop: '96px' }}>
                <MenuAside activePage="relatorios" />
                
                <div style={{ 
                    flex: 1, 
                    marginLeft: '240px',
                    padding: '2rem',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    marginLeft: '260px'
                }}>
                    {/* Header Section */}
                    <div style={{
                        marginBottom: '2rem'
                    }}>
                        <h1 style={{
                            fontSize: '2.25rem',
                            fontWeight: 700,
                            color: '#424242',
                            marginBottom: '0.5rem',
                            lineHeight: 1.2
                        }}>
                            Relatórios por Categoria
                        </h1>
                        <p style={{
                            color: '#616161',
                            fontSize: '1rem',
                            fontWeight: 400
                        }}>
                            Analise seus gastos e receitas por categoria
                        </p>
                    </div>

                    {/* Controls Section */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '2rem',
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <Tabs tabs={TABS} selected={tab} onChange={(v) => setTab(v as 'incomes' | 'outcomes')} />
                        <input
                            type="month"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{
                                border: '1px solid #E0E0E0',
                                borderRadius: '0.5rem',
                                padding: '0.75rem 1rem',
                                fontSize: '0.875rem',
                                color: '#424242',
                                backgroundColor: 'white',
                                outline: 'none',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.outline = '2px solid #009688';
                                e.target.style.outlineOffset = '2px';
                            }}
                            onBlur={(e) => {
                                e.target.style.outline = 'none';
                            }}
                        />
                    </div>

                    {/* Chart Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        marginBottom: '2rem',
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {loading ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '2rem',
                                color: '#616161'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '3px solid #E0E0E0',
                                    borderTop: '3px solid #009688',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    margin: '0 auto 1rem'
                                }}></div>
                                Carregando dados...
                            </div>
                        ) : (
                            (() => {
                                const chartData = tab === 'incomes' ? chartCategories.income.chartConfig : chartCategories.notIncome.chartConfig;
                                if (!chartData.labels || chartData.labels.length === 0 || !chartData.datasets[0].data.some((v: number) => v > 0)) {
                                    return (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2rem',
                                            color: '#616161'
                                        }}>
                                            <MessageCircleQuestion size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>
                                                Nenhum dado para exibir neste período
                                            </span>
                                            <span style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>
                                                Tente selecionar um período diferente
                                            </span>
                                        </div>
                                    );
                                }
                                return (
                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                        <EnhancedChartComponent categories={chartData} size={300} />
                                    </div>
                                );
                            })()
                        )}
                    </div>
                    {/* Categories List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {categories.map((cat) => (
                            <div key={cat.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease'
                            }}>
                                <button
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: '100%',
                                        justifyContent: 'space-between',
                                        padding: '1.5rem',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => setExpanded((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F5F5F5';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.outline = '2px solid #009688';
                                        e.currentTarget.style.outlineOffset = '2px';
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.outline = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <CategoryIcon category={{
                                            iconName: cat.icon_name,
                                            color: cat.color,
                                            icon_name: cat.icon_name,
                                            id: cat.id,
                                            name: cat.name,
                                            type: cat.type,
                                        }} size="large" />
                                        <span style={{
                                            fontWeight: 500,
                                            color: '#424242',
                                            fontSize: '1rem'
                                        }}>
                                            {cat.name}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{
                                            color: tab === 'incomes' ? '#4CAF50' : '#F44336',
                                            fontWeight: 600,
                                            fontSize: '1rem'
                                        }}>
                                            {tab === 'incomes' ? '+' : '-'}
                                            {cat.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                        <svg 
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                color: '#616161',
                                                transition: 'transform 0.2s ease',
                                                transform: expanded[cat.id] ? 'rotate(180deg)' : 'rotate(0deg)'
                                            }}
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>
                                {expanded[cat.id] && (
                                    <div style={{
                                        padding: '0 1.5rem 1.5rem',
                                        borderTop: '1px solid #E0E0E0'
                                    }}>
                                        {cat.transactions.length === 0 ? (
                                            <div style={{
                                                color: '#616161',
                                                fontSize: '0.875rem',
                                                textAlign: 'center',
                                                padding: '1rem',
                                                fontStyle: 'italic'
                                            }}>
                                                Nenhuma transação nesta categoria
                                            </div>
                                        ) : (
                                            (() => {
                                                // Ordenar transações por data decrescente
                                                const sortedTx = [...cat.transactions].sort((a, b) => DateTime.fromISO(b.transaction_day).toMillis() - DateTime.fromISO(a.transaction_day).toMillis());
                                                // Agrupar por dia
                                                const grouped = sortedTx.reduce((acc: Record<string, Transaction[]>, tx) => {
                                                    const day = DateTime.fromISO(tx.transaction_day).toFormat('dd/MM/yyyy');
                                                    if (!acc[day]) acc[day] = [];
                                                    acc[day].push(tx);
                                                    return acc;
                                                }, {});
                                                return (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        {Object.entries(grouped).map(([day, txs], idx) => (
                                                            <React.Fragment key={day}>
                                                                <div
                                                                    style={{
                                                                        padding: '0.5rem 0.75rem',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                        borderRadius: '0.5rem',
                                                                        backgroundColor: '#F5F5F5',
                                                                        color: '#424242',
                                                                        marginTop: idx !== 0 ? '1rem' : '0',
                                                                        marginBottom: '0.5rem'
                                                                    }}
                                                                >
                                                                    {day}
                                                                </div>
                                                                {txs.map((tx) => (
                                                                    <div key={tx.id} style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: '0.75rem 1rem',
                                                                        borderBottom: '1px solid #F5F5F5',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor = '#FAFAFA';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                    }}
                                                                    >
                                                                        <div>
                                                                            <div style={{
                                                                                fontSize: '0.875rem',
                                                                                color: '#424242',
                                                                                fontWeight: 500
                                                                            }}>
                                                                                {tx.description}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{
                                                                            color: tab === 'incomes' ? '#4CAF50' : '#F44336',
                                                                            fontWeight: 600,
                                                                            fontSize: '0.875rem'
                                                                        }}>
                                                                            {tab === 'incomes' ? '+' : '-'}
                                                                            {tx.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Total Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        marginTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#424242',
                                marginBottom: '0.25rem'
                            }}>
                                Total {tab === 'incomes' ? 'de Entradas' : 'de Saídas'}
                            </h3>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#616161'
                            }}>
                                Soma de todas as categorias do período
                            </p>
                        </div>
                        <div style={{
                            textAlign: 'right'
                        }}>
                            <div style={{
                                fontSize: '1.875rem',
                                fontWeight: 700,
                                color: tab === 'incomes' ? '#4CAF50' : '#F44336'
                            }}>
                                {tab === 'incomes' ? '+' : '-'}
                                {categories.reduce((acc, cat) => acc + (cat.total || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};

export default CategoryReports; 