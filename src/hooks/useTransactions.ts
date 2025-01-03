import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { IRow } from '../types/transactions.ts'
import api from '../api/axiosInstance.ts'

export default function useTransactions() {
  const [rows, setRows] = useState<IRow[]>([])

  const handleGetPreviewTransactions = useCallback(
    async (date = new Date()) => {
      const startDate = new Date(date.setDate(date.getDate() - 3))

      const endDate = new Date(date.setDate(date.getDate() + 6))

      try {
        const { data } = await api.get(
          `/transactions/preview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
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
        const year = new Date(row.date).getFullYear()
        const transactionDay = new Date(
          `${year}-${row.formatted_date.split('/')[1]}-${row.formatted_date.split('/')[0]}T00:00`,
        )

        await api.post('/transactions/create', {
          description: 'Insira uma descrição',
          price: value.originalValue,
          category_id: 4,
          type:
            type === 'dailies' ? 'daily' : type.substring(0, type.length - 1),
          shared_id: null,
          transaction_day: transactionDay,
        })

        await handleGetPreviewTransactions(new Date(`${rows[3].date}T00:00:00`))

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

        await handleGetPreviewTransactions(new Date(`${rows[3].date}T00:00:00`))
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
  }
}
