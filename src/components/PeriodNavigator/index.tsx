import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Settings, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export type PeriodType = 'month' | 'week' | 'custom' | 'today';

interface PeriodNavigatorProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onQuickPeriod?: (type: 'today' | 'thisWeek' | 'thisMonth' | 'custom') => void;
  onPeriodChange?: (startDate: string, endDate: string, type: PeriodType) => Promise<void>;
  onCustomPeriod?: (startDate: string, endDate: string) => Promise<void>;
  isLoading?: boolean;
}

const PeriodNavigator: React.FC<PeriodNavigatorProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  onYearChange,
  onQuickPeriod,
  onPeriodChange,
  onCustomPeriod,
  isLoading = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Get month name in Portuguese
  const getMonthName = (month: number) => {
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[month - 1];
  };

  // Initialize current week to start on Monday
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(monday);
  }, []);

  // Get week range display
  const getWeekDisplay = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    
    const startDay = currentWeekStart.getDate().toString().padStart(2, '0');
    const startMonth = (currentWeekStart.getMonth() + 1).toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    
    return `${startDay}/${startMonth} à ${endDay}/${endMonth}`;
  };

  // Get custom period display
  const getCustomDisplay = () => {
    if (!customStartDate || !customEndDate) return 'Período customizado';
    
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    
    const startDay = start.getDate().toString().padStart(2, '0');
    const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
    const endDay = end.getDate().toString().padStart(2, '0');
    const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
    
    return `${startDay}/${startMonth} à ${endDay}/${endMonth}`;
  };

  // Get current display based on period type
  const getCurrentDisplay = () => {
    switch (periodType) {
      case 'week':
        return getWeekDisplay();
      case 'custom':
        return getCustomDisplay();
      case 'month':
      default:
        return `${getMonthName(currentMonth)}/${currentYear.toString().slice(-2)}`;
    }
  };

  // Navigation functions based on period type
  const navigateToPrevious = async () => {
    if (isLoading) return;
    
    switch (periodType) {
      case 'week':
        const prevWeek = new Date(currentWeekStart);
        prevWeek.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(prevWeek);
        if (onPeriodChange) {
          const endDate = new Date(prevWeek);
          endDate.setDate(prevWeek.getDate() + 6);
          await onPeriodChange(
            prevWeek.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            'week'
          );
        }
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          const diff = end.getTime() - start.getTime();
          
          const newEnd = new Date(start);
          newEnd.setDate(start.getDate() - 1);
          const newStart = new Date(newEnd.getTime() - diff);
          
          const newStartStr = newStart.toISOString().split('T')[0];
          const newEndStr = newEnd.toISOString().split('T')[0];
          
          setCustomStartDate(newStartStr);
          setCustomEndDate(newEndStr);
          
          if (onPeriodChange) {
            await onPeriodChange(newStartStr, newEndStr, 'custom');
          }
        }
        break;
      case 'month':
      default:
        if (currentMonth === 1) {
          onMonthChange(12);
          onYearChange(currentYear - 1);
        } else {
          onMonthChange(currentMonth - 1);
        }
        break;
    }
  };

  const navigateToNext = async () => {
    if (isLoading) return;
    
    switch (periodType) {
      case 'week':
        const nextWeek = new Date(currentWeekStart);
        nextWeek.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(nextWeek);
        if (onPeriodChange) {
          const endDate = new Date(nextWeek);
          endDate.setDate(nextWeek.getDate() + 6);
          await onPeriodChange(
            nextWeek.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            'week'
          );
        }
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          const diff = end.getTime() - start.getTime();
          
          const newStart = new Date(end);
          newStart.setDate(end.getDate() + 1);
          const newEnd = new Date(newStart.getTime() + diff);
          
          const newStartStr = newStart.toISOString().split('T')[0];
          const newEndStr = newEnd.toISOString().split('T')[0];
          
          setCustomStartDate(newStartStr);
          setCustomEndDate(newEndStr);
          
          if (onPeriodChange) {
            await onPeriodChange(newStartStr, newEndStr, 'custom');
          }
        }
        break;
      case 'month':
      default:
        if (currentMonth === 12) {
          onMonthChange(1);
          onYearChange(currentYear + 1);
        } else {
          onMonthChange(currentMonth + 1);
        }
        break;
    }
  };

  // Handle dropdown visibility
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Quick period handlers
  const handleQuickPeriod = async (type: 'today' | 'thisWeek' | 'thisMonth' | 'custom') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(false);
    
    switch (type) {
      case 'today':
        // Delegar ao pai para filtrar somente o dia atual
        setPeriodType('today');
        onQuickPeriod?.('today');
        break;
      case 'thisWeek':
        // Atualiza estado local para navegação semanal e delega ao pai
        setPeriodType('week');
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 3);
        setCurrentWeekStart(startDate);
        onQuickPeriod?.('thisWeek');
        break;
      case 'thisMonth':
        // Delegar ao pai para voltar ao modo mensal padrão
        setPeriodType('month');
        onQuickPeriod?.('thisMonth');
        break;
      case 'custom':
        // Este caso é tratado pelo modal no pai
        setPeriodType('custom');
        onQuickPeriod?.(type);
        break;
    }
  };
  
  // Handle custom period from modal
  const handleCustomPeriod = async (startDate: string, endDate: string) => {
    setPeriodType('custom');
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    
    if (onCustomPeriod) {
      await onCustomPeriod(startDate, endDate);
    } else if (onPeriodChange) {
      await onPeriodChange(startDate, endDate, 'custom');
    }
  };

  // Check if navigation buttons should be disabled
  const canNavigateBack = currentYear > 2019 || (currentYear === 2019 && currentMonth > 1);
  const canNavigateForward = currentYear < 2029 || (currentYear === 2029 && currentMonth < 12);

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Período:
      </label>
      
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg overflow-hidden">
          {/* Previous Button */}
          <button
            onClick={navigateToPrevious}
            disabled={isLoading || !canNavigateBack}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Período anterior"
          >
            <ChevronLeft size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>

          {/* Current Period Display */}
          <div
            className="px-4 py-2 min-w-[140px] text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
          >
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {getCurrentDisplay()}
              </div>
              <ChevronDown 
                size={14} 
                className={`text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {periodType === 'week' ? 'Navegação semanal' : 
               periodType === 'custom' ? 'Período customizado' : 
               'Navegação mensal'}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={navigateToNext}
            disabled={isLoading || !canNavigateForward}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Próximo período"
          >
            <ChevronRight size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Dropdown Menu - Moved outside the overflow-hidden container */}
        {isDropdownOpen && (
          <div 
            className="absolute top-full left-0 w-[200px] mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg shadow-xl z-[9999]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="py-2">
              <button
                onClick={async () => await handleQuickPeriod('today')}
                className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <Calendar size={14} className="text-teal-600 dark:text-teal-400" />
                Hoje
              </button>
              <button
                onClick={async () => await handleQuickPeriod('thisWeek')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                  periodType === 'week' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                Esta semana
              </button>
              <button
                onClick={async () => await handleQuickPeriod('thisMonth')}
                // className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                //   periodType === 'month' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'text-zinc-700 dark:text-zinc-300'
                // }`}
                className="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
              >
                <Zap size={14} className="text-green-600 dark:text-green-400" />
                Este mês
              </button>
              <div className="border-t border-zinc-200 dark:border-zinc-600 my-1"></div>
              <button
                onClick={async () => await handleQuickPeriod('custom')}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2 ${
                  periodType === 'custom' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Settings size={14} className="text-purple-600 dark:text-purple-400" />
                Período customizado
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-zinc-800/50 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

// Export additional type for use in parent components
export type { PeriodType };
export default PeriodNavigator;
