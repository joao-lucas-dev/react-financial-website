import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { colorsMap } from '../common/constants'
import { CategoryChartData, ICategory } from '../types/categories'
import useAxiosPrivate from '../hooks/useAxiosPrivate'

export const CATEGORIES_QUERY_KEYS = {
  categories: {
    list: () => ['categories', 'list'],
    chart: (date: DateTime) => ['categories', 'chart', date.toISODate()],
  }
} as const

export const useCategories = () => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.categories.list(),
    queryFn: async () => {
      const { data } = await axiosPrivate.get<ICategory[]>('/categories')
      return data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    retry: 2,
  })
}

export const useCategoriesChart = (date: DateTime = DateTime.now()) => {
  const axiosPrivate = useAxiosPrivate()
  
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEYS.categories.chart(date),
    queryFn: async () => {
      const startDate = date.startOf('month')
      const endDate = date.endOf('month')
      
      const { data } = await axiosPrivate.get<CategoryChartData>(
        `/categories/chart?startDate=${startDate}&endDate=${endDate}`
      )

      // Process chart data
      const processChartData = (categories: ICategory[]) => {
        const prices: number[] = []
        const labels: string[] = []
        const backgroundColor: (string | undefined)[] = []
        const hoverBackgroundColor: (string | undefined)[] = []

        categories.forEach((item) => {
          prices.push(item.total || 0)
          labels.push(item.name)
          backgroundColor.push(colorsMap.get(item.color)?.color)
          hoverBackgroundColor.push(colorsMap.get(item.color)?.hover)
        })

        return {
          labels,
          datasets: [{
            data: prices,
            backgroundColor,
            hoverBackgroundColor,
          }],
        }
      }

      return {
        notIncome: {
          config: data.notIncome.config,
          total: data.notIncome.total,
          chartConfig: processChartData(data.notIncome.config),
        },
        income: {
          config: data.income.config,
          total: data.income.total,
          chartConfig: processChartData(data.income.config),
        },
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}