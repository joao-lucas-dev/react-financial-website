import React from 'react'

interface ChartDataItem {
  label: string
  value: number
  color: string
}

interface PerfectDonutChartProps {
  data: ChartDataItem[]
  size?: number
  innerRadius?: number
}

const PerfectDonutChart: React.FC<PerfectDonutChartProps> = ({ 
  data, 
  size = 200, 
  innerRadius = 0.65 
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
  const outerRadius = size / 2 - 20 // Mais margem para não cortar
  const innerRadiusPixels = outerRadius * innerRadius
  
  // ALGORITMO ESPECIAL PARA ITEM ÚNICO (100%)
  if (data.length === 1) {
    const singleItem = data[0]
    
    return (
      <div className="flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring para consistência visual */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill="none"
            stroke="#F0F0F0"
            strokeWidth={outerRadius - innerRadiusPixels}
            opacity="0.3"
          />
          
          {/* Círculo principal colorido */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill="none"
            stroke={singleItem.color}
            strokeWidth={outerRadius - innerRadiusPixels}
            strokeLinecap="round"
            className="hover:opacity-80 transition-all duration-300 cursor-pointer"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              strokeDasharray: `${2 * Math.PI * outerRadius}`,
              strokeDashoffset: 0,
              animation: 'none'
            }}
          />
          
          {/* Círculo interno limpo */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadiusPixels - 4}
            fill="white"
            style={{
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Texto da porcentagem no anel - igual múltiplas categorias */}
          <text
            x={centerX}
            y={centerY - (outerRadius + innerRadiusPixels) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="12"
            fontWeight="600"
            className="pointer-events-none"
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            100%
          </text>
          
          {/* Texto central */}
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
  
  // ALGORITMO PARA MÚLTIPLOS ITENS
  let currentAngle = -Math.PI / 2 // Começar do topo
  
  const createSlicePath = (value: number, startAngle: number) => {
    const sweepAngle = (value / total) * 2 * Math.PI
    const endAngle = startAngle + sweepAngle

    // Pontos do arco externo
    const x1 = centerX + outerRadius * Math.cos(startAngle)
    const y1 = centerY + outerRadius * Math.sin(startAngle)
    const x2 = centerX + outerRadius * Math.cos(endAngle)
    const y2 = centerY + outerRadius * Math.sin(endAngle)

    // Pontos do arco interno
    const x3 = centerX + innerRadiusPixels * Math.cos(endAngle)
    const y3 = centerY + innerRadiusPixels * Math.sin(endAngle)
    const x4 = centerX + innerRadiusPixels * Math.cos(startAngle)
    const y4 = centerY + innerRadiusPixels * Math.sin(startAngle)

    // Flag para arco grande (> 180°)
    const largeArcFlag = sweepAngle > Math.PI ? 1 : 0

    return `
      M ${x1} ${y1}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadiusPixels} ${innerRadiusPixels} 0 ${largeArcFlag} 0 ${x4} ${y4}
      Z
    `.trim().replace(/\\s+/g, ' ')
  }

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Segmentos múltiplos */}
        {data.map((item, index) => {
          const percentage = item.value / total
          const path = createSlicePath(item.value, currentAngle)
          
          // Posição do texto no meio do segmento - mais conservadora
          const midAngle = currentAngle + (item.value / total) * Math.PI
          const textRadius = (outerRadius + innerRadiusPixels) / 2
          const textX = centerX + textRadius * Math.cos(midAngle)
          const textY = centerY + textRadius * Math.sin(midAngle)
          
          currentAngle += (item.value / total) * 2 * Math.PI
          
          return (
            <g key={`segment-${index}`}>
              {/* Segmento */}
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
              
              {/* Texto da porcentagem - apenas para segmentos grandes */}
              {percentage > 0.12 && (
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="600"
                  className="pointer-events-none"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  {Math.round(percentage * 100)}%
                </text>
              )}
            </g>
          )
        })}
        
        {/* Centro branco */}
        <circle
          cx={centerX}
          cy={centerY}
          r={innerRadiusPixels - 2}
          fill="white"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
          }}
        />
        
        {/* Texto central */}
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

export default PerfectDonutChart