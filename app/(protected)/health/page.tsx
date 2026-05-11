'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, Brain, Moon, Droplets, Apple, Plus, ChevronRight, AlertCircle, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HealthLoggingModal } from '@/components/health/health-logging-modal'
import { HealthCharts } from '@/components/health/health-charts'
import { HealthInsights } from '@/components/health/health-insights'
import { Progress } from '@/components/ui/progress'

interface HealthData {
  id: string
  log_date: string
  sleep_hours: number
  water_intake_liters: number
  mood: string
  steps: number
  workout_completed: boolean
}

export default function HealthPage() {
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: logs, error } = await supabase
        .from('health_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: false })

      if (logs) {
        setHealthData(logs)
      }
    } catch (err) {
      console.error('Health data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('health_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_logs',
        },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Calculate stats for today
  const todayDate = new Date().toISOString().split('T')[0]
  const todayData = healthData.find(log => log.log_date === todayDate) || {
    sleep_hours: 0,
    water_intake_liters: 0,
    mood: '-',
    steps: 0,
    workout_completed: false
  }

  // Calculate abstract "Wellness Score" out of 100
  let score = 50 // Base score
  if (todayData.sleep_hours >= 7) score += 15
  else if (todayData.sleep_hours > 0) score += 5
  
  if (todayData.water_intake_liters >= 2) score += 10
  else if (todayData.water_intake_liters > 0) score += 5

  if (todayData.steps >= 8000) score += 15
  else if (todayData.steps >= 4000) score += 5

  if (todayData.workout_completed) score += 10

  if (['Excellent', 'Good'].includes(todayData.mood)) score += 10
  if (todayData.mood === 'Stressed') score -= 10
  
  const wellnessScore = Math.min(Math.max(score, 0), 100)

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Health</h1>
          <p className="text-gray-400 text-sm">Track your health metrics and wellness</p>
        </div>
        <HealthLoggingModal onSuccess={fetchData} />
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Wellness Score Card */}
            <div className="glass rounded-xl p-6 border border-cyan-500/20">
              <p className="text-sm text-gray-400 mb-2">Wellness Score</p>
              <div className="flex items-baseline gap-2 mb-4">
                <h3 className="text-3xl font-bold text-white">{wellnessScore}</h3>
                <span className="text-sm text-gray-500">/100</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${wellnessScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" 
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{wellnessScore > 80 ? 'Optimal' : wellnessScore > 60 ? 'Stable' : 'Needs attention'}</p>
            </div>

            {/* Sleep Card */}
            <div className="glass rounded-xl p-6 border border-blue-500/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Sleep</p>
                  <h3 className="text-3xl font-bold text-white">{todayData.sleep_hours}h</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Moon size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Target: 8.0h</p>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500/40" style={{ width: `${Math.min((todayData.sleep_hours / 8) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Water Card */}
            <div className="glass rounded-xl p-6 border border-teal-500/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Water</p>
                  <h3 className="text-3xl font-bold text-white">{todayData.water_intake_liters}L</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Droplets size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Target: 2.5L</p>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500/40" style={{ width: `${Math.min((todayData.water_intake_liters / 2.5) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Steps Card */}
            <div className="glass rounded-xl p-6 border border-green-500/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Steps</p>
                  <h3 className="text-3xl font-bold text-white">{todayData.steps.toLocaleString()}</h3>
                  <p className="text-xs text-gray-500 mt-1">Steps today</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${todayData.workout_completed ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <span className="text-xs text-gray-400">
                    {todayData.workout_completed ? 'Workout completed' : 'No workout today'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mood Card */}
            <div className="glass rounded-xl p-6 border border-purple-500/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Mood</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{todayData.mood}</h3>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Activity size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500">Current mood</p>
              </div>
            </div>

          </div>

          <HealthInsights data={healthData} />
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Health Analytics</h2>
            <div className="glass rounded-xl border border-cyan-500/20 p-8">
              <HealthCharts data={healthData} />
            </div>
          </div>

        </motion.div>
      )}
    </div>
  )
}
