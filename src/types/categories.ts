export interface CategoryData {
  name: string
  total: number
  color: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: (string | undefined)[]
    hoverBackgroundColor: (string | undefined)[]
  }[]
}
