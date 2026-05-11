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
          <h1 className="text-xl font-bold text-foreground tracking-tight">Health</h1>
          <p className="text-foreground/60 text-sm">System vitals and biometric monitoring</p>
        </div>
        <HealthLoggingModal onSuccess={fetchData} />
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/20"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scanning Bio-metrics...</p>
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
            <div className="glass-card p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Heart size={40} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Wellness Index</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-bold text-white">{wellnessScore}</h3>
                  <span className="text-xs font-bold text-gray-600">/100</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${wellnessScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                  />
                </div>
                <p className="text-[10px] text-gray-500 font-medium mt-2 uppercase tracking-wider">System Stability: {wellnessScore > 80 ? 'Optimal' : wellnessScore > 60 ? 'Stable' : 'Critical'}</p>
              </div>
            </div>

            {/* Sleep Card */}
            <div className="glass-card p-6 flex flex-col justify-between min-h-[160px] group transition-all duration-500 hover:border-blue-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rest Cycle</p>
                  <h3 className="text-3xl font-bold text-white">{todayData.sleep_hours}h</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all duration-500">
                  <Moon size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Target: 8.0h</p>
                <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500/40" style={{ width: `${Math.min((todayData.sleep_hours / 8) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Water Card */}
            <div className="glass-card p-6 flex flex-col justify-between min-h-[160px] group transition-all duration-500 hover:border-teal-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Hydration</p>
                  <h3 className="text-3xl font-bold text-white">{todayData.water_intake_liters}L</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all duration-500">
                  <Droplets size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Target: 2.5L</p>
                <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-teal-500/40" style={{ width: `${Math.min((todayData.water_intake_liters / 2.5) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Steps Card */}
            <div className="glass-card p-6 flex flex-col justify-between min-h-[160px] group transition-all duration-500 hover:border-green-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Kinetic Energy</p>
                  <h3 className="text-3xl font-bold text-white">{todayData.steps.toLocaleString()}</h3>
                  <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-1">Steps accumulated</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-all duration-500">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${todayData.workout_completed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`}></div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {todayData.workout_completed ? 'Workout Sequence Complete' : 'Awaiting Workout Data'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mood Card */}
            <div className="glass-card p-6 flex flex-col justify-between min-h-[160px] group transition-all duration-500 hover:border-purple-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Neural State</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{todayData.mood}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all duration-500">
                  <Activity size={20} />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Current cognitive status</p>
              </div>
            </div>

          </div>

          <HealthInsights data={healthData} />
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Biometric Analytics</h2>
            <div className="glass-card p-8">
              <HealthCharts data={healthData} />
            </div>
          </div>

        </motion.div>
      )}
    </div>
  )
}
