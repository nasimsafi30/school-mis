"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
  { month: "Feb", revenue: 52000, expenses: 35000, profit: 17000 },
  { month: "Mar", revenue: 48000, expenses: 33000, profit: 15000 },
  { month: "Apr", revenue: 61000, expenses: 38000, profit: 23000 },
  { month: "May", revenue: 55000, expenses: 36000, profit: 19000 },
  { month: "Jun", revenue: 67000, expenses: 40000, profit: 27000 },
  { month: "Jul", revenue: 72000, expenses: 42000, profit: 30000 },
  { month: "Aug", revenue: 68000, expenses: 41000, profit: 27000 },
  { month: "Sep", revenue: 75000, expenses: 43000, profit: 32000 },
  { month: "Oct", revenue: 71000, expenses: 40000, profit: 31000 },
  { month: "Nov", revenue: 78000, expenses: 44000, profit: 34000 },
  { month: "Dec", revenue: 85000, expenses: 46000, profit: 39000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
        <p className="font-bold text-sm mb-3 text-gray-700 dark:text-gray-200">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 text-sm mb-1">
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => (
  <div className="flex justify-center gap-8 mt-4">
    {payload.map((entry: any, index: number) => (
      <div key={index} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{entry.value}</span>
      </div>
    ))}
  </div>
)

export function Overview() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monthly revenue, expenses & profit</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Profit</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} barGap={6} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Legend content={<CustomLegend />} />
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <Bar 
            dataKey="revenue" 
            name="Revenue" 
            fill="url(#revenueGradient)" 
            radius={[6, 6, 0, 0]} 
            maxBarSize={35}
          />
          <Bar 
            dataKey="expenses" 
            name="Expenses" 
            fill="url(#expensesGradient)" 
            radius={[6, 6, 0, 0]} 
            maxBarSize={35}
          />
          <Bar 
            dataKey="profit" 
            name="Profit" 
            fill="url(#profitGradient)" 
            radius={[6, 6, 0, 0]} 
            maxBarSize={35}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}