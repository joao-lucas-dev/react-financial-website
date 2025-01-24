import { Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'
import { ChartData } from '../types/categories.ts'

interface IParams {
  categories: ChartData | null
}

const DonutChart = ({ categories }: IParams) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
  }

  return categories ? (
    <div className="h-full py-3">
      <Doughnut data={categories} options={options} />
    </div>
  ) : (
    <></>
  )
}

export default DonutChart
