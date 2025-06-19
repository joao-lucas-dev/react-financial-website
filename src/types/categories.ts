export type ICategory = {
  color: string
  iconName: string
  icon_name: string
  id: number
  name: string
  type: string
  percentage?: string
  total?: number
}

export interface CategoryData {
  notIncome: ICategory[]
  income: ICategory[]
}

export interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: (string | undefined)[]
    hoverBackgroundColor: (string | undefined)[]
  }[]
}
