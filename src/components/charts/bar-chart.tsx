'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarChartProps {
  data: any[]
  xKey: string
  bars: {
    key: string
    name: string
    color: string
  }[]
  height?: number
}

export function BarChart({ data, xKey, bars, height = 350 }: BarChartProps) {
  return (
    <ResponsiveContainer width='100%' height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
