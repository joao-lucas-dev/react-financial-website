import React from 'react'

interface ChartDataItem {
  label: string
  value: number
  color: string
}

interface CustomDonutChartProps {
  data: ChartDataItem[]
  size?: number
  strokeWidth?: number
}

const CustomDonutChart: React.FC<CustomDonutChartProps> = ({ 
  data, 
  size = 180, 
  strokeWidth = 24 
}) => {
  console.log('CustomDonutChart received data:', data)
  
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center rounded-full border-4 border-gray-100"
        style={{ width: size, height: size }}
      >
        <p style={{ color: '#A0A0A0', fontSize: '0.875rem' }}>
          Sem dados
        </p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  console.log('Total calculated:', total)
  
  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - strokeWidth / 2
  
  let cumulativePercentage = 0

  const createArcPath = (percentage: number, startPercentage: number) => {
    console.log(`Creating arc: percentage=${percentage}, startPercentage=${startPercentage}`)
    
    const startAngle = startPercentage * 2 * Math.PI - Math.PI / 2
    const endAngle = (startPercentage + percentage) * 2 * Math.PI - Math.PI / 2
    
    const x1 = centerX + radius * Math.cos(startAngle)
    const y1 = centerY + radius * Math.sin(startAngle)
    const x2 = centerX + radius * Math.cos(endAngle)
    const y2 = centerY + radius * Math.sin(endAngle)
    
    const largeArcFlag = percentage > 0.5 ? 1 : 0
    
    // If the arc is very small, just return a line
    if (percentage < 0.001) {
      return `M ${x1} ${y1} L ${x2} ${y2}`
    }
    
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
    console.log('Generated path:', path)
    return path
  }

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#F0F0F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = item.value / total
          console.log(`Item ${index}: ${item.label}, value=${item.value}, percentage=${percentage}`)
          
          const path = createArcPath(percentage, cumulativePercentage)
          
          // Calculate text position
          const midPercentage = cumulativePercentage + percentage / 2
          const textAngle = midPercentage * 2 * Math.PI - Math.PI / 2
          const textRadius = radius * 0.75
          const textX = centerX + textRadius * Math.cos(textAngle)
          const textY = centerY + textRadius * Math.sin(textAngle)
          
          cumulativePercentage += percentage
          
          return (
            <g key={index}>
              {/* Segment */}
              <path
                d={path}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="hover:opacity-80 transition-all duration-200 cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
              
              {/* Percentage text - only show if segment is large enough */}
              {percentage > 0.08 && (
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#424242"
                  fontSize="11"
                  fontWeight="600"
                  className="pointer-events-none"
                  style={{
                    filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))'
                  }}
                >
                  {Math.round(percentage * 100)}%
                </text>
              )}
            </g>
          )
        })}
        
        {/* Center content */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth / 2 - 4}
          fill="white"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
          }}
        />
        
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#424242"
          fontSize="14"
          fontWeight="600"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#616161"
          fontSize="10"
          fontWeight="500"
        >
          {total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0
          })}
        </text>
      </svg>
    </div>
  )
}

export default CustomDonutChart