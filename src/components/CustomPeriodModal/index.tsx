import React, { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';

interface CustomPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  currentMonth: number;
  currentYear: number;
}

const CustomPeriodModal: React.FC<CustomPeriodModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentMonth,
  currentYear
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Initialize dates when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set default to current month range
      const firstDay = new Date(currentYear, currentMonth - 1, 1);
      const lastDay = new Date(currentYear, currentMonth, 0);
      
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
      setIsClosing(false);
    }
  }, [isOpen, currentMonth, currentYear]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start <= end) {
        onApply(startDate, endDate);
        handleClose();
      } else {
        alert('A data de início deve ser anterior à data de fim.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    } else if (e.key === 'Enter' && startDate && endDate) {
      handleApply();
    }
  };

  // Quick preset handlers
  const setPreset = (type: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear') => {
    const now = new Date();
    let start: Date, end: Date;

    switch (type) {
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisQuarter': {
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      }
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-zinc-700/50 overflow-hidden transition-all duration-200 ${
        isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-teal-600/20 dark:to-blue-600/20 p-6 border-b border-zinc-200/50 dark:border-zinc-700/50">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/80 dark:hover:bg-zinc-800/80 rounded-full transition-colors"
          >
            <X size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          
          <div className="flex items-center gap-3 pr-12">
            <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-xl">
              <Calendar size={24} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Período Customizado
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                Selecione o intervalo de datas desejado
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Períodos pré-definidos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPreset('thisMonth')}
                className="p-2 text-xs bg-zinc-100 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                Este mês
              </button>
              <button
                onClick={() => setPreset('lastMonth')}
                className="p-2 text-xs bg-zinc-100 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                Mês passado
              </button>
              <button
                onClick={() => setPreset('thisQuarter')}
                className="p-2 text-xs bg-zinc-100 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                Este trimestre
              </button>
              <button
                onClick={() => setPreset('thisYear')}
                className="p-2 text-xs bg-zinc-100 dark:bg-zinc-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                Este ano
              </button>
            </div>
          </div>

          {/* Date Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Data de início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Data de fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 dark:focus:ring-teal-400"
              />
            </div>
          </div>

          {/* Summary */}
          {startDate && endDate && (
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
              <p className="text-sm text-teal-700 dark:text-teal-300">
                <strong>Período selecionado:</strong> {' '}
                {new Date(startDate).toLocaleDateString('pt-BR')} até {' '}
                {new Date(endDate).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} dias
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-50/80 dark:bg-zinc-800/50 border-t border-zinc-200/50 dark:border-zinc-700/50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed"
          >
            <Check size={16} />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPeriodModal;
