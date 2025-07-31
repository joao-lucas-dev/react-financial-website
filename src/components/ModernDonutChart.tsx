import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ICategory } from "../types/categories";
import { colorsMap } from "../common/constants";

interface ModernDonutChartProps {
  data: ICategory[];
}

const renderTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-800 rounded shadow px-3 py-1 border border-zinc-200 dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-300 font-semibold">{item.name}</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          R$ {item.total?.toFixed(2)} ({item.percentage?.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function ModernDonutChart({ data = [] }: ModernDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Transform data for Recharts format with proper color mapping
  const chartData = data.map((item, index) => {
    const mappedColor = colorsMap.get(item.color);
    const fallbackColors = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#e76714', '#71717a'];
    
    return {
      ...item,
      value: item.total || 0,
      color: mappedColor?.color || item.color || fallbackColors[index % fallbackColors.length],
      hoverColor: mappedColor?.hover || item.color || fallbackColors[index % fallbackColors.length],
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-zinc-400 dark:text-zinc-500">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm">Sem dados para exibir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center transform transition-all duration-300 ease-out">
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            innerRadius={30}
            outerRadius={55}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            onMouseLeave={onPieLeave}
            onMouseEnter={onPieEnter}
            animationBegin={0}
            animationDuration={1000}
            animationEasing="ease-out"
            isAnimationActive={true}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={activeIndex === index ? entry.hoverColor : entry.color}
                fillOpacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.6}
                stroke={activeIndex === index ? "white" : "none"}
                strokeWidth={activeIndex === index ? 2 : 0}
                cursor="pointer"
                style={{
                  filter: activeIndex === index ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            content={renderTooltip}
            animationDuration={200}
            animationEasing="ease-out"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
