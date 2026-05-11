'use client'

import { Lightbulb, TrendingUp, AlertCircle, Droplets, Moon } from 'lucide-react'

interface HealthLog {
  id: string
  sleep_hours: number
  water_intake_liters: number
  mood: string
  steps: number
  workout_completed: boolean
  log_date: string
}

export function HealthInsights({ data }: { data: HealthLog[] }) {
  if (data.length === 0) {
    return (
      <div className="p-6 glass rounded-2xl border border-cyan-500/20 text-center">
        <Lightbulb className="w-8 h-8 mx-auto mb-3 text-cyan-400 opacity-50" />
        <p className="text-gray-400">Log your health data to receive personalized AI insights.</p>
      </div>
    )
  }

  // Generate lightweight rule-based insights
  const insights = []
  const sortedData = [...data].sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())

  const latest = sortedData[0]
  const previous = sortedData[1]

  if (latest) {
    if (latest.water_intake_liters < 2.0) {
      insights.push({
        id: 1,
        type: 'warning',
        icon: Droplets,
        title: 'Hydration Alert',
        message: 'Your water intake is below the recommended 2.0L. Try to drink more water today.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
      })
    } else {
      insights.push({
        id: 2,
        type: 'positive',
        icon: Droplets,
        title: 'Great Hydration',
        message: 'You are meeting your daily hydration goals. Keep it up!',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
      })
    }

    if (latest.sleep_hours < 6) {
      insights.push({
        id: 3,
        type: 'warning',
        icon: Moon,
        title: 'Low Sleep Detected',
        message: 'You got less than 6 hours of sleep. Consider resting earlier tonight to recover.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20'
      })
    } else if (latest.sleep_hours >= 7) {
      insights.push({
        id: 4,
        type: 'positive',
        icon: Moon,
        title: 'Optimal Sleep',
        message: 'Great job getting 7+ hours of sleep! This boosts your recovery and focus.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20'
      })
    }

    if (previous) {
      if (latest.steps > previous.steps) {
        insights.push({
          id: 5,
          type: 'positive',
          icon: TrendingUp,
          title: 'Activity Increased',
          message: `You took more steps today (${latest.steps}) compared to your previous log.`,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20'
        })
      }
    }

    if (latest.mood === 'Stressed' || latest.mood === 'Tired') {
      insights.push({
        id: 6,
        type: 'warning',
        icon: AlertCircle,
        title: 'Check Your Stress Levels',
        message: 'You logged feeling stressed or tired. Take a 10-minute break to meditate or stretch.',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20'
      })
    }
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
        <Lightbulb className="text-yellow-400" />
        AI Wellness Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const Icon = insight.icon
          return (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border glass ${insight.border} ${insight.bg} flex items-start gap-4 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.02)]`}
            >
              <div className={`p-2 rounded-lg bg-black/30 ${insight.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <h4 className={`font-medium ${insight.color}`}>{insight.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{insight.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
