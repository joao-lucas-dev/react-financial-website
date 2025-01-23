import { useCallback, useEffect } from 'react'
import { monthRemap } from '../common/constants'
import { IRow } from '../types/transactions'
import { DateTime } from 'luxon'

export default function useDashboard(
  rows: IRow[],
  handleGetPreviewTransactions: (date?: DateTime) => Promise<void>,
) {
  const getMonth = useCallback(() => {
    if (rows.length > 0) {
      return monthRemap.get(Number(rows[3].formatted_date.split('/')[1]))
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

      await handleGetPreviewTransactions(newDate)
    },
    [handleGetPreviewTransactions, rows],
  )

  const getToday = useCallback(async () => {
    await handleGetPreviewTransactions()
  }, [handleGetPreviewTransactions])

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
  }, [handleGetPreviewTransactions])

  return {
    getMonth,
    getNextWeek,
    getToday,
    getGreeting,
    hasToday,
  }
}
