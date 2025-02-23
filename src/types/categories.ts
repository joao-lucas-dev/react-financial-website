export type ICategory = {
  color: string
  iconName: string
  icon_name: string
  id: number
  name: string
  type: string
}

export type IValue = {
  name: string
  total: number
  color: string
}

export interface CategoryData {
  notIncome: IValue[]
  income: IValue[]
}

export interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: (string | undefined)[]
    hoverBackgroundColor: (string | undefined)[]
  }[]
}
