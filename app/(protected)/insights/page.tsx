'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Brain,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Insight {
  id: string
  type: 'recommendation' | 'burnout_alert' | 'prediction'
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  actionItems: string[]
  dismissed: boolean
}

const sampleInsights: Insight[] = [
  {
    id: '1',
    type: 'burnout_alert',
    title: 'Potential Burnout Detected',
    content:
      'Your productivity has decreased by 20% over the past week, and your sleep pattern shows signs of stress. Consider taking a break or adjusting your goals.',
    priority: 'high',
    actionItems: [
      'Take a 30-minute walk',
      'Practice meditation',
      'Review and adjust goals',
    ],
    dismissed: false,
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Optimize Your Morning Routine',
    content:
      'Analysis shows your productivity peaks at 9-10 AM. Scheduling important tasks during this window could increase your completion rate by 30%.',
    priority: 'medium',
    actionItems: [
      'Move coding tasks to morning',
      'Schedule meetings in afternoon',
      'Adjust wake-up time',
    ],
    dismissed: false,
  },
  {
    id: '3',
    type: 'prediction',
    title: 'Goal Achievement Prediction',
    content:
      'Based on current progress rate, you have a 85% chance of completing your "Learn TypeScript Deeply" goal by the deadline.',
    priority: 'low',
    actionItems: [
      'Maintain current pace',
      'Weekly review sessions',
      'Track milestone completion',
    ],
    dismissed: false,
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Habit Synergy Opportunity',
    content:
      'Your meditation habit correlates strongly with exercise performance. Consider scheduling them together to boost overall consistency.',
    priority: 'medium',
    actionItems: [
      'Schedule meditation before workout',
      'Track combined habit performance',
      'Set reminder for both',
    ],
    dismissed: false,
  },
]

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

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'burnout_alert':
      return <AlertTriangle className="w-6 h-6" />
    case 'prediction':
      return <TrendingUp className="w-6 h-6" />
    default:
      return <Lightbulb className="w-6 h-6" />
  }
}

const getInsightBorderColor = (type: string) => {
  switch (type) {
    case 'burnout_alert':
      return 'border-red-500/30 bg-red-500/5'
    case 'prediction':
      return 'border-green-500/30 bg-green-500/5'
    default:
      return 'border-cyan-500/20'
  }
}

const getInsightIconColor = (type: string) => {
  switch (type) {
    case 'burnout_alert':
      return 'text-red-400'
    case 'prediction':
      return 'text-green-400'
    default:
      return 'text-cyan-400'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-400 bg-red-500/10 border-red-500/30'
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    default:
      return 'text-green-400 bg-green-500/10 border-green-500/30'
  }
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAndGenerateInsights()
  }, [])

  const fetchAndGenerateInsights = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch existing insights
      const { data: existingInsights, error: fetchErr } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr

      const existingTitles = new Set((existingInsights || []).map(i => i.title))
      const newInsightsToInsert = []

      // 1. Goal consistency / load
      const { count: goalsCount } = await supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active')
      if ((goalsCount || 0) > 5 && !existingTitles.has('High Goal Load')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'burnout_alert',
          title: 'High Goal Load',
          content: 'You have more than 5 active goals. This might lead to decreased focus. Consider pausing some goals to maintain high consistency.',
          priority: 'high',
          actionable_items: ['Review active goals', 'Pause 1-2 low priority goals'],
        })
      }

      // 2. Expense Budget Alert
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: expData } = await supabase.from('expenses').select('amount').eq('user_id', user.id).gte('date', startOfMonth)
      const { data: catData } = await supabase.from('expense_categories').select('monthly_budget').eq('user_id', user.id)

      const totalSpent = (expData || []).reduce((sum, e) => sum + Number(e.amount), 0)
      const totalBudget = (catData || []).reduce((sum, c) => sum + Number(c.monthly_budget || 0), 0)

      if (totalBudget > 0 && totalSpent > totalBudget * 0.8 && !existingTitles.has('Approaching Budget Limit')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Approaching Budget Limit',
          content: `You have spent ₹${totalSpent.toFixed(2)} which is over 80% of your total budget. Track your remaining expenses carefully.`,
          priority: 'medium',
          actionable_items: ['Review recent expenses', 'Hold off on non-essential purchases'],
        })
      }

      // 3. Habit consistency
      const today = new Date().toISOString().split('T')[0]
      const { count: habitsDoneCount } = await supabase.from('habit_logs').select('*', { count: 'exact', head: true }).eq('logged_date', today).eq('completed', true)
      const { count: totalHabitsCount } = await supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

      if (totalHabitsCount && totalHabitsCount > 0) {
        const completionRate = (habitsDoneCount || 0) / totalHabitsCount
        if (completionRate < 0.5 && !existingTitles.has('Low Habit Completion')) {
          newInsightsToInsert.push({
            user_id: user.id,
            insight_type: 'prediction',
            title: 'Low Habit Completion',
            content: 'Your habit completion rate is below 50% today. Try knocking out a quick habit to build momentum.',
            priority: 'low',
            actionable_items: ['Complete a 5-minute habit', 'Review habit difficulty'],
          })
        }
      }

      // Insert new insights
      if (newInsightsToInsert.length > 0) {
        await supabase.from('ai_insights').insert(newInsightsToInsert)
      }

      // Fetch all insights again to get the IDs of the newly inserted ones
      const { data: finalInsights } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const formatted = (finalInsights || []).map((i: any) => ({
        id: i.id,
        type: i.insight_type,
        title: i.title,
        content: i.content,
        priority: i.priority,
        actionItems: i.actionable_items || [],
        dismissed: i.dismissed
      }))

      setInsights(formatted)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeInsights = insights.filter((i) => !i.dismissed)

  const dismissInsight = async (id: string) => {
    setInsights(
      insights.map((i) => (i.id === id ? { ...i, dismissed: true } : i))
    )
    try {
      const supabase = createClient()
      await supabase.from('ai_insights').update({ dismissed: true }).eq('id', id)
    } catch (err) {
      console.error(err)
    }
  }

  const restoreInsight = async (id: string) => {
    setInsights(
      insights.map((i) => (i.id === id ? { ...i, dismissed: false } : i))
    )
    try {
      const supabase = createClient()
      await supabase.from('ai_insights').update({ dismissed: false }).eq('id', id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <motion.div
      className="space-y-10 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass rounded-2xl border border-white/5 p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Insights</h1>
          <p className="text-foreground/60 text-sm mt-1">Predictive behavioral analysis and optimization</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{activeInsights.length}</p>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Active Intelligence</p>
        </div>
      </motion.div>

    {error && (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        Neural Link Error: {error}
      </div>
    )}

    {loading ? (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/20"></div>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Processing Behavioral Data...</p>
      </div>
    ) : (
      <div className="space-y-10">
        {/* Active Insights */}
        {activeInsights.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {activeInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  variants={itemVariants}
                  className={`glass rounded-2xl border border-white/5 p-8 group relative overflow-hidden transition-all duration-500 ${insight.type === 'burnout_alert' ? 'hover:shadow-[0_20px_45px_rgba(239,68,68,0.1)]' : 'hover:shadow-[0_20px_45px_rgba(6,182,212,0.1)]'
                    }`}
                >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${insight.type === 'burnout_alert'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 shadow-red-500/10 group-hover:bg-red-500/20'
                          : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-cyan-500/10 group-hover:bg-cyan-500/20'
                          }`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-0.5">
                            <h3 className="text-lg font-bold text-foreground tracking-tight">{insight.title}</h3>
                            <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest border ${getPriorityColor(insight.priority)}`}>
                              {insight.priority} Priority
                            </span>
                          </div>
                          <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Type: {insight.type.replace('_', ' ')}</p>
                        </div>
                      </div>

                      <p className="text-foreground/70 leading-relaxed text-sm mb-6">
                        {insight.content}
                      </p>

                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Optimization Protocols</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {insight.actionItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-foreground/5 border border-border text-foreground/70 text-[11px] font-medium hover:border-cyan-500/20 transition-colors">
                              <Zap size={14} className="text-cyan-600 dark:text-cyan-400" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>

                    <div className="lg:w-40 flex flex-col gap-2 justify-center">
                      <Button className="futuristic-button w-full h-10 text-[9px] font-bold uppercase tracking-widest">
                        Take Action
                        <ArrowRight size={12} className="ml-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => dismissInsight(insight.id)}
                        className="w-full h-10 text-[9px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                      >
                        Acknowledge
                      </Button>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {activeInsights.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="glass rounded-2xl border border-white/5 p-20 text-center flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/10">
                <Brain className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">Neural Processing Clear</h3>
              <p className="text-foreground/60 mb-10 max-w-md">No behavioral anomalies or optimization opportunities detected. Your current operational flow is optimal.</p>
              {insights.some((i) => i.dismissed) && (
                <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10">
                  Audit Previous Logs
                </Button>
              )}
            </motion.div>
        )}

        {/* Dismissed Insights */}
        {insights.some((i) => i.dismissed) && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground tracking-tight">Intelligence Logs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights
                  .filter((i) => i.dismissed)
                  .map((insight) => (
                    <motion.div
                      key={insight.id}
                      variants={itemVariants}
                      className="glass rounded-xl border border-white/5 p-4 flex items-center justify-between opacity-50 hover:opacity-100 transition-all duration-500"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl bg-foreground/5 ${getInsightIconColor(insight.type)}`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{insight.title}</p>
                          <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Archived Protocol</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => restoreInsight(insight.id)}
                        className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                      >
                        Restore
                      </Button>
                    </motion.div>
                  ))}
              </div>
            </div>
        )}

        {/* AI Info Card */}
          <motion.div variants={itemVariants} className="glass rounded-2xl border border-white/5 p-8 bg-gradient-to-br from-purple-500/5 to-cyan-500/5">
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-8">Intelligence Framework</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/5">
                  <Brain size={20} />
                </div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Behavioral Engine</h4>
                <p className="text-[11px] text-foreground/50 leading-relaxed">Systematic analysis of habit loops and goal adherence vectors to identify performance correlations.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-lg shadow-cyan-500/5">
                  <TrendingUp size={20} />
                </div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Predictive Modeling</h4>
                <p className="text-[11px] text-foreground/50 leading-relaxed">Machine learning algorithms forecasting burnout thresholds and calculating objective completion probabilities.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 shadow-lg shadow-green-500/5">
                  <Lightbulb size={20} />
                </div>
                <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Optimization Protocols</h4>
                <p className="text-[11px] text-foreground/50 leading-relaxed">Dynamic generation of actionable intervention strategies designed to maximize bio-digital efficiency.</p>
              </div>
            </div>
          </motion.div>
      </div>
    )}
    </motion.div>
  )
}
