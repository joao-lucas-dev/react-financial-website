export type ICategory = {
  color: string
  icon?: string
  iconName: string
  icon_name: string
  id: number
  name: string
  type: string
  percentage?: number
  total?: number
}

export interface CategoryData {
  notIncome: ICategory[]
  income: ICategory[]
}

export interface CategoryChartData {
  notIncome: {
    config: ICategory[]
    total: number
  }
  income: {
    config: ICategory[]
    total: number
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: (string | undefined)[]
    hoverBackgroundColor: (string | undefined)[]
  }[]
}
