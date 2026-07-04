'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface PieChartProps {
  data: Array<{
    name: string
    value: number
  }>
  colors?: string[]
  height?: number
  innerRadius?: number
  outerRadius?: number
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']

export function PieChart({
  data,
  colors = DEFAULT_COLORS,
  height = 350,
  innerRadius = 60,
  outerRadius = 100,
}: PieChartProps) {
  return (
    <ResponsiveContainer width='100%' height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill='#8884d8'
          dataKey='value'
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}