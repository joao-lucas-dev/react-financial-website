import { DateTime } from 'luxon'
import { colorsMap } from '../common/constants'
import { useCallback, useEffect, useState } from 'react'
import { CategoryChartData, ICategory } from '../types/categories.ts'
import useAxiosPrivate from './useAxiosPrivate.tsx'

export default function useCategories() {
  const axiosPrivate = useAxiosPrivate()
  const [categories, setCategories] = useState<ICategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [chartCategories, setChartCategories] = useState({
    notIncome: {
      config: [] as ICategory[],
      total: 0,
      chartConfig: {
        labels: ['sem valor'],
        datasets: [
          {
            data: [0],
            backgroundColor: ['#000'],
            hoverBackgroundColor: ['#000'],
          },
        ],
      },
    },
    income: {
      config: [] as ICategory[],
      total: 0,
      chartConfig: {
        labels: ['sem valor'],
        datasets: [
          {
            data: [0],
            backgroundColor: ['#000'],
            hoverBackgroundColor: ['#000'],
          },
        ],
      },
    },
  })

  const handleGetChartCategories = useCallback(
    async (date = DateTime.now()) => {
      try {
        const startDate = date.startOf('month')
        const endDate = date.endOf('month')

        const { data } = await axiosPrivate.get<CategoryChartData>(
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

        data.notIncome.config.forEach((item) => {
          pricesNotIncome.push(item.total || 0)
          labelsNotIncome.push(item.name)
          backgroundColorNotIncome.push(colorsMap.get(item.color)?.color)
          hoverBackgroundColorNotIncome.push(colorsMap.get(item.color)?.hover)
        })

        data.income.config.forEach((item) => {
          pricesIncome.push(item.total || 0)
          labelsIncome.push(item.name)
          backgroundColorIncome.push(colorsMap.get(item.color)?.color)
          hoverBackgroundColorIncome.push(colorsMap.get(item.color)?.hover)
        })

        setChartCategories({
          notIncome: {
            config: data.notIncome.config,
            total: data.notIncome.total,
            chartConfig: {
              labels: labelsNotIncome,
              datasets: [
                {
                  data: pricesNotIncome,
                  // @ts-expect-error TS2322
                  backgroundColor: backgroundColorNotIncome,
                  // @ts-expect-error TS2322
                  hoverBackgroundColor: hoverBackgroundColorNotIncome,
                },
              ],
            },
          },
          income: {
            config: data.income.config,
            total: data.income.total,
            chartConfig: {
              labels: labelsIncome,
              datasets: [
                {
                  data: pricesIncome,
                  // @ts-expect-error TS2322
                  backgroundColor: backgroundColorIncome,
                  // @ts-expect-error TS2322
                  hoverBackgroundColor: hoverBackgroundColorIncome,
                },
              ],
            },
          },
        })
      } catch (err) {
        console.error(err)
      }
    },
    [axiosPrivate],
  )

  const getCategories = useCallback(async (retryCount = 0) => {
    try {
      setIsLoadingCategories(true)
      setCategoriesError(null)
      const { data } = await axiosPrivate.get('/categories')
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
      setCategoriesError('Erro ao carregar categorias')
      // Retry once after 1 second, max 2 retries
      if (retryCount < 2) {
        setTimeout(() => {
          getCategories(retryCount + 1)
        }, 1000)
      }
    } finally {
      setIsLoadingCategories(false)
    }
  }, [axiosPrivate])

  useEffect(() => {
    getCategories()
  }, [getCategories])

  return {
    chartCategories,
    handleGetChartCategories,
    categories,
    isLoadingCategories,
    categoriesError,
    retryCategories: getCategories,
  }
}
