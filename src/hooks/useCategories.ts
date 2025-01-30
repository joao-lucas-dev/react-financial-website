import { DateTime } from 'luxon'
import api from '../api/axiosInstance.ts'
import { colorsMap } from '../common/constants'
import { useState } from 'react'
import { ChartData, CategoryData } from '../types/categories.ts'

export default function useCategories() {
  const [chartCategories, setChartCategories] = useState({
    notIncome: {
      labels: ['sem valor'],
      datasets: [
        {
          data: [0],
          backgroundColor: ['#000'],
          hoverBackgroundColor: ['#000'],
        },
      ],
    },
    income: {
      labels: ['sem valor'],
      datasets: [
        {
          data: [0],
          backgroundColor: ['#000'],
          hoverBackgroundColor: ['#000'],
        },
      ],
    },
  })

  const handleGetChartCategories = async () => {
    try {
      const date = DateTime.now()
      const startDate = date.startOf('month')
      const endDate = date.endOf('month')

      const { data } = await api.get<CategoryData>(
        `/categories/chart?startDate=${startDate}&endDate=${endDate}`,
      )

      const pricesNotIncome: number[] = []
      const pricesIncome: number[] = []
      const labelsNotIncome: string[] = []
      const labelsIncome: string[] = []
      const backgroundColorNotIncome: (string | undefined)[] = []
      const backgroundColorIncome: (string | undefined)[] = []
      const hoverBackgroundColorNotIncome: (string | undefined)[] = []
      const hoverBackgroundColorIncome: (string | undefined)[] = []

      data.notIncome.forEach((item) => {
        pricesNotIncome.push(item.total)
        labelsNotIncome.push(item.name)
        backgroundColorNotIncome.push(colorsMap.get(item.color)?.color)
        hoverBackgroundColorNotIncome.push(colorsMap.get(item.color)?.hover)
      })

      data.income.forEach((item) => {
        pricesIncome.push(item.total)
        labelsIncome.push(item.name)
        backgroundColorIncome.push(colorsMap.get(item.color)?.color)
        hoverBackgroundColorIncome.push(colorsMap.get(item.color)?.hover)
      })

      setChartCategories({
        notIncome: {
          labels: labelsNotIncome,
          datasets: [
            {
              data: pricesNotIncome,
              backgroundColor: backgroundColorNotIncome,
              hoverBackgroundColor: hoverBackgroundColorNotIncome,
            },
          ],
        },
        income: {
          labels: labelsIncome,
          datasets: [
            {
              data: pricesIncome,
              backgroundColor: backgroundColorIncome,
              hoverBackgroundColor: hoverBackgroundColorIncome,
            },
          ],
        },
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
