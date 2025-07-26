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
    <div className="w-full h-full flex items-center justify-center">
      {categories && categories.labels.length > 0 && (
        <div className="w-full h-full max-w-20 max-h-20">
          <Doughnut data={categories} options={options} />
        </div>
      )}
    </div>
  )
}

export default DonutChart
