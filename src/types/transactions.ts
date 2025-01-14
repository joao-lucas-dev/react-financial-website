interface IShared {
  name: string
  profileImage: string
}

export type ITransaction = {
  id: string
  description: string
  price: string | number
  categoryId: number
  shared?: IShared
  createdAt?: string
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
