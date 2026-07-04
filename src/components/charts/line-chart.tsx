'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineChartProps {
  data: any[]
  xKey: string
  lines: {
    key: string
    name: string
    color: string
  }[]
  height?: number
}

export function LineChart({ data, xKey, lines, height = 350 }: LineChartProps) {
  return (
    <ResponsiveContainer width='100%' height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
        <XAxis dataKey={xKey} stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke='#888888' fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
        />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.key}
            type='monotone'
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
