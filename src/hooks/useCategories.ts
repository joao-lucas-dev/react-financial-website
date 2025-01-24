import { DateTime } from 'luxon'
import api from '../api/axiosInstance.ts'
import { colorsMap } from '../common/constants'
import { useState } from 'react'
import { ChartData, CategoryData } from '../types/categories.ts'

export default function useCategories() {
  const [chartCategories, setChartCategories] = useState<ChartData | null>(null)

  const handleGetChartCategories = async () => {
    try {
      const date = DateTime.now()
      const startDate = date.startOf('month')
      const endDate = date.endOf('month')

      const { data } = await api.get<CategoryData[]>(
        `/categories/chart?startDate=${startDate}&endDate=${endDate}`,
      )

      const prices: number[] = []
      const labels: string[] = []
      const backgroundColor: (string | undefined)[] = []
      const hoverBackgroundColor: (string | undefined)[] = []

      data.forEach((item) => {
        prices.push(item.total)
        labels.push(item.name)
        backgroundColor.push(colorsMap.get(item.color)?.color)
        hoverBackgroundColor.push(colorsMap.get(item.color)?.hover)
      })

      setChartCategories({
        labels,
        datasets: [
          {
            data: prices,
            backgroundColor,
            hoverBackgroundColor,
          },
        ],
      })
    } catch (err) {
      console.error(err)
    }
  }

  return {
    chartCategories,
    handleGetChartCategories,
  }
}
