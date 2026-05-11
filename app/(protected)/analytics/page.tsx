'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Activity } from 'lucide-react'
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
  AreaChart,
  Area,
} from 'recharts'
import { useTheme } from 'next-themes'

import { createClient } from '@/lib/supabase/client'

const CHART_COLORS = {
  cyan: '#06b6d4',
  purple: '#8b5cf6',
  green: '#22c55e',
  orange: '#f59e0b',
  pink: '#ec4899',
  blue: '#3b82f6',
}

const COLORS = ['#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899']

// Custom premium tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-xl border border-cyan-400/20 rounded-xl px-4 py-3 shadow-2xl shadow-cyan-500/10">
        {label && <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-xs text-white font-semibold">
              {entry.name}: <span className="text-cyan-400">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Empty state component
const EmptyChartState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Activity className="w-12 h-12 text-cyan-400/30 mb-3" />
    <p className="text-sm text-gray-400">{message}</p>
  </div>
)

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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const chartContainerClass = "glass rounded-2xl border border-cyan-500/20 p-6 shadow-[0_8px_32px_rgba(6,182,212,0.08)] hover:shadow-[0_12px_48px_rgba(6,182,212,0.12)] transition-all duration-500"

const isDark = () => typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [productivityData, setProductivityData] = useState<any[]>([])
  const [goalProgressData, setGoalProgressData] = useState<any[]>([])
  const [habitTrackerData, setHabitTrackerData] = useState<any[]>([])
  const [expenseData, setExpenseData] = useState<any[]>([])
  const [habitKeys, setHabitKeys] = useState<string[]>([])
  const [studyTrendData, setStudyTrendData] = useState<any[]>([])
  const [healthTrendData, setHealthTrendData] = useState<any[]>([])
  const [careerProgressData, setCareerProgressData] = useState<any[]>([])
  const [skillCompletionData, setSkillCompletionData] = useState<any[]>([])
  const [metrics, setMetrics] = useState({ avgProductivity: 0, studyHours: 0, habitCompletion: 0, totalSpent: 0 })
  const { theme } = useTheme()

  useEffect(() => {
    fetchAnalytics()

    const supabase = createClient()
    const channel = supabase.channel('analytics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productivity_analytics' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_sessions' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'health_logs' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'career_goals' }, () => fetchAnalytics(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_roadmap' }, () => fetchAnalytics(false))
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

      // Study Hours Trend (last 30 days)
      const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (29 - i))
        return d.toISOString().split('T')[0]
      })
      const { data: studyTrend } = await supabase.from('study_sessions').select('date, duration_minutes').eq('user_id', user.id).gte('date', last30Days[0])
      const studyMap: Record<string, number> = {}
      ;(studyTrend || []).forEach((s: any) => {
        studyMap[s.date] = (studyMap[s.date] || 0) + (s.duration_minutes || 0) / 60
      })
      const sData = last30Days.map(dateStr => {
        const d = new Date(dateStr)
        return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), hours: studyMap[dateStr] || 0 }
      })
      setStudyTrendData(sData)

      // Health Wellness Trend (last 7 days)
      const { data: healthTrend } = await supabase.from('health_logs').select('date, sleep_hours, water_intake_liters').eq('user_id', user.id).gte('date', last7Days[0])
      const healthData = last7Days.map(dateStr => {
        const match = healthTrend?.find((h: any) => h.date === dateStr)
        const d = new Date(dateStr)
        return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), sleep: match ? match.sleep_hours : 0, water: match ? match.water_intake_liters : 0 }
      })
      setHealthTrendData(healthData)

      // Career Progress Overview
      const { data: careerGoals } = await supabase.from('career_goals').select('title, progress, status').eq('user_id', user.id)
      setCareerProgressData((careerGoals || []).map((g: any) => ({ name: g.title, progress: g.progress || 0, status: g.status })))

      // Skill Completion Chart
      const { data: skills } = await supabase.from('skill_roadmap').select('skill_name, progress').eq('user_id', user.id)
      setSkillCompletionData((skills || []).map((s: any) => ({ name: s.skill_name, progress: s.progress || 0 })))

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      )}
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 text-lg">View your performance metrics and trends</p>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <div className="glass rounded-xl border border-cyan-500/20 p-6">
          <p className="text-sm text-gray-400 mb-2">Productivity</p>
          <p className="text-3xl font-bold text-cyan-400">{metrics.avgProductivity}%</p>
          <p className="text-xs text-gray-500 mt-1">Weekly average</p>
        </div>

        <div className="glass rounded-xl border border-green-500/20 p-6">
          <p className="text-sm text-gray-400 mb-2">Study Time</p>
          <p className="text-3xl font-bold text-green-400">{metrics.studyHours.toFixed(1)}h</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="glass rounded-xl border border-purple-500/20 p-6">
          <p className="text-sm text-gray-400 mb-2">Habit Completion</p>
          <p className="text-3xl font-bold text-purple-400">{metrics.habitCompletion}%</p>
          <p className="text-xs text-gray-500 mt-1">Today</p>
        </div>

        <div className="glass rounded-xl border border-orange-500/20 p-6">
          <p className="text-sm text-gray-400 mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-orange-400">₹{metrics.totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
      </motion.div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Productivity Line Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Productivity Trends</h2>
          <div className={chartContainerClass}>
            {productivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={productivityData}>
                  <defs>
                    <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.cyan} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.cyan} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="natural"
                    dataKey="score"
                    stroke={CHART_COLORS.cyan}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.cyan, r: 4, strokeWidth: 2, stroke: 'rgba(6,182,212,0.2)' }}
                    activeDot={{ r: 8, stroke: CHART_COLORS.cyan, strokeWidth: 3, fill: 'rgba(6,182,212,0.1)' }}
                  />
                  <Area type="natural" dataKey="score" stroke={CHART_COLORS.cyan} fillOpacity={1} fill="url(#productivityGradient)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start tracking your productivity to see trends" />
            )}
          </div>
        </motion.div>

        {/* Goal Distribution Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Goal Distribution</h2>
          <div className={chartContainerClass}>
            {goalProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <defs>
                    <linearGradient id="grad0" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={CHART_COLORS.cyan} />
                      <stop offset="100%" stopColor={CHART_COLORS.blue} />
                    </linearGradient>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={CHART_COLORS.purple} />
                      <stop offset="100%" stopColor={CHART_COLORS.pink} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={CHART_COLORS.green} />
                      <stop offset="100%" stopColor={CHART_COLORS.cyan} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={goalProgressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                  >
                    {goalProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#grad${index % 3})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs font-semibold text-white/80">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start adding goals to see your distribution" />
            )}
          </div>
        </motion.div>

        {/* Habit Bar Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Habit Consistency</h2>
          <div className={chartContainerClass}>
            {habitTrackerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={habitTrackerData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {habitKeys.map((key, i) => (
                    <Bar key={key} dataKey={key} stackId="a" fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} barSize={24} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start tracking habits to see your consistency" />
            )}
          </div>
        </motion.div>

        {/* Expense Breakdown Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Expense Breakdown</h2>
          <div className={chartContainerClass}>
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={expenseData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill={CHART_COLORS.pink} radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start tracking expenses to see your breakdown" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Study Hours Trend */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Study Hours Trend</h2>
          <div className={chartContainerClass}>
            {studyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={studyTrendData}>
                  <defs>
                    <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="natural"
                    dataKey="hours"
                    stroke={CHART_COLORS.green}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.green, r: 4, strokeWidth: 2, stroke: 'rgba(34,197,94,0.2)' }}
                    activeDot={{ r: 8, stroke: CHART_COLORS.green, strokeWidth: 3, fill: 'rgba(34,197,94,0.1)' }}
                  />
                  <Area type="natural" dataKey="hours" stroke={CHART_COLORS.green} fillOpacity={1} fill="url(#studyGradient)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start tracking study sessions to see your trends" />
            )}
          </div>
        </motion.div>

        {/* Health Wellness Trend */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Health Wellness Trend</h2>
          <div className={chartContainerClass}>
            {healthTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={healthTrendData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="natural" dataKey="sleep" stroke={CHART_COLORS.purple} strokeWidth={3} name="Sleep (hrs)" dot={{ fill: CHART_COLORS.purple, r: 4, strokeWidth: 2, stroke: 'rgba(139,92,246,0.2)' }} activeDot={{ r: 8, stroke: CHART_COLORS.purple, strokeWidth: 3, fill: 'rgba(139,92,246,0.1)' }} />
                  <Line type="natural" dataKey="water" stroke={CHART_COLORS.cyan} strokeWidth={3} name="Water (L)" dot={{ fill: CHART_COLORS.cyan, r: 4, strokeWidth: 2, stroke: 'rgba(6,182,212,0.2)' }} activeDot={{ r: 8, stroke: CHART_COLORS.cyan, strokeWidth: 3, fill: 'rgba(6,182,212,0.1)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start tracking health metrics to see your wellness trends" />
            )}
          </div>
        </motion.div>

        {/* Career Progress Overview */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Career Progress Overview</h2>
          <div className={chartContainerClass}>
            {careerProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={careerProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="progress" fill={CHART_COLORS.orange} radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start tracking career goals to see your progress" />
            )}
          </div>
        </motion.div>

        {/* Skill Completion Chart */}
        <motion.div variants={itemVariants} className="space-y-6">
          <h2 className="text-xl font-bold text-white">Skill Completion</h2>
          <div className={chartContainerClass}>
            {skillCompletionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={skillCompletionData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    className="text-xs"
                    fontSize={11}
                    fontWeight="500"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="progress" fill={CHART_COLORS.purple} radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Start tracking skills to see your completion progress" />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

