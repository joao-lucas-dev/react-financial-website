import React from 'react'
import { ICategory } from './categories.ts'

export type IType = {
  total: number
  type: 'income' | 'outcome' | 'remaining'
  percentage: number
}

export interface IOverview {
  income: IType
  outcome: IType
  remaining: IType
}

interface IShared {
  name: string
  profileImage: string
}

// Tipos para modo de transação
export type TransactionMode = 'single' | 'recurring' | 'installments'

// Tipos para sistema de recorrência (infinita)
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'yearly'

// Tipos para sistema de parcelas (com fim)
export type InstallmentPeriod = 'monthly' | 'quarterly' | 'biannually' | 'yearly'

export interface InstallmentConfig {
  count: number                    // Número de parcelas (2-60)
  period: InstallmentPeriod       // Período entre parcelas
  installmentValue: number        // Valor de cada parcela
  dates: string[]                 // Datas das parcelas
}

export interface SimpleInstallmentConfig {
  count: number                   // Número de parcelas
  period: InstallmentPeriod      // Período entre parcelas
  installmentValue: number       // Valor de cada parcela
  endDate: string                // Data de fim das parcelas
}

// Tipos para sistema de pagamento
export type PaymentStatus = 'paid' | 'unpaid' | 'pending'

export type ITransaction = {
  id?: string | undefined
  category_id: string
  description: string
  price: string | number
  category: ICategory
  shared?: IShared
  created_at?: string
  updated_at?: string
  transaction_day: string
  type?: 'income' | 'outcome'
  is_recurring?: boolean
  // Campo para vincular transação ao cartão de crédito
  card_id?: string
  // Novos campos para sistema de pagamento
  is_paid?: boolean
  paid_date?: string
  payment_status?: PaymentStatus
  // Modo da transação
  transaction_mode?: TransactionMode
  // Campos para recorrência (infinita)
  recurrence_type?: RecurrenceType
  recurrence_interval?: number
  next_occurrence?: string
  // Campos para parcelas (com fim)
  installment_count?: number        // Número total de parcelas
  installment_current?: number      // Parcela atual (1, 2, 3...)
  installment_value?: number        // Valor de cada parcela
  installment_period?: InstallmentPeriod // Período entre parcelas
  installment_end_date?: string     // Data de fim das parcelas
  parent_transaction_id?: string    // ID da transação pai (para parcelas)
}

interface IColumn {
  valueFormatted: string
  value: number
  transactions: ITransaction[]
}

export type IRow = {
  id: number
  formatted_date: string
  date: string
  isToday?: boolean
  incomes: IColumn
  outcomes: IColumn
  total: {
    valueFormatted: string
    value: number
    good_value: number
    warn_value: number
  }
}

export type IHandleCreateTransaction = (
  type: 'incomes' | 'outcomes',
  row: IRow,
  value: { formattedValue: string; originalValue: number },
  setValue: React.Dispatch<
    React.SetStateAction<{ formattedValue: string; originalValue: number }>
  >,
  currentMonth: number,
  setCurrentMonth: React.Dispatch<
    React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >,
  from?: string,
) => Promise<void>

export type IHandleCreateCompleteTransaction = (
  createTransaction: ITransaction,
  currentMonth: number,
  setCurrentMonth: React.Dispatch<
    React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >,
) => Promise<void>

export type IHandleUpdateTransaction = (
  updateTransaction: ITransaction,
  currentMonth: number,
  setCurrentMonth: React.Dispatch<
    React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >,
  from: string,
) => Promise<void>

export type IHandleDeleteTransaction = (
  id?: string | undefined,
  // @ts-expect-error TS1016
  currentMonth: number,
  setCurrentMonth: React.Dispatch<
    React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >,
  from: string,
) => Promise<void>

export type ISetCurrentMonth = React.Dispatch<
  React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
>

export type IOpenModal = {
  isOpen: boolean
  transaction: ITransaction
  type: string
  button?: string
}

export type ISetOpenModal = React.Dispatch<{
  isOpen: boolean
  transaction: ITransaction
  type: string
}>
