interface IShared {
  name: string
  profileImage: string
}

export type IItem = {
  id: string
  description: string
  price: string
  category: string
  shared?: IShared
  createdAt: string
  transaction_day: string
}

interface IRow {
  valueFormatted: string
  value: number
  color?: string
  transactions: IItem[]
}

export type ITransaction = {
  id: number
  formatted_date: string
  date: string
  isToday?: boolean
  incomes: IRow
  outcomes: IRow
  dailies: IRow
  total: {
    valueFormatted: string
    value: number
    good_value: number
    warn_value: number
  }
}
