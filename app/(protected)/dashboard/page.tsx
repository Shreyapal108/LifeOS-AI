'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, IndianRupee, BarChart3, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { GlowCard } from '@/components/ui/spotlight-card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface StatCard {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: string
}

const stats: StatCard[] = [
  {
    title: 'Active Goals',
    value: '5',
    subtitle: 'This month',
    icon: <Target className="w-6 h-6" />,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    title: 'Habit Streak',
    value: '12',
    subtitle: 'Days consistent',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'This Month Budget',
    value: '₹450',
    subtitle: 'of ₹1,000',
    icon: <IndianRupee className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Productivity Score',
    value: '78%',
    subtitle: '+5% from last week',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'from-magenta-500 to-magenta-600',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Active Goals', value: '-', subtitle: '...', icon: <Target className="w-6 h-6" />, color: 'from-cyan-500 to-cyan-600' },
    { title: 'Habits Done Today', value: '-', subtitle: '...', icon: <Zap className="w-6 h-6" />, color: 'from-green-500 to-green-600' },
    { title: 'Monthly Spent', value: '-', subtitle: '...', icon: <IndianRupee className="w-6 h-6" />, color: 'from-purple-500 to-purple-600' },
    { title: 'Productivity Score', value: '-', subtitle: '...', icon: <BarChart3 className="w-6 h-6" />, color: 'from-magenta-500 to-magenta-600' },
  ])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()

    const supabase = createClient()
    
    const channel = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        fetchDashboard(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, () => {
        fetchDashboard(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => {
        fetchDashboard(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchDashboard(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchDashboard = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Active Goals
      const { count: goalsCount } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')

      // Today's Habits
      const today = new Date().toISOString().split('T')[0]
      const { count: habitsDoneCount } = await supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('logged_date', today)
        .eq('completed', true)
        
      const { count: totalHabitsCount } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Monthly Expenses
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: expData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
      
      const totalSpent = (expData || []).reduce((sum, e) => sum + Number(e.amount), 0)

      const prodScore = totalHabitsCount ? Math.round(((habitsDoneCount || 0) / totalHabitsCount) * 100) : 0

      setStats([
        { title: 'Active Goals', value: `${goalsCount || 0}`, subtitle: 'System Objectives', icon: <Target className="w-6 h-6" />, color: 'from-cyan-500 to-cyan-600' },
        { title: 'Habits Done Today', value: `${habitsDoneCount || 0}`, subtitle: 'Daily Rituals', icon: <Zap className="w-6 h-6" />, color: 'from-green-500 to-green-600' },
        { title: 'Monthly Spent', value: `₹${totalSpent.toLocaleString()}`, subtitle: 'Budget Audit', icon: <IndianRupee className="w-6 h-6" />, color: 'from-purple-500 to-purple-600' },
        { title: 'Productivity Score', value: `${prodScore}%`, subtitle: 'Efficiency Level', icon: <BarChart3 className="w-6 h-6" />, color: 'from-magenta-500 to-magenta-600' },
      ])

      // Recent Activity
      const { data: recentExps } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
        
      const { data: recentGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      const combinedActivity = [
        ...(recentExps || []).map((e: any) => ({ type: 'expense', title: e.description || 'Expense logged', desc: `₹${e.amount} spent`, date: e.date })),
        ...(recentGoals || []).map((g: any) => ({ type: 'goal', title: g.title, desc: 'New objective initialized', date: g.created_at }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

      setActivities(combinedActivity)
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none">Dashboard</h1>
        <p className="text-gray-400 text-base font-medium">Overview of your activity and progress</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants} className="glass rounded-xl p-6 border border-cyan-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20",
                stat.color.includes('cyan') ? 'text-cyan-400' :
                stat.color.includes('green') ? 'text-green-400' :
                stat.color.includes('purple') ? 'text-purple-400' :
                'text-pink-400'
              )}>
                {stat.icon}
              </div>
              {stat.title === 'Productivity Score' && (
                <TrendingUp className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            </div>
            <div className="glass rounded-xl border border-cyan-500/20 p-4">
              {activities.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-medium italic">No recent activity</div>
              ) : (
                <div className="space-y-2">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-cyan-500/5 transition-all rounded-xl group">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          activity.type === 'expense' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                        )}>
                          {activity.type === 'expense' ? <IndianRupee size={18} /> : <Target size={18} />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{activity.desc}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* AI Insights Preview */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-lg font-bold text-white">AI Insights</h2>
            <div className="glass rounded-xl border border-cyan-500/20 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1 text-white">Productivity Trend</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
                    Based on your recent activity, your productivity is trending positively. Keep up the good work!
                  </p>
                  <Link href="/insights">
                    <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
                      View Insights
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              {[
                { href: '/goals', icon: <Target size={20} />, title: 'Set Goals', subtitle: 'Goal Management', color: 'cyan' },
                { href: '/habits', icon: <Zap size={20} />, title: 'Track Habits', subtitle: 'Habit Tracking', color: 'green' },
                { href: '/expenses', icon: <IndianRupee size={20} />, title: 'Log Expenses', subtitle: 'Expense Logging', color: 'purple' },
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <div className="glass rounded-xl border border-cyan-500/20 p-4 hover:bg-cyan-500/5 transition-all cursor-pointer flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                      action.color === 'green' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Time Overview */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-white">System Status</h2>
            <div className="glass rounded-xl border border-cyan-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Status</span>
                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Online</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last sync</span>
                  <span suppressHydrationWarning className="text-xs text-white">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">System health</span>
                    <span className="text-xs font-bold text-green-400">98%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '98%' }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
