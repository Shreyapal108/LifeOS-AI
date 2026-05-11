'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import { createClient } from '@/lib/supabase/client'

const COLORS = ['#00d4ff', '#ff00ff', '#00ff88', '#ffaa00', '#ff0055']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [productivityData, setProductivityData] = useState<any[]>([])
  const [goalProgressData, setGoalProgressData] = useState<any[]>([])
  const [habitTrackerData, setHabitTrackerData] = useState<any[]>([])
  const [expenseData, setExpenseData] = useState<any[]>([])
  const [habitKeys, setHabitKeys] = useState<string[]>([])
  const [metrics, setMetrics] = useState({ avgProductivity: 0, studyHours: 0, habitCompletion: 0, totalSpent: 0 })

  useEffect(() => {
    fetchAnalytics()

    const supabase = createClient()
    const channel = supabase.channel('analytics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productivity_analytics' }, () => fetchAnalytics(false))
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Goal Progress
      const { data: goals } = await supabase.from('goals').select('status').eq('user_id', user.id)
      const goalCount = { completed: 0, in_progress: 0, failed: 0 }
      ;(goals || []).forEach((g: any) => {
        if (g.status === 'completed') goalCount.completed++
        else if (g.status === 'failed') goalCount.failed++
        else goalCount.in_progress++
      })
      setGoalProgressData([
        { name: 'Completed', value: goalCount.completed },
        { name: 'In Progress', value: goalCount.in_progress },
        { name: 'Failed', value: goalCount.failed },
      ].filter(d => d.value > 0))

      // Expense Breakdown (this month)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: expenses } = await supabase.from('expenses').select('*, expense_categories(name)').eq('user_id', user.id).gte('date', startOfMonth)
      const expMap: Record<string, number> = {}
      let totalExp = 0
      ;(expenses || []).forEach((e: any) => {
        const cat = e.expense_categories?.name || 'Uncategorized'
        expMap[cat] = (expMap[cat] || 0) + Number(e.amount)
        totalExp += Number(e.amount)
      })
      setExpenseData(Object.keys(expMap).map(k => ({ category: k, amount: expMap[k] })))

      // Productivity Score (last 7 days)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })
      const { data: prodStats } = await supabase.from('productivity_analytics').select('date, focus_score').eq('user_id', user.id).gte('date', last7Days[0])

      const pData = last7Days.map(dateStr => {
        const match = prodStats?.find((p: any) => p.date === dateStr)
        const d = new Date(dateStr)
        return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), score: match ? match.focus_score : 0 }
      })
      setProductivityData(pData)

      // Habit Tracker (last 4 weeks grouping)
      const d28 = new Date()
      d28.setDate(d28.getDate() - 28)
      const { data: habits } = await supabase.from('habits').select('id, name').eq('user_id', user.id)
      const { data: habitLogs } = await supabase.from('habit_logs').select('habit_id, logged_date, completed').eq('completed', true).gte('logged_date', d28.toISOString().split('T')[0])

      const hKeys = (habits || []).map((h: any) => h.name)
      setHabitKeys(hKeys)

      const hData: any = [
        { date: 'Week 1', ...Object.fromEntries(hKeys.map(k => [k, 0])) },
        { date: 'Week 2', ...Object.fromEntries(hKeys.map(k => [k, 0])) },
        { date: 'Week 3', ...Object.fromEntries(hKeys.map(k => [k, 0])) },
        { date: 'Week 4', ...Object.fromEntries(hKeys.map(k => [k, 0])) },
      ]

      ;(habitLogs || []).forEach((log: any) => {
        const logDate = new Date(log.logged_date).getTime()
        const diffDays = Math.floor((new Date().getTime() - logDate) / (1000 * 60 * 60 * 24))
        const weekIdx = 3 - Math.floor(diffDays / 7)
        if (weekIdx >= 0 && weekIdx <= 3) {
          const habitName = habits?.find((h: any) => h.id === log.habit_id)?.name
          if (habitName) {
            hData[weekIdx][habitName] += 1
          }
        }
      })
      setHabitTrackerData(hData)

      // Metrics
      const avgProd = prodStats?.length ? Math.round(prodStats.reduce((sum: number, p: any) => sum + (p.focus_score || 0), 0) / prodStats.length) : 0

      const { data: studySessions } = await supabase.from('study_sessions').select('duration_minutes').eq('user_id', user.id).gte('date', startOfMonth)
      const totalMins = (studySessions || []).reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0)

      const totalHabitsCount = habits?.length || 0
      let todayHabitsDone = 0
      const todayStr = new Date().toISOString().split('T')[0]
      ;(habitLogs || []).forEach((log: any) => {
        if (log.logged_date === todayStr) todayHabitsDone++
      })
      const habitComp = totalHabitsCount ? Math.round((todayHabitsDone / totalHabitsCount) * 100) : 0

      setMetrics({
        avgProductivity: avgProd,
        studyHours: totalMins / 60,
        habitCompletion: habitComp,
        totalSpent: totalExp
      })

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/20"></div>
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest animate-pulse">Compiling Data Analytics...</p>
          </div>
        </div>
      )}
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground neon-glow-cyan">Analytics</h1>
          <p className="text-foreground/60 text-lg">System-wide performance metrics and visualization</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="futuristic-button text-white">
            <Filter size={16} />
            Filter
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <div className="glass rounded-xl border border-cyan-500/20 p-6 flex flex-col justify-between min-h-[140px]">
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Productivity Index</p>
          <div>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{metrics.avgProductivity}%</p>
            <p className="text-[10px] text-foreground/40 font-medium mt-1 uppercase tracking-wider">Weighted weekly average</p>
          </div>
        </div>

        <div className="glass rounded-xl border border-green-500/20 p-6 flex flex-col justify-between min-h-[140px]">
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Knowledge Acquisition</p>
          <div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{metrics.studyHours.toFixed(1)}h</p>
            <p className="text-[10px] text-foreground/40 font-medium mt-1 uppercase tracking-wider">Focus cycle duration (30D)</p>
          </div>
        </div>

        <div className="glass rounded-xl border border-purple-500/20 p-6 flex flex-col justify-between min-h-[140px]">
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Habit Consistency</p>
          <div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{metrics.habitCompletion}%</p>
            <p className="text-[10px] text-foreground/40 font-medium mt-1 uppercase tracking-wider">Protocol adherence rate</p>
          </div>
        </div>

        <div className="glass rounded-xl border border-orange-500/20 p-6 flex flex-col justify-between min-h-[140px]">
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-1">Capital Expenditure</p>
          <div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">₹{metrics.totalSpent.toLocaleString()}</p>
            <p className="text-[10px] text-foreground/40 font-medium mt-1 uppercase tracking-wider">Financial throughput (30D)</p>
          </div>
        </div>
      </motion.div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Productivity Line Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Performance Vectors</h2>
          <div className="glass rounded-2xl p-8 border border-white/5">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  className="text-foreground/30"
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-foreground/30"
                  fontSize={10}
                  fontWeight="bold"
                  tick={{ fill: 'text-foreground/30' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10,10,20,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Goal Distribution Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Objective Distribution</h2>
          <div className="glass rounded-2xl p-8 border border-white/5">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={goalProgressData.length > 0 ? goalProgressData : [{ name: 'EMPTY', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {goalProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {goalProgressData.length === 0 && <Cell fill="rgba(255,255,255,0.05)" />}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10,10,20,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                  }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Habit Bar Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Protocol Consistency</h2>
          <div className="glass rounded-2xl p-8 border border-white/5">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={habitTrackerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  className="text-foreground/30"
                  fontSize={10}
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-foreground/30"
                  fontSize={10}
                  fontWeight="bold"
                  tick={{ fill: 'text-foreground/30' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10,10,20,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                  }}
                />
                {habitKeys.map((key, i) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={COLORS[i % COLORS.length]} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expense Breakdown Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Resource Allocation</h2>
          <div className="glass rounded-2xl p-8 border border-white/5">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={expenseData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="currentColor"
                  className="text-foreground/30"
                  fontSize={10}
                  fontWeight="bold"
                  tick={{ fill: 'text-foreground/30' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10,10,20,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                  }}
                />
                <Bar dataKey="amount" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

