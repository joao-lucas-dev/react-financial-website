import { Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import { ChartData } from '../types/categories.ts'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
ChartJS.register(ArcElement, Tooltip, Legend)

interface IParams {
  categories: ChartData | null
}

const DonutChart = ({ categories }: IParams) => {
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw as number
            return `R$ ${value.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}`
          },
        },
      },
      legend: {
        display: false,
      },
    },
  }

  return (
    <div className="h-full py-3">
      {categories && categories.labels.length > 0 ? (
        <Doughnut data={categories} options={options} />
      ) : (
        <h3 className="flex justify-center items-center text-[#A0A0A0] h-full dark:text-softGray">
          Sem valores registrados
        </h3>
      )}
    </div>
  )
}

export default DonutChart
