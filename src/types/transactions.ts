import React from 'react'
import { ICategory } from './categories.ts'

export type IType = {
  total: number
  type: 'income' | 'outcome' | 'daily'
  percentage: number
}

export interface IOverview {
  income: IType
  outcome: IType
  daily: IType
}

interface IShared {
  name: string
  profileImage: string
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
  transaction_day: string | Date
  type?: 'income' | 'outcome' | 'daily'
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
  dailies: IColumn
  total: {
    valueFormatted: string
    value: number
    good_value: number
    warn_value: number
  }
}

export type IHandleCreateTransaction = (
  type: 'incomes' | 'outcomes' | 'dailies',
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
