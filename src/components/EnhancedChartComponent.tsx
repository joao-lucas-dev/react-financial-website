import React from 'react'
import PerfectDonutChart from './PerfectDonutChart'
import { ChartData } from '../types/categories'

interface EnhancedChartComponentProps {
  categories: ChartData | null
  size?: number
}

const EnhancedChartComponent: React.FC<EnhancedChartComponentProps> = ({ 
  categories, 
  size = 180 
}) => {
  
  if (!categories || !categories.labels || categories.labels.length === 0) {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <p style={{ color: '#A0A0A0', fontSize: '0.875rem' }}>
          Sem dados disponíveis
        </p>
      </div>
    )
  }

  // Convert Chart.js format to our custom format
  const chartData = categories.labels.map((label, index) => {
    const value = categories.datasets[0]?.data[index] || 0
    const color = categories.datasets[0]?.backgroundColor[index] || '#009688'
    
    return {
      label: label,
      value: Number(value), // Ensure it's a number
      color: color
    }
  }).filter(item => item.value > 0) // Remove items with zero values


  return (
    <div className="w-full h-full flex items-center justify-center">
      <PerfectDonutChart 
        data={chartData} 
        size={size}
        innerRadius={0.65}
      />
    </div>
  )
}

export default EnhancedChartComponent