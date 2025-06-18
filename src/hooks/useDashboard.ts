import { useCallback, useEffect, useState } from 'react'
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
) {
  const [currentMonth, setCurrentMonth] = useState(DateTime.now().month)

  const getMonth = useCallback(() => {
    if (rows.length > 0) {
      return `${monthRemap.get(Number(rows[3].formatted_date.split('/')[1]))}/${rows[3]?.date.substring(2, 4)}`
    }

    return ''
  }, [rows])

  const getNextWeek = useCallback(
    async (isBeforeWeek: boolean) => {
      let newDate

      if (isBeforeWeek) {
        newDate = DateTime.fromISO(rows[0].date).minus({ days: 4 })
      } else {
        newDate = DateTime.fromISO(rows[rows.length - 1].date).plus({ days: 4 })
      }

      const promises = [await handleGetPreviewTransactions(newDate)]

      if (newDate.month !== currentMonth) {
        promises.push(await handleGetChartCategories(newDate))
        promises.push(await handleGetOverviewTransactions(newDate))
        // @ts-expect-error TS2322
        setCurrentMonth(newDate.month)
      }

      await Promise.all(promises)
    },
    [
      rows,
      handleGetChartCategories,
      handleGetOverviewTransactions,
      setCurrentMonth,
      currentMonth,
      handleGetPreviewTransactions,
    ],
  )

  const getToday = useCallback(async () => {
    const newDate = DateTime.now()
    const promises = [await handleGetPreviewTransactions(newDate)]

    if (newDate.month !== currentMonth) {
      promises.push(await handleGetChartCategories(newDate))
      promises.push(await handleGetOverviewTransactions(newDate))
      setCurrentMonth(newDate.month)
    }

    await Promise.all(promises)
  }, [
    handleGetChartCategories,
    handleGetOverviewTransactions,
    currentMonth,
    handleGetPreviewTransactions,
  ])

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
    handleGetPreviewTransactions()
    handleGetChartCategories()
    handleGetOverviewTransactions()
    handleGetBalance()
    handleGetRecentTransactions()
  }, [])

  return {
    getMonth,
    getNextWeek,
    getToday,
    getGreeting,
    hasToday,
    currentMonth,
    setCurrentMonth,
  }
}
