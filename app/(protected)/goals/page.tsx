'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, ChevronRight, Calendar, Flag, Trash2, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Goal {
  id: string
  title: string
  description: string
  type: 'yearly' | 'monthly' | 'weekly'
  progress: number
  priority: 'low' | 'medium' | 'high'
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'failed'
}

const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Learn TypeScript Deeply',
    description: 'Master advanced TypeScript concepts and patterns',
    type: 'yearly',
    progress: 65,
    priority: 'high',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
  },
  {
    id: '2',
    title: 'Complete Project X',
    description: 'Finish the main product launch',
    type: 'monthly',
    progress: 45,
    priority: 'high',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    status: 'active',
  },
  {
    id: '3',
    title: 'Weekly Exercise Routine',
    description: '5 workouts per week',
    type: 'weekly',
    progress: 80,
    priority: 'medium',
    startDate: '2024-05-06',
    endDate: '2024-05-12',
    status: 'active',
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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'yearly':
      return 'from-cyan-500/20 to-cyan-600/20'
    case 'monthly':
      return 'from-magenta-500/20 to-magenta-600/20'
    default:
      return 'from-green-500/20 to-green-600/20'
  }
}

export default function GoalsPage() {
  const [goalsData, setGoalsData] = useState<Goal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'monthly',
    priority: 'medium',
    endDate: ''
  })

  useEffect(() => {
    fetchGoals()

    const supabase = createClient()
    const channel = supabase
      .channel('goals_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        fetchGoals(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchGoals = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const formattedGoals = (goals || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description || '',
        type: g.type,
        progress: g.progress || 0,
        priority: g.priority,
        startDate: g.start_date || g.created_at,
        endDate: g.end_date,
        status: g.status,
      }))
      setGoalsData(formattedGoals)
    } catch (err: any) {
      console.error('Goals sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description,
          type: newGoal.type,
          priority: newGoal.priority,
          end_date: newGoal.endDate || new Date().toISOString().split('T')[0],
          status: 'active'
        })

      if (error) throw error
      
      setShowModal(false)
      setNewGoal({ title: '', description: '', type: 'monthly', priority: 'medium', endDate: '' })
      fetchGoals()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteGoal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const supabase = createClient()
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
      setGoalsData(goalsData.filter(g => g.id !== id))
    } catch (err: any) {
      alert(err.message)
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Goals</h1>
          <p className="text-foreground/60 text-sm">System objectives and progress tracking</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="futuristic-button h-10 px-6 font-bold uppercase tracking-wider text-[10px]"
        >
          <Plus size={16} className="mr-2" />
          Initialize New Goal
        </Button>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          System Error: {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500 shadow-lg shadow-cyan-500/20"></div>
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Retrieving Core Data...</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {goalsData.map((goal) => (
            <motion.div
              key={goal.id}
              variants={itemVariants}
              className="glass p-6 flex flex-col justify-between group h-full rounded-2xl border border-white/5"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-foreground/5 border border-border flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all duration-500">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                        {goal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest border ${goal.priority === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          goal.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                            'bg-green-500/10 border-green-500/20 text-green-400'
                          }`}>
                          {goal.priority}
                        </span>
                        <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">
                          {goal.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"
                    onClick={(e) => handleDeleteGoal(goal.id, e)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <p className="text-xs text-foreground/60 leading-relaxed mb-6 line-clamp-2">
                  {goal.description}
                </p>
              </div>

              <div className="space-y-6">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest">Progress Level</span>
                    <span className="text-xs font-bold text-cyan-400">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between text-[9px] font-bold text-foreground/40 uppercase tracking-widest pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-foreground/30" />
                    <span>{new Date(goal.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <ArrowRight size={12} className="text-foreground/20" />
                  <div className="flex items-center gap-2">
                    <Flag size={12} className="text-foreground/30" />
                    <span className="text-foreground">{new Date(goal.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-heavy rounded-[28px] w-full max-w-lg overflow-hidden relative z-10 shadow-2xl"
            >
              <div className="p-8 border-b border-border flex items-center justify-between bg-foreground/2">
                <h2 className="text-xl font-bold text-foreground tracking-tight">Initialize New Goal</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
                  <X size={20} className="text-foreground/40" />
                </button>
              </div>
              <form onSubmit={handleCreateGoal} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Title</label>
                  <input
                    required
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="futuristic-input w-full rounded-xl px-5 py-4 text-sm"
                    placeholder="E.g., Complete System Migration"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Strategy Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="futuristic-input w-full rounded-xl px-5 py-4 text-sm h-28 resize-none"
                    placeholder="Outline your strategic objectives..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Classification</label>
                    <select
                      value={newGoal.type}
                      onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                      className="futuristic-input w-full rounded-xl px-5 py-4 text-sm appearance-none cursor-pointer"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Priority Level</label>
                    <select
                      value={newGoal.priority}
                      onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}
                      className="futuristic-input w-full rounded-xl px-5 py-4 text-sm appearance-none cursor-pointer"
                    >
                      <option value="low">Low Intensity</option>
                      <option value="medium">Medium Intensity</option>
                      <option value="high">Critical / High</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={newGoal.endDate}
                    onChange={e => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="futuristic-input w-full rounded-xl px-5 py-4 text-sm cursor-pointer"
                  />
                </div>
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-12 text-xs font-bold uppercase tracking-wider text-foreground/40 hover:text-foreground"
                  >
                    Abort
                  </Button>
                  <Button
                    type="submit"
                    className="futuristic-button flex-1 h-12 text-xs font-bold uppercase tracking-wider"
                  >
                    Confirm & Start
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
