import React from 'react'
import { ICategory } from './categories.ts'

export type IType = {
  total: number
  type: 'income' | 'outcome' | 'remaining'
  percentage: number
  status: 'positive' | 'negative' | 'zero'
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
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual'

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

// Tipos para faturas de cartão de crédito
export interface IInvoice {
  id: string
  invoice_date: string
  is_paid: boolean
  paid_date?: string
}

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
  card_id?: string
  fromCreditCard?: boolean
  installment_info?: string
  installments?: number
  is_paid?: boolean
  paid_date?: string
  is_recurring?: boolean
  recurrence_pattern?: RecurrenceType
  recurrence_interval?: number
  start_date?: string
  end_date?: string | Date
  parent_transaction_id?: string
  installment_count?: number
  installment_all?: number
  invoice?: IInvoice | null
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
  setCurrentMonth?: React.Dispatch<
    React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >,
  from?: string,
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

export type EditMode = 'instance_only' | 'instance_and_future' | 'all_instances'
export type InstallmentEditMode = 'installment_only' | 'installment_and_future' | 'all_installments'

export type IHandleUpdateRecurringTransaction = (
  updateTransaction: ITransaction,
  editMode: EditMode,
  currentMonth: number,
  setCurrentMonth: React.Dispatch<
    React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >,
  from: string,
) => Promise<void>

export type IHandleDeleteRecurringTransaction = (
  id: string,
  editMode: EditMode,
  currentMonth: number,
  setCurrentMonth: React.Dispatch<
    React.SetStateAction<2 | 1 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >,
  from: string,
) => Promise<void>

export type IHandleUpdateInstallmentTransaction = (
  updateTransaction: ITransaction,
  editMode: InstallmentEditMode,
  currentMonth: number,
  setCurrentMonth: ISetCurrentMonth,
  from: string,
) => Promise<void>

export type IHandleDeleteInstallmentTransaction = (
  id: string,
  editMode: InstallmentEditMode,
  currentMonth: number,
  setCurrentMonth: ISetCurrentMonth,
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
  button?: 'income' | 'outcome'
}>
