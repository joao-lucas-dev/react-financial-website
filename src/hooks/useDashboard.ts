import { useCallback, useEffect, useState, useRef } from 'react'
import { monthRemap } from '../common/constants'
import { IRow } from '../types/transactions'
import { DateTime } from 'luxon'

export default function useDashboard(
  rows: IRow[],
  handleGetChartCategories: (date?: DateTime) => Promise<void>,
  handleGetOverviewTransactions: (date?: DateTime) => Promise<void>,
  handleGetBalance: () => Promise<void>,
  handleGetPreviewTransactions: (date?: DateTime) => Promise<void>,
  handleGetRecentTransactions: () => Promise<void>,
  handleGetPeriodsSummary: () => Promise<void>,
  handleGetTransactionsMonth?: (date?: DateTime) => Promise<void>,
) {
  const [currentDate, setCurrentDate] = useState(DateTime.now())
  const [isLoading, setIsLoading] = useState(false)
  const initializedRef = useRef(false)
  
  // Keep currentMonth for backward compatibility
  const currentMonth = currentDate.month
  const currentYear = currentDate.year

  const getMonth = useCallback(() => {
    if (rows.length > 0) {
      return `${monthRemap.get(Number(rows[3].formatted_date.split('/')[1]))}/${rows[3]?.date.substring(2, 4)}`
    }

    return ''
  }, [rows])

  const getNextMonth = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newDate = currentDate.plus({ months: 1 });
      await Promise.all([
        handleGetPreviewTransactions(newDate),
        handleGetChartCategories(newDate),
        handleGetOverviewTransactions(newDate),
      ]);
      setCurrentDate(newDate);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, isLoading, handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions]);

  const getPreviousMonth = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newDate = currentDate.minus({ months: 1 });
      await Promise.all([
        handleGetPreviewTransactions(newDate),
        handleGetChartCategories(newDate),
        handleGetOverviewTransactions(newDate),
      ]);
      setCurrentDate(newDate);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, isLoading, handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions]);

  const getNextWeek = useCallback(async (isBeforeWeek: boolean) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newDate = isBeforeWeek 
        ? currentDate.minus({ weeks: 1 })
        : currentDate.plus({ weeks: 1 });
      
      await Promise.all([
        handleGetPreviewTransactions(newDate),
        handleGetChartCategories(newDate),
        handleGetOverviewTransactions(newDate),
      ]);
      setCurrentDate(newDate);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentDate, handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions]);

  const getToday = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newDate = DateTime.now();
      await Promise.all([
        handleGetPreviewTransactions(newDate),
        handleGetChartCategories(newDate),
        handleGetOverviewTransactions(newDate),
      ]);
      setCurrentDate(newDate);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions]);

  const getGreeting = useCallback(() => {
    const now = new Date()
    const hour = now.getHours()

    if (hour >= 5 && hour <= 12) {
      return 'Bom dia'
    } else if (hour > 12 && hour <= 18) {
      return 'Boa tarde'
    } else {
      return 'Boa noite'
    }
  }, [])

  const hasToday = useCallback(() => {
    const today = new Date()
    today.setHours(0, 0, 0)

    return rows.some(
      (row) =>
        new Date(`${row.date}T00:00`).toDateString() === today.toDateString(),
    )
  }, [rows])

  useEffect(() => {
    if (initializedRef.current) return;
    
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          handleGetPreviewTransactions(),
          handleGetChartCategories(),
          handleGetOverviewTransactions(),
          handleGetBalance(),
          handleGetRecentTransactions(),
          handleGetPeriodsSummary(),
        ]);
        initializedRef.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions, handleGetBalance, handleGetRecentTransactions, handleGetPeriodsSummary])

  const setCurrentMonth = useCallback(async (month: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newDate = currentDate.set({ month });
      await Promise.all([
        handleGetPreviewTransactions(newDate),
        handleGetChartCategories(newDate),
        handleGetOverviewTransactions(newDate),
      ]);
      setCurrentDate(newDate);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, isLoading, handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions]);

  const setCurrentYear = useCallback(async (year: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newDate = currentDate.set({ year });
      await Promise.all([
        handleGetPreviewTransactions(newDate),
        handleGetChartCategories(newDate),
        handleGetOverviewTransactions(newDate),
      ]);
      setCurrentDate(newDate);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, isLoading, handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions]);

  // New function to handle custom date ranges
  const handleDateRangeChange = useCallback(async (startDate: string, endDate: string, periodType: 'week' | 'month' | 'custom') => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const luxonStartDate = DateTime.fromISO(startDate);
      const luxonEndDate = DateTime.fromISO(endDate);
      
      // Use the start date as reference for data fetching
      const referenceDate = luxonStartDate;
      
      const promises = [];
      
      // Always include these core data fetches
      promises.push(
        handleGetChartCategories(referenceDate),
        handleGetOverviewTransactions(referenceDate)
      );
      
      if (periodType === 'week' || periodType === 'custom') {
        // For week and custom periods, use preview transactions
        promises.push(handleGetPreviewTransactions(referenceDate));
      } else {
        // For month, use month-specific functions if available
        if (handleGetTransactionsMonth) {
          promises.push(handleGetTransactionsMonth(referenceDate));
        } else {
          promises.push(handleGetPreviewTransactions(referenceDate));
        }
      }
      
      // Add additional data fetches that don't depend on date
      promises.push(
        handleGetBalance(),
        handleGetRecentTransactions(),
        handleGetPeriodsSummary()
      );
      
      await Promise.all(promises);
      setCurrentDate(referenceDate);
      
      console.log(`Data fetched for ${periodType} period:`, { startDate, endDate, referenceDate: referenceDate.toISODate() });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, handleGetPreviewTransactions, handleGetChartCategories, handleGetOverviewTransactions, handleGetTransactionsMonth, handleGetBalance, handleGetRecentTransactions, handleGetPeriodsSummary]);

  return {
    getMonth,
    getNextMonth,
    getPreviousMonth,
    getNextWeek,
    getToday,
    getGreeting,
    hasToday,
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    handleDateRangeChange,
    isLoading,
  }
}
