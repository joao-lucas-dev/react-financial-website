import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDataPoint {
  month: string;
  income: number;
  outcome: number;
  balance: number;
}

interface AnimatedLineChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
}

const AnimatedLineChart: React.FC<AnimatedLineChartProps> = ({ 
  data, 
  width = 800, 
  height = 400 
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 100);

    return () => clearTimeout(timer);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-500">
        Nenhum dado disponível
      </div>
    );
  }

  // Calculate chart dimensions
  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min/max values for scaling
  const allValues = data.flatMap(d => [d.income, d.outcome]);
  const maxValue = Math.max(...allValues) * 1.1; // Add 10% padding
  const minValue = Math.min(0, Math.min(...allValues)) * 1.1;
  const valueRange = maxValue - minValue;

  // Create scale functions
  const xScale = (index: number) => (index / (data.length - 1)) * chartWidth + padding;
  const yScale = (value: number) => height - padding - ((value - minValue) / valueRange) * chartHeight;

  // Generate path strings
  const createPath = (values: number[], animated = false) => {
    if (values.length === 0) return '';
    
    const animatedValues = animated 
      ? values.map((_, index) => index <= (data.length - 1) * animationProgress ? values[index] : values[0])
      : values;

    let path = `M ${xScale(0)} ${yScale(animatedValues[0])}`;
    
    for (let i = 1; i < animatedValues.length; i++) {
      const currentIndex = animated ? Math.min(i, Math.floor((data.length - 1) * animationProgress)) : i;
      if (currentIndex < animatedValues.length) {
        path += ` L ${xScale(currentIndex)} ${yScale(animatedValues[currentIndex])}`;
      }
    }
    
    return path;
  };

  const incomeValues = data.map(d => d.income);
  const outcomeValues = data.map(d => d.outcome);
  const balanceValues = data.map(d => d.balance);

  const incomePath = createPath(incomeValues, true);
  const outcomePath = createPath(outcomeValues, true);
  const balancePath = createPath(balanceValues, true);

  // Create gradient area paths
  const createAreaPath = (values: number[], animated = false) => {
    const path = createPath(values, animated);
    if (!path) return '';
    
    const lastIndex = animated ? Math.floor((data.length - 1) * animationProgress) : data.length - 1;
    const zeroY = yScale(0);
    
    return `${path} L ${xScale(lastIndex)} ${zeroY} L ${xScale(0)} ${zeroY} Z`;
  };

  const incomeAreaPath = createAreaPath(incomeValues, true);
  const outcomeAreaPath = createAreaPath(outcomeValues, true);

  return (
    <div className="w-full">
      <svg 
        width={width} 
        height={height} 
        className="overflow-visible"
        style={{ background: 'transparent' }}
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="outcomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * chartHeight;
          const value = maxValue - ratio * valueRange;
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="currentColor"
                opacity="0.6"
              >
                {value.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((item, index) => (
          <text
            key={index}
            x={xScale(index)}
            y={height - padding + 20}
            textAnchor="middle"
            fontSize="12"
            fill="currentColor"
            opacity="0.6"
          >
            {item.month}
          </text>
        ))}

        {/* Area fills */}
        {incomeAreaPath && (
          <path
            d={incomeAreaPath}
            fill="url(#incomeGradient)"
            opacity="0.6"
          />
        )}
        
        {outcomeAreaPath && (
          <path
            d={outcomeAreaPath}
            fill="url(#outcomeGradient)"
            opacity="0.6"
          />
        )}

        {/* Lines */}
        <path
          d={incomePath}
          fill="none"
          stroke="rgb(34, 197, 94)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          style={{
            strokeDasharray: animationProgress < 1 ? "5,5" : "none",
            transition: "stroke-dasharray 0.5s ease-in-out"
          }}
        />
        
        <path
          d={outcomePath}
          fill="none"
          stroke="rgb(239, 68, 68)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          style={{
            strokeDasharray: animationProgress < 1 ? "5,5" : "none",
            transition: "stroke-dasharray 0.5s ease-in-out"
          }}
        />

        <path
          d={balancePath}
          fill="none"
          stroke="rgb(20, 184, 166)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8,4"
          opacity="0.8"
        />

        {/* Data points */}
        {data.map((item, index) => {
          if (index > (data.length - 1) * animationProgress) return null;
          
          return (
            <g key={index}>
              {/* Income point */}
              <circle
                cx={xScale(index)}
                cy={yScale(item.income)}
                r={hoveredPoint === index ? 6 : 4}
                fill="rgb(34, 197, 94)"
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  filter: hoveredPoint === index ? "url(#glow)" : "none"
                }}
              />
              
              {/* Outcome point */}
              <circle
                cx={xScale(index)}
                cy={yScale(item.outcome)}
                r={hoveredPoint === index ? 6 : 4}
                fill="rgb(239, 68, 68)"
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{
                  filter: hoveredPoint === index ? "url(#glow)" : "none"
                }}
              />

              {/* Balance point */}
              <circle
                cx={xScale(index)}
                cy={yScale(item.balance)}
                r={hoveredPoint === index ? 5 : 3}
                fill="rgb(20, 184, 166)"
                stroke="white"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoveredPoint !== null && (
          <g>
            <foreignObject
              x={xScale(hoveredPoint) - 80}
              y={yScale(Math.max(data[hoveredPoint].income, data[hoveredPoint].outcome)) - 100}
              width="160"
              height="80"
            >
              <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-lg p-3 shadow-lg">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm mb-2">
                  {data[hoveredPoint].month}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 dark:text-green-400">Receitas:</span>
                    <span className="font-semibold">
                      {data[hoveredPoint].income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-600 dark:text-red-400">Despesas:</span>
                    <span className="font-semibold">
                      {data[hoveredPoint].outcome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-600 pt-1">
                    <span className="text-teal-600 dark:text-teal-400">Saldo:</span>
                    <span className={`font-bold ${
                      data[hoveredPoint].balance >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {data[hoveredPoint].balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>
            </foreignObject>
          </g>
        )}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
            <TrendingUp size={14} />
            Receitas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
            <TrendingDown size={14} />
            Despesas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-teal-500 rounded-full"></div>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Saldo
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLineChart;