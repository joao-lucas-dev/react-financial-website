import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { IRow, ITransaction } from '../types/transactions.ts'
import { DateTime } from 'luxon'
import api from '../api/axiosInstance.ts'

export default function useTransactions() {
  const [rows, setRows] = useState<IRow[]>([])

  const handleGetPreviewTransactions = useCallback(
    async (date = DateTime.now()) => {
      console.log(date)
      const startDate = date.minus({ days: 3 }).startOf('day')
      const endDate = date.plus({ days: 3 }).endOf('day')
      // console.log(startDate)
      // console.log(endDate)

      try {
        const { data } = await api.get(
          `/transactions/preview?startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          },
        )
        setRows(data)
      } catch (err) {
        console.log(err)
      }
    },
    [setRows],
  )

  const handleCreateTransaction = useCallback(
    async (
      type: 'incomes' | 'outcomes' | 'dailies',
      row: IRow,
      value = {
        formattedValue: '',
        originalValue: 0,
      },
      setValue: Dispatch<
        SetStateAction<{ formattedValue: string; originalValue: number }>
      >,
    ) => {
      try {
        const now = DateTime.now()
        const transactionDay = DateTime.fromISO(row.date).set({
          hour: now.hour,
          minute: now.minute,
          second: now.second,
          millisecond: now.millisecond,
        })

        await api.post('/transactions/create', {
          description: 'Insira uma descrição',
          price: value.originalValue,
          category_id: 4,
          type:
            type === 'dailies' ? 'daily' : type.substring(0, type.length - 1),
          shared_id: null,
          transaction_day: transactionDay,
        })

        await handleGetPreviewTransactions(
          DateTime.fromISO(rows[3].date) as DateTime,
        )

        setValue({
          formattedValue: '',
          originalValue: 0,
        })
      } catch (err) {
        console.log(err)
      }
    },
    [rows, handleGetPreviewTransactions],
  )

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/transactions/delete/${id}`)

        await handleGetPreviewTransactions(
          DateTime.fromISO(rows[3].date) as DateTime,
        )
      } catch (err) {
        console.log(err)
      }
    },
    [rows, handleGetPreviewTransactions],
  )

  const handleUpdateTransaction = useCallback(
    async (updateTransaction: ITransaction) => {
      try {
        await api.put(
          `/transactions/update/${updateTransaction.id}`,
          updateTransaction,
        )

        await handleGetPreviewTransactions(
          DateTime.fromISO(rows[3].date) as DateTime,
        )
      } catch (err) {
        console.log(err)
      }
    },
    [rows, handleGetPreviewTransactions],
  )

  return {
    rows,
    setRows,
    handleGetPreviewTransactions,
    handleDeleteTransaction,
    handleCreateTransaction,
    handleUpdateTransaction,
  }
}
