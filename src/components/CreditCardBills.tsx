import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Eye,
  Download,
  MoreHorizontal,
  Zap,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeProvider';

interface CreditCardBill {
  id: string;
  cardName: string;
  cardNumber: string;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  isOverdue: boolean;
  minimumPayment: number;
  remainingBalance: number;
  cardType: 'visa' | 'mastercard' | 'amex';
  color: string;
}

const CreditCardBills: React.FC = () => {
  const { actualTheme } = useTheme();
  const [selectedBill, setSelectedBill] = useState<string | null>(null);

  // Mock data - em um caso real, viria de uma API
  const bills: CreditCardBill[] = [
    {
      id: '1',
      cardName: 'Visa Platinum',
      cardNumber: '**** **** **** 4532',
      dueDate: '2024-02-15',
      amount: 2485.90,
      isPaid: false,
      isOverdue: false,
      minimumPayment: 248.59,
      remainingBalance: 12500.00,
      cardType: 'visa',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: '2',
      cardName: 'Mastercard Gold',
      cardNumber: '**** **** **** 8920',
      dueDate: '2024-02-10',
      amount: 1850.75,
      isPaid: true,
      isOverdue: false,
      minimumPayment: 185.08,
      remainingBalance: 8900.00,
      cardType: 'mastercard',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: '3',
      cardName: 'Visa Infinite',
      cardNumber: '**** **** **** 1234',
      dueDate: '2024-02-05',
      amount: 3240.15,
      isPaid: false,
      isOverdue: true,
      minimumPayment: 324.02,
      remainingBalance: 18750.00,
      cardType: 'visa',
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (bill: CreditCardBill) => {
    if (bill.isPaid) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (bill.isOverdue) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    
    const daysUntilDue = getDaysUntilDue(bill.dueDate);
    if (daysUntilDue <= 3) return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
    
    return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
  };

  const getStatusText = (bill: CreditCardBill) => {
    if (bill.isPaid) return 'Paga';
    if (bill.isOverdue) return 'Vencida';
    
    const daysUntilDue = getDaysUntilDue(bill.dueDate);
    if (daysUntilDue <= 0) return 'Vence hoje';
    if (daysUntilDue <= 3) return `${daysUntilDue} dias`;
    
    return 'Em dia';
  };

  const totalToPay = bills.filter(bill => !bill.isPaid).reduce((total, bill) => total + bill.amount, 0);
  const overdueBills = bills.filter(bill => bill.isOverdue && !bill.isPaid).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl border border-white border-opacity-20 dark:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <CreditCard size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Faturas do Cartão
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {bills.length} cartões • {overdueBills > 0 ? `${overdueBills} em atraso` : 'Tudo em dia'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total a pagar</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(totalToPay)}
            </p>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreHorizontal size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pagas</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {bills.filter(b => b.isPaid).length}
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pendentes</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {bills.filter(b => !b.isPaid && !b.isOverdue).length}
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Atrasadas</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {overdueBills}
          </p>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {bills.map((bill) => (
          <div
            key={bill.id}
            className={`group relative p-4 border rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md ${
              selectedBill === bill.id
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
            }`}
            onClick={() => setSelectedBill(selectedBill === bill.id ? null : bill.id)}
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Mini Card */}
                <div className={`w-12 h-8 bg-gradient-to-r ${bill.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <CreditCard size={16} className="text-white" />
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {bill.cardName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {bill.cardNumber}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill)}`}>
                {getStatusText(bill)}
              </div>
            </div>

            {/* Bill Amount and Due Date */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Valor da fatura</p>
                <p className={`text-lg font-bold ${
                  bill.isPaid 
                    ? 'text-green-600 dark:text-green-400' 
                    : bill.isOverdue 
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {formatCurrency(bill.amount)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Vencimento</p>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(bill.dueDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar - Usage */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Limite utilizado</span>
                <span>{((bill.remainingBalance / (bill.remainingBalance + bill.amount)) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-full bg-gradient-to-r ${bill.color} rounded-full transition-all duration-500`}
                  style={{ width: `${(bill.remainingBalance / (bill.remainingBalance + bill.amount)) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                  <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                  <Download size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {!bill.isPaid && (
                <button className="flex items-center gap-1 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors">
                  <Zap size={12} />
                  Pagar
                  <ArrowRight size={12} />
                </button>
              )}
            </div>

            {/* Expanded Details */}
            {selectedBill === bill.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Pagamento mínimo</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(bill.minimumPayment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Limite disponível</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(bill.remainingBalance)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-sm font-medium rounded-lg transition-colors">
                    Ver Fatura
                  </button>
                  <button className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Configurar Auto-Débito
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp size={16} />
            Gerenciar Todos os Cartões
            <ArrowRight size={16} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default CreditCardBills;