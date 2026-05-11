'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'

interface HealthLog {
  id: string
  sleep_hours: number
  water_intake_liters: number
  mood: string
  steps: number
  workout_completed: boolean
  log_date: string
}

export function HealthCharts({ data }: { data: HealthLog[] }) {
  // sort data by date ascending
  const sortedData = [...data].sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())

  // format date for x-axis
  const chartData = sortedData.map(log => ({
    ...log,
    dateStr: new Date(log.log_date).toLocaleDateString('en-US', { weekday: 'short' }),
    moodScore: moodToScore(log.mood)
  }))

  function moodToScore(mood: string) {
    switch (mood) {
      case 'Excellent': return 5
      case 'Good': return 4
      case 'Neutral': return 3
      case 'Stressed': return 2
      case 'Tired': return 1
      default: return 0
    }
  }

  if (chartData.length === 0) {
    return <div className="text-gray-400 text-center py-10">No data available yet. Start logging!</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sleep Trends */}
      <div className="glass p-6 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all duration-300">
        <h3 className="text-lg font-semibold mb-6 text-white">Sleep Trends (Hours)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="dateStr" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f1e', borderColor: 'rgba(6,182,212,0.2)', borderRadius: '8px' }}
                itemStyle={{ color: '#06b6d4' }}
                cursor={{ fill: 'rgba(6,182,212,0.1)' }}
              />
              <Bar dataKey="sleep_hours" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hydration Trends */}
      <div className="glass p-6 rounded-2xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
        <h3 className="text-lg font-semibold mb-6 text-white">Hydration Trends (Liters)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="dateStr" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f1e', borderColor: 'rgba(59,130,246,0.2)', borderRadius: '8px' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="water_intake_liters" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWater)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity & Steps */}
      <div className="glass p-6 rounded-2xl border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.05)] hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all duration-300">
        <h3 className="text-lg font-semibold mb-6 text-white">Steps Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="dateStr" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f1e', borderColor: 'rgba(34,197,94,0.2)', borderRadius: '8px' }}
                itemStyle={{ color: '#22c55e' }}
              />
              <Line type="monotone" dataKey="steps" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#0f0f1e' }} activeDot={{ r: 6, fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Trends */}
      <div className="glass p-6 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all duration-300">
        <h3 className="text-lg font-semibold mb-6 text-white">Mood Trends</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="dateStr" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(val) => {
                  if (val === 5) return 'Exc'
                  if (val === 4) return 'Good'
                  if (val === 3) return 'Neu'
                  if (val === 2) return 'Str'
                  if (val === 1) return 'Tir'
                  return ''
                }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f0f1e', borderColor: 'rgba(168,85,247,0.2)', borderRadius: '8px' }}
                itemStyle={{ color: '#a855f7' }}
                formatter={(value: any, name: any, props: any) => [props.payload.mood, 'Mood']}
              />
              <Line type="step" dataKey="moodScore" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7', strokeWidth: 2, stroke: '#0f0f1e' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
