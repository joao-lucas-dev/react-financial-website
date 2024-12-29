import { Doughnut } from 'react-chartjs-2'
import 'chart.js/auto'

const DonutChart = () => {
  const data = {
    labels: ['Outros', 'Ifood', 'Casa', 'Saúde', 'Compras'],
    datasets: [
      {
        data: [100, 400, 3000, 2000, 5000],
        backgroundColor: [
          '#393938',
          '#FF6384',
          '#36A2EB',
          '#4BC0C0',
          '#9966FF',
        ],
        hoverBackgroundColor: [
          '#393945',
          '#FF6384',
          '#36A2EB',
          '#4BC0C0',
          '#9966FF',
        ],
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  }

  return (
    <div className="h-full py-3">
      <Doughnut data={data} options={options} />
    </div>
  )
}

export default DonutChart
