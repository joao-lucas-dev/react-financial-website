import React, { useState } from 'react';
import { 
    User, 
    Bell, 
    Shield, 
    CreditCard, 
    Palette, 
    Globe, 
    Eye, 
    EyeOff,
    Save,
    Camera,
    Moon,
    Sun,
    Smartphone,
    Tags,
    AlertTriangle,
    Plus,
    Edit2,
    Trash2,
    X
} from 'lucide-react';
import MenuAside from '../components/MenuAside';
import Header from '../components/Header';

interface Category {
    id: number;
    name: string;
    color: string;
    icon: string;
    type: 'income' | 'expense';
}

interface SettingsFormData {
    // Profile
    name: string;
    email: string;
    phone: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    
    // Notifications
    emailNotifications: boolean;
    pushNotifications: boolean;
    transactionAlerts: boolean;
    monthlyReports: boolean;
    
    // Appearance
    theme: 'light' | 'dark' | 'auto';
    language: string;
    currency: string;
    
    // Privacy
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
    analytics: boolean;
    
    // Alerts
    mediumBalanceAlert: number;
    criticalBalanceAlert: number;
    balanceAlertsEnabled: boolean;
}

const Settings: React.FC = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [formData, setFormData] = useState<SettingsFormData>({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '+55 11 99999-9999',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emailNotifications: true,
        pushNotifications: true,
        transactionAlerts: true,
        monthlyReports: false,
        theme: 'light',
        language: 'pt-BR',
        currency: 'BRL',
        profileVisibility: 'private',
        dataSharing: false,
        analytics: true,
        mediumBalanceAlert: 1000,
        criticalBalanceAlert: 100,
        balanceAlertsEnabled: true
    });

    const [categories, setCategories] = useState<Category[]>([
        { id: 1, name: 'Alimentação', color: 'red', icon: '🍽️', type: 'expense' },
        { id: 2, name: 'Transporte', color: 'blue', icon: '🚗', type: 'expense' },
        { id: 3, name: 'Salário', color: 'green', icon: '💰', type: 'income' },
        { id: 4, name: 'Lazer', color: 'purple', icon: '🎮', type: 'expense' },
        { id: 5, name: 'Freelance', color: 'orange', icon: '💻', type: 'income' }
    ]);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        color: 'blue',
        icon: '💰',
        type: 'expense' as 'income' | 'expense'
    });

    const sections = [
        { id: 'profile', label: 'Perfil', icon: User },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'appearance', label: 'Aparência', icon: Palette },
        { id: 'categories', label: 'Categorias', icon: Tags },
        { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
        { id: 'privacy', label: 'Privacidade', icon: Shield },
        { id: 'billing', label: 'Faturamento', icon: CreditCard }
    ];

    const handleInputChange = (field: keyof SettingsFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        console.log('Saving settings:', formData);
        // Implementar salvamento
    };

    // Category management functions
    const openCategoryModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setCategoryForm({
                name: category.name,
                color: category.color,
                icon: category.icon,
                type: category.type
            });
        } else {
            setEditingCategory(null);
            setCategoryForm({
                name: '',
                color: 'blue',
                icon: '💰',
                type: 'expense'
            });
        }
        setShowCategoryModal(true);
    };

    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({
            name: '',
            color: 'blue',
            icon: '💰',
            type: 'expense'
        });
    };

    const saveCategory = () => {
        if (!categoryForm.name.trim()) return;

        if (editingCategory) {
            // Edit existing category
            setCategories(prev => prev.map(cat => 
                cat.id === editingCategory.id 
                    ? { ...cat, ...categoryForm }
                    : cat
            ));
        } else {
            // Add new category
            const newCategory: Category = {
                id: Math.max(...categories.map(c => c.id)) + 1,
                ...categoryForm
            };
            setCategories(prev => [...prev, newCategory]);
        }
        closeCategoryModal();
    };

    const deleteCategory = (categoryId: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        }
    };

    const colorOptions = [
        { value: 'red', label: 'Vermelho', color: '#F44336' },
        { value: 'blue', label: 'Azul', color: '#2196F3' },
        { value: 'green', label: 'Verde', color: '#4CAF50' },
        { value: 'orange', label: 'Laranja', color: '#FF9800' },
        { value: 'purple', label: 'Roxo', color: '#9C27B0' },
        { value: 'teal', label: 'Teal', color: '#009688' },
        { value: 'pink', label: 'Rosa', color: '#E91E63' },
        { value: 'indigo', label: 'Índigo', color: '#3F51B5' }
    ];

    const iconOptions = ['💰', '🍽️', '🚗', '🏠', '🎮', '💻', '📱', '👕', '🏥', '🎓', '✈️', '🛒'];

    const renderProfileSection = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Profile Photo */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#424242',
                    marginBottom: '1rem'
                }}>
                    Foto do Perfil
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#009688',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 600
                    }}>
                        JS
                    </div>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#009688',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#00695C';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#009688';
                    }}
                    >
                        <Camera size={16} />
                        Alterar Foto
                    </button>
                </div>
            </div>

            {/* Personal Info */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#424242',
                    marginBottom: '1rem'
                }}>
                    Informações Pessoais
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#424242',
                            marginBottom: '0.5rem'
                        }}>
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #E0E0E0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#424242',
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
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#424242',
                            marginBottom: '0.5rem'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #E0E0E0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#424242',
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
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#424242',
                        marginBottom: '0.5rem'
                    }}>
                        Telefone
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #E0E0E0',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#424242',
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
            </div>

            {/* Password Change */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#424242',
                    marginBottom: '1rem'
                }}>
                    Alterar Senha
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#424242',
                            marginBottom: '0.5rem'
                        }}>
                            Senha Atual
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    paddingRight: '2.5rem',
                                    border: '1px solid #E0E0E0',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#424242',
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
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#616161',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#424242',
                                marginBottom: '0.5rem'
                            }}>
                                Nova Senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.new ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingRight: '2.5rem',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#424242',
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
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#616161',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#424242',
                                marginBottom: '0.5rem'
                            }}>
                                Confirmar Nova Senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword.confirm ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingRight: '2.5rem',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#424242',
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
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#616161',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationsSection = () => (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#424242',
                marginBottom: '1rem'
            }}>
                Preferências de Notificação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                    { key: 'emailNotifications', label: 'Notificações por Email', description: 'Receber atualizações importantes por email' },
                    { key: 'pushNotifications', label: 'Notificações Push', description: 'Receber notificações no dispositivo' },
                    { key: 'transactionAlerts', label: 'Alertas de Transações', description: 'Ser notificado sobre novas transações' },
                    { key: 'monthlyReports', label: 'Relatórios Mensais', description: 'Receber resumo mensal das finanças' }
                ].map((item) => (
                    <div key={item.key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid #F5F5F5',
                        borderRadius: '0.5rem',
                        transition: 'all 0.2s ease'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#424242',
                                marginBottom: '0.25rem'
                            }}>
                                {item.label}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#616161'
                            }}>
                                {item.description}
                            </div>
                        </div>
                        <label style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '44px',
                            height: '24px'
                        }}>
                            <input
                                type="checkbox"
                                checked={formData[item.key as keyof SettingsFormData] as boolean}
                                onChange={(e) => handleInputChange(item.key as keyof SettingsFormData, e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: formData[item.key as keyof SettingsFormData] ? '#009688' : '#E0E0E0',
                                transition: 'all 0.2s ease',
                                borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '',
                                    height: '18px',
                                    width: '18px',
                                    left: formData[item.key as keyof SettingsFormData] ? '23px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: 'all 0.2s ease',
                                    borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAppearanceSection = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Theme */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#424242',
                    marginBottom: '1rem'
                }}>
                    Tema
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {[
                        { value: 'light', label: 'Claro', icon: Sun },
                        { value: 'dark', label: 'Escuro', icon: Moon },
                        { value: 'auto', label: 'Automático', icon: Smartphone }
                    ].map((theme) => (
                        <button
                            key={theme.value}
                            onClick={() => handleInputChange('theme', theme.value)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '1rem',
                                border: `2px solid ${formData.theme === theme.value ? '#009688' : '#E0E0E0'}`,
                                borderRadius: '0.75rem',
                                backgroundColor: formData.theme === theme.value ? '#F0F9FF' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <theme.icon size={24} color={formData.theme === theme.value ? '#009688' : '#616161'} />
                            <span style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: formData.theme === theme.value ? '#009688' : '#424242'
                            }}>
                                {theme.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Language & Currency */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#424242',
                    marginBottom: '1rem'
                }}>
                    Idioma e Moeda
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#424242',
                            marginBottom: '0.5rem'
                        }}>
                            Idioma
                        </label>
                        <select
                            value={formData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #E0E0E0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#424242',
                                backgroundColor: 'white',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                        </select>
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#424242',
                            marginBottom: '0.5rem'
                        }}>
                            Moeda
                        </label>
                        <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #E0E0E0',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#424242',
                                backgroundColor: 'white',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="BRL">Real Brasileiro (R$)</option>
                            <option value="USD">Dólar Americano ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPrivacySection = () => (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#424242',
                marginBottom: '1rem'
            }}>
                Configurações de Privacidade
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Profile Visibility */}
                <div style={{
                    padding: '1rem',
                    border: '1px solid #F5F5F5',
                    borderRadius: '0.5rem'
                }}>
                    <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#424242',
                        marginBottom: '0.5rem'
                    }}>
                        Visibilidade do Perfil
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {[
                            { value: 'public', label: 'Público' },
                            { value: 'private', label: 'Privado' }
                        ].map((option) => (
                            <label key={option.value} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="radio"
                                    name="profileVisibility"
                                    value={option.value}
                                    checked={formData.profileVisibility === option.value}
                                    onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#009688'
                                    }}
                                />
                                <span style={{
                                    fontSize: '0.875rem',
                                    color: '#424242'
                                }}>
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Data Settings */}
                {[
                    { key: 'dataSharing', label: 'Compartilhamento de Dados', description: 'Permitir compartilhamento de dados para melhorar o serviço' },
                    { key: 'analytics', label: 'Analytics', description: 'Permitir coleta de dados para análise de uso' }
                ].map((item) => (
                    <div key={item.key} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid #F5F5F5',
                        borderRadius: '0.5rem'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#424242',
                                marginBottom: '0.25rem'
                            }}>
                                {item.label}
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#616161'
                            }}>
                                {item.description}
                            </div>
                        </div>
                        <label style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '44px',
                            height: '24px'
                        }}>
                            <input
                                type="checkbox"
                                checked={formData[item.key as keyof SettingsFormData] as boolean}
                                onChange={(e) => handleInputChange(item.key as keyof SettingsFormData, e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: 'absolute',
                                cursor: 'pointer',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: formData[item.key as keyof SettingsFormData] ? '#009688' : '#E0E0E0',
                                transition: 'all 0.2s ease',
                                borderRadius: '24px'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    content: '',
                                    height: '18px',
                                    width: '18px',
                                    left: formData[item.key as keyof SettingsFormData] ? '23px' : '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: 'all 0.2s ease',
                                    borderRadius: '50%'
                                }}></span>
                            </span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderBillingSection = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Current Plan */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#424242',
                    marginBottom: '1rem'
                }}>
                    Plano Atual
                </h3>
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#F0F9FF',
                    borderRadius: '0.75rem',
                    border: '2px solid #009688'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#009688',
                                marginBottom: '0.25rem'
                            }}>
                                Plano Premium
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#616161'
                            }}>
                                Acesso completo a todas as funcionalidades
                            </div>
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: '#009688'
                        }}>
                            R$ 29,90/mês
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#424242',
                    marginBottom: '1rem'
                }}>
                    Método de Pagamento
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: '1px solid #E0E0E0',
                    borderRadius: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#009688',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CreditCard size={20} color="white" />
                        </div>
                        <div>
                            <div style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#424242'
                            }}>
                                •••• •••• •••• 1234
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#616161'
                            }}>
                                Cartão de Crédito • Válido até 12/26
                            </div>
                        </div>
                    </div>
                    <button style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#009688',
                        border: '1px solid #009688',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#009688';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#009688';
                    }}
                    >
                        Alterar
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCategoriesSection = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Categories List */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#424242'
                    }}>
                        Gerenciar Categorias
                    </h3>
                    <button
                        onClick={() => openCategoryModal()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#009688',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#00695C';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#009688';
                        }}
                    >
                        <Plus size={16} />
                        Nova Categoria
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['income', 'expense'].map((type) => (
                        <div key={type}>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#616161',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {type === 'income' ? 'Receitas' : 'Despesas'}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.5rem' }}>
                                {categories.filter(cat => cat.type === type).map((category) => (
                                    <div key={category.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '0.5rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F5F5F5';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ 
                                                fontSize: '1.25rem',
                                                width: '24px',
                                                textAlign: 'center'
                                            }}>
                                                {category.icon}
                                            </span>
                                            <span style={{
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                color: '#424242'
                                            }}>
                                                {category.name}
                                            </span>
                                            <div style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: colorOptions.find(c => c.value === category.color)?.color || '#009688'
                                            }}></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button
                                                onClick={() => openCategoryModal(category)}
                                                style={{
                                                    padding: '0.25rem',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    borderRadius: '0.25rem',
                                                    cursor: 'pointer',
                                                    color: '#616161',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#E0E0E0';
                                                    e.currentTarget.style.color = '#009688';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#616161';
                                                }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                style={{
                                                    padding: '0.25rem',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    borderRadius: '0.25rem',
                                                    cursor: 'pointer',
                                                    color: '#616161',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#FFEBEE';
                                                    e.currentTarget.style.color = '#F44336';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#616161';
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        width: '100%',
                        maxWidth: '500px',
                        margin: '1rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#424242'
                            }}>
                                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                            </h3>
                            <button
                                onClick={closeCategoryModal}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#616161',
                                    padding: '0.25rem'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#424242',
                                    marginBottom: '0.5rem'
                                }}>
                                    Nome da Categoria
                                </label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        color: '#424242',
                                        outline: 'none'
                                    }}
                                    placeholder="Ex: Alimentação"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#424242',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Tipo
                                    </label>
                                    <select
                                        value={categoryForm.type}
                                        onChange={(e) => setCategoryForm(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: '#424242',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="expense">Despesa</option>
                                        <option value="income">Receita</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#424242',
                                        marginBottom: '0.5rem'
                                    }}>
                                        Cor
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setCategoryForm(prev => ({ ...prev, color: color.value }))}
                                                style={{
                                                    width: '100%',
                                                    height: '40px',
                                                    backgroundColor: color.color,
                                                    border: categoryForm.color === color.value ? '3px solid #424242' : '1px solid #E0E0E0',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                title={color.label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#424242',
                                    marginBottom: '0.5rem'
                                }}>
                                    Ícone
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setCategoryForm(prev => ({ ...prev, icon }))}
                                            style={{
                                                width: '100%',
                                                height: '40px',
                                                backgroundColor: categoryForm.icon === icon ? '#E0F2F1' : 'transparent',
                                                border: categoryForm.icon === icon ? '2px solid #009688' : '1px solid #E0E0E0',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontSize: '1.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '0.5rem',
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #E0E0E0'
                            }}>
                                <button
                                    onClick={closeCategoryModal}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'transparent',
                                        color: '#616161',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveCategory}
                                    disabled={!categoryForm.name.trim()}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        backgroundColor: categoryForm.name.trim() ? '#009688' : '#E0E0E0',
                                        color: categoryForm.name.trim() ? 'white' : '#616161',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        cursor: categoryForm.name.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {editingCategory ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderAlertsSection = () => (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#424242',
                marginBottom: '1rem'
            }}>
                Alertas de Saldo
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Enable/Disable Alerts */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    border: '1px solid #F5F5F5',
                    borderRadius: '0.5rem',
                    backgroundColor: '#FAFAFA'
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#424242',
                            marginBottom: '0.25rem'
                        }}>
                            Ativar Alertas de Saldo
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#616161'
                        }}>
                            Receber notificações quando o saldo atingir os limites configurados
                        </div>
                    </div>
                    <label style={{
                        position: 'relative',
                        display: 'inline-block',
                        width: '44px',
                        height: '24px'
                    }}>
                        <input
                            type="checkbox"
                            checked={formData.balanceAlertsEnabled}
                            onChange={(e) => handleInputChange('balanceAlertsEnabled', e.target.checked)}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: formData.balanceAlertsEnabled ? '#009688' : '#E0E0E0',
                            transition: 'all 0.2s ease',
                            borderRadius: '24px'
                        }}>
                            <span style={{
                                position: 'absolute',
                                content: '',
                                height: '18px',
                                width: '18px',
                                left: formData.balanceAlertsEnabled ? '23px' : '3px',
                                bottom: '3px',
                                backgroundColor: 'white',
                                transition: 'all 0.2s ease',
                                borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                </div>

                {/* Alert Levels */}
                {formData.balanceAlertsEnabled && (
                    <>
                        {/* Medium Alert */}
                        <div style={{
                            padding: '1rem',
                            border: '1px solid #FF9800',
                            borderRadius: '0.75rem',
                            backgroundColor: '#FFF3E0'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <AlertTriangle size={20} color="#FF9800" />
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: '#424242',
                                    margin: 0
                                }}>
                                    Alerta Médio
                                </h4>
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#616161',
                                marginBottom: '1rem'
                            }}>
                                Você será notificado quando seu saldo atingir este valor
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#424242',
                                    marginBottom: '0.5rem'
                                }}>
                                    Valor do Alerta Médio
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#616161',
                                        fontSize: '0.875rem'
                                    }}>
                                        R$
                                    </span>
                                    <input
                                        type="number"
                                        value={formData.mediumBalanceAlert}
                                        onChange={(e) => handleInputChange('mediumBalanceAlert', parseFloat(e.target.value) || 0)}
                                        style={{
                                            width: '200px',
                                            padding: '0.75rem',
                                            paddingLeft: '2rem',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: '#424242',
                                            outline: 'none'
                                        }}
                                        placeholder="1000"
                                        min="0"
                                        step="10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Critical Alert */}
                        <div style={{
                            padding: '1rem',
                            border: '1px solid #F44336',
                            borderRadius: '0.75rem',
                            backgroundColor: '#FFEBEE'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem'
                            }}>
                                <AlertTriangle size={20} color="#F44336" />
                                <h4 style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: '#424242',
                                    margin: 0
                                }}>
                                    Alerta Crítico
                                </h4>
                            </div>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#616161',
                                marginBottom: '1rem'
                            }}>
                                Você será notificado com urgência quando seu saldo atingir este valor crítico
                            </div>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#424242',
                                    marginBottom: '0.5rem'
                                }}>
                                    Valor do Alerta Crítico
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#616161',
                                        fontSize: '0.875rem'
                                    }}>
                                        R$
                                    </span>
                                    <input
                                        type="number"
                                        value={formData.criticalBalanceAlert}
                                        onChange={(e) => handleInputChange('criticalBalanceAlert', parseFloat(e.target.value) || 0)}
                                        style={{
                                            width: '200px',
                                            padding: '0.75rem',
                                            paddingLeft: '2rem',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            color: '#424242',
                                            outline: 'none'
                                        }}
                                        placeholder="100"
                                        min="0"
                                        step="10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Alert Summary */}
                        <div style={{
                            padding: '1rem',
                            border: '1px solid #E0E0E0',
                            borderRadius: '0.5rem',
                            backgroundColor: '#F9F9F9'
                        }}>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#424242',
                                marginBottom: '0.5rem'
                            }}>
                                Resumo dos Alertas
                            </h4>
                            <div style={{ fontSize: '0.75rem', color: '#616161', lineHeight: 1.5 }}>
                                • <strong>Alerta Médio:</strong> R$ {formData.mediumBalanceAlert.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br />
                                • <strong>Alerta Crítico:</strong> R$ {formData.criticalBalanceAlert.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}<br />
                                {formData.criticalBalanceAlert >= formData.mediumBalanceAlert && (
                                    <span style={{ color: '#F44336' }}>
                                        ⚠️ O valor crítico deve ser menor que o valor médio
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return renderProfileSection();
            case 'notifications':
                return renderNotificationsSection();
            case 'appearance':
                return renderAppearanceSection();
            case 'categories':
                return renderCategoriesSection();
            case 'alerts':
                return renderAlertsSection();
            case 'privacy':
                return renderPrivacySection();
            case 'billing':
                return renderBillingSection();
            default:
                return renderProfileSection();
        }
    };

    return (
        <>
            <div style={{ 
                backgroundColor: '#F5F5F5', 
                minHeight: '100vh',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
                <Header title="Configurações" activePage="configuracoes" />

                <div className="flex" style={{ paddingTop: '96px' }}>
                    <MenuAside activePage="configuracoes" />
                    
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
                                Configurações
                            </h1>
                            <p style={{
                                color: '#616161',
                                fontSize: '1rem',
                                fontWeight: 400
                            }}>
                                Gerencie suas preferências e configurações da conta
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                            {/* Sidebar */}
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '1rem',
                                padding: '1rem',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                height: 'fit-content'
                            }}>
                                <nav>
                                    {sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                marginBottom: '0.5rem',
                                                backgroundColor: activeSection === section.id ? '#009688' : 'transparent',
                                                color: activeSection === section.id ? 'white' : '#616161',
                                                border: 'none',
                                                borderRadius: '0.75rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'left'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (activeSection !== section.id) {
                                                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (activeSection !== section.id) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                        >
                                            <section.icon size={18} />
                                            {section.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Content */}
                            <div>
                                {renderContent()}
                                
                                {/* Save Button */}
                                <div style={{
                                    marginTop: '2rem',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                    <button
                                        onClick={handleSave}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            backgroundColor: '#009688',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.75rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#00695C';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#009688';
                                            e.currentTarget.style.transform = 'translateY(0px)';
                                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                        }}
                                    >
                                        <Save size={16} />
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;