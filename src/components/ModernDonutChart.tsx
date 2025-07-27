import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { GraduationCap, Utensils } from "lucide-react";

const data = [
  { name: "Educação", value: 100, color: "#7986CB", icon: <GraduationCap size={16} /> },
  { name: "Alimentação", value: 100, color: "#F48FB1", icon: <Utensils size={16} /> },
];

const renderTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white rounded shadow px-3 py-1">
        <p className="text-sm text-zinc-600 font-semibold">{item.name}</p>
        <p className="text-sm text-zinc-500">R$ {item.value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function ModernDonutChart() {
  const [activeIndex, setActiveIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
        <PieChart width={170} height={170}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={45}
            outerRadius={80}
            paddingAngle={2}
            startAngle={90}
            endAngle={-270}
            onMouseLeave={onPieLeave}
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                fillOpacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3}
                stroke={activeIndex === index ? "white" : "none"}
                strokeWidth={activeIndex === index ? 3 : 0}
                cursor="pointer"
              />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
        </PieChart>
    </div>
  );
}
