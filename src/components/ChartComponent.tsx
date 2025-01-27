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

  return (
    <div className="h-full py-3">
      {categories && categories.labels.length > 0 ? (
        <Doughnut data={categories} options={options} />
      ) : (
        <h3 className="flex justify-center items-center h-full">
          Sem categorias
        </h3>
      )}
    </div>
  )
}

export default DonutChart
