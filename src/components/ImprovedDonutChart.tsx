import React from 'react'

interface ChartDataItem {
  label: string
  value: number
  color: string
}

interface ImprovedDonutChartProps {
  data: ChartDataItem[]
  size?: number
  innerRadius?: number
}

const ImprovedDonutChart: React.FC<ImprovedDonutChartProps> = ({ 
  data, 
  size = 200, 
  innerRadius = 0.6 
}) => {
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
  const centerX = size / 2
  const centerY = size / 2
  const outerRadius = size / 2 - 10
  const innerRadiusPixels = outerRadius * innerRadius
  
  let currentAngle = -Math.PI / 2 // Start from top

  const createSlicePath = (value: number, startAngle: number, isFullCircle = false) => {
    const angle = (value / total) * 2 * Math.PI
    
    // Special case for full circle (100%)
    if (isFullCircle || angle >= 2 * Math.PI - 0.001) {
      return `
        M ${centerX + outerRadius} ${centerY}
        A ${outerRadius} ${outerRadius} 0 1 1 ${centerX + outerRadius - 0.001} ${centerY}
        L ${centerX + innerRadiusPixels - 0.001} ${centerY}
        A ${innerRadiusPixels} ${innerRadiusPixels} 0 1 0 ${centerX + innerRadiusPixels} ${centerY}
        Z
      `
    }
    
    const endAngle = startAngle + angle

    // Outer arc points
    const x1 = centerX + outerRadius * Math.cos(startAngle)
    const y1 = centerY + outerRadius * Math.sin(startAngle)
    const x2 = centerX + outerRadius * Math.cos(endAngle)
    const y2 = centerY + outerRadius * Math.sin(endAngle)

    // Inner arc points
    const x3 = centerX + innerRadiusPixels * Math.cos(endAngle)
    const y3 = centerY + innerRadiusPixels * Math.sin(endAngle)
    const x4 = centerX + innerRadiusPixels * Math.cos(startAngle)
    const y4 = centerY + innerRadiusPixels * Math.sin(startAngle)

    const largeArcFlag = angle > Math.PI ? 1 : 0

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadiusPixels} ${innerRadiusPixels} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `
  }

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = item.value / total
          const isFullCircle = data.length === 1 || percentage >= 0.999
          const path = createSlicePath(item.value, currentAngle, isFullCircle)
          
          // Calculate text position
          const midAngle = isFullCircle ? 0 : currentAngle + (item.value / total) * Math.PI
          const textRadius = (outerRadius + innerRadiusPixels) / 2
          const textX = centerX + textRadius * Math.cos(midAngle)
          const textY = centerY + textRadius * Math.sin(midAngle)
          
          currentAngle += (item.value / total) * 2 * Math.PI
          
          return (
            <g key={index}>
              {/* Segment */}
              <path
                d={path}
                fill={item.color}
                stroke="white"
                strokeWidth={2}
                className="hover:opacity-80 transition-all duration-200 cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
              
              {/* Percentage text - show for single item or large segments */}
              {(isFullCircle || percentage > 0.08) && (
                <text
                  x={isFullCircle ? centerX : textX}
                  y={isFullCircle ? centerY + 30 : textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isFullCircle ? "#424242" : "white"}
                  fontSize={isFullCircle ? "12" : "11"}
                  fontWeight="600"
                  className="pointer-events-none"
                  style={{
                    textShadow: isFullCircle ? 'none' : '0 1px 2px rgba(0,0,0,0.5)'
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
          r={innerRadiusPixels - 4}
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

export default ImprovedDonutChart