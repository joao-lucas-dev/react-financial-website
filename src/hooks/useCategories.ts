import { DateTime } from 'luxon'
import { colorsMap } from '../common/constants'
import { useCallback, useEffect, useState } from 'react'
import { CategoryData, ICategory } from '../types/categories.ts'
import useAxiosPrivate from './useAxiosPrivate.tsx'

export default function useCategories() {
  const axiosPrivate = useAxiosPrivate()
  const [categories, setCategories] = useState<ICategory[]>([])

  const [chartCategories, setChartCategories] = useState({
    notIncome: {
      config: [] as ICategory[],
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
    async (date = DateTime.now(), limited = true) => {
      try {
        const startDate = date.startOf('month')
        const endDate = date.endOf('month')

        const { data } = await axiosPrivate.get<CategoryData>(
          `/categories/overview/chart?startDate=${startDate}&endDate=${endDate}&limited=${limited}`,
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
            config: data.notIncome,
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
            config: data.income,
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

  const getCategories = useCallback(async () => {
    const { data } = await axiosPrivate.get('/categories')
    setCategories(data)
  }, [setCategories, axiosPrivate])

  useEffect(() => {
    getCategories()
  }, [])

  return {
    chartCategories,
    handleGetChartCategories,
    categories,
  }
}
