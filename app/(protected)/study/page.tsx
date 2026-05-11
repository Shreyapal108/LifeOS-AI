'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, BookOpen, Calendar, Clock, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface StudySession {
  id: string
  subject: string
  duration_minutes: number
  date: string
  deadline?: string
  notes?: string
  completion_status: 'pending' | 'in_progress' | 'completed'
  created_at: string
}


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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-400 bg-green-500/10 border-green-500/30'
    case 'in_progress':
      return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-5 h-5 text-green-400" />
    case 'in_progress':
      return <Circle className="w-5 h-5 text-cyan-400" />
    default:
      return <Circle className="w-5 h-5 text-gray-600" />
  }
}

const daysUntilDeadline = (deadline: string) => {
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function StudyPage() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newSession, setNewSession] = useState({
    subject: '',
    duration_minutes: '',
    date: new Date().toISOString().split('T')[0],
    deadline: '',
    notes: '',
    completion_status: 'pending' as const
  })

  useEffect(() => {
    fetchSessions()
    
    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('study_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_sessions',
        },
        () => {
          fetchSessions() // Refetch data when changes occur
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('study_sessions').insert({
        user_id: user.id,
        subject: newSession.subject,
        duration_minutes: Number(newSession.duration_minutes),
        date: newSession.date,
        deadline: newSession.deadline || null,
        notes: newSession.notes || null,
        completion_status: newSession.completion_status
      })

      if (error) throw error
      
      setShowModal(false)
      setNewSession({
        subject: '',
        duration_minutes: '',
        date: new Date().toISOString().split('T')[0],
        deadline: '',
        notes: '',
        completion_status: 'pending'
      })
      fetchSessions()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteSession = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('study_sessions').delete().eq('id', id)
      if (error) throw error
      fetchSessions()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    let newStatus: 'pending' | 'in_progress' | 'completed'
    if (currentStatus === 'pending') {
      newStatus = 'in_progress'
    } else if (currentStatus === 'in_progress') {
      newStatus = 'completed'
    } else {
      newStatus = 'pending'
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('study_sessions')
        .update({ completion_status: newStatus })
        .eq('id', id)
      
      if (error) throw error
      fetchSessions()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const totalHours = sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60
  const completedSessions = sessions.filter((s) => s.completion_status === 'completed').length

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <>
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-bold gradient-text-cyan mb-2">Study Planning</h1>
          <p className="text-gray-400">Organize and track your learning sessions</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          New Session
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-6 border border-cyan-500/20"
        >
          <p className="text-gray-400 text-sm mb-2">Total Study Time</p>
          <p className="text-3xl font-bold text-cyan-400">{totalHours.toFixed(1)}h</p>
          <p className="text-xs text-gray-500 mt-2">This month</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-6 border border-green-500/20"
        >
          <p className="text-gray-400 text-sm mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-400">{completedSessions}</p>
          <p className="text-xs text-gray-500 mt-2">sessions finished</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-6 border border-purple-500/20"
        >
          <p className="text-gray-400 text-sm mb-2">Active Sessions</p>
          <p className="text-3xl font-bold text-purple-400">
            {sessions.filter((s) => s.completion_status !== 'completed').length}
          </p>
          <p className="text-xs text-gray-500 mt-2">in progress or pending</p>
        </motion.div>
      </motion.div>

      {/* Study Sessions */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-bold">Study Sessions</h2>
        <div className="space-y-3">
          {sessions.map((session) => {
            const deadline = session.deadline ? daysUntilDeadline(session.deadline) : null
            const isUrgent = deadline !== null && deadline <= 3 && session.completion_status !== 'completed'

            return (
              <motion.div
                key={session.id}
                variants={itemVariants}
                className={`glass rounded-xl p-6 border transition-all ${
                  isUrgent
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-cyan-500/20 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <button 
                      onClick={() => handleToggleStatus(session.id, session.completion_status)}
                      className="mt-1"
                    >
                      {getStatusIcon(session.completion_status)}
                    </button>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{session.subject}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {session.duration_minutes} mins
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                            session.completion_status
                          )}`}
                        >
                          {session.completion_status === 'in_progress' ? 'In Progress' : session.completion_status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Deadline info */}
                {session.completion_status !== 'completed' && session.deadline && (
                  <div
                    className={`mb-4 px-3 py-2 rounded text-xs font-semibold flex items-center gap-2 ${
                      isUrgent
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}
                  >
                    <Calendar size={12} />
                    {deadline === 0
                      ? 'Due today!'
                      : deadline === 1
                      ? 'Due tomorrow'
                      : `${deadline} days until deadline`}
                  </div>
                )}

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
                    <span>Status</span>
                    <span className="font-semibold text-cyan-400 capitalize">{session.completion_status.replace('_', ' ')}</span>
                  </div>
                  <div className="h-2 bg-[rgba(0,212,255,0.1)] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r transition-all duration-300 ${
                        session.completion_status === 'completed' 
                          ? 'from-green-500 to-green-400 w-full'
                          : session.completion_status === 'in_progress'
                          ? 'from-cyan-500 to-cyan-400 w-1/2'
                          : 'from-gray-500 to-gray-400 w-1/4'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-12 border border-cyan-500/20 text-center"
        >
          <BookOpen className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No study sessions yet</h3>
          <p className="text-gray-400 mb-6">Plan your first study session to get started</p>
          <Button onClick={() => setShowModal(true)} className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400">
            Create Your First Session
          </Button>
        </motion.div>
      )}

      {/* Add Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 border border-blue-500/20 w-full max-w-md bg-[#0f0f1e]"
          >
            <h2 className="text-2xl font-bold mb-4">Create Study Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                <input 
                  required 
                  value={newSession.subject} 
                  onChange={e => setNewSession({...newSession, subject: e.target.value})} 
                  className="w-full bg-[rgba(26,26,46,0.8)] border border-blue-500/30 rounded p-2 text-white" 
                  placeholder="e.g., Advanced TypeScript"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration (minutes)</label>
                  <input 
                    type="number" 
                    required 
                    value={newSession.duration_minutes} 
                    onChange={e => setNewSession({...newSession, duration_minutes: e.target.value})} 
                    className="w-full bg-[rgba(26,26,46,0.8)] border border-blue-500/30 rounded p-2 text-white" 
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={newSession.date} 
                    onChange={e => setNewSession({...newSession, date: e.target.value})} 
                    className="w-full bg-[rgba(26,26,46,0.8)] border border-blue-500/30 rounded p-2 text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deadline (optional)</label>
                <input 
                  type="date" 
                  value={newSession.deadline} 
                  onChange={e => setNewSession({...newSession, deadline: e.target.value})} 
                  className="w-full bg-[rgba(26,26,46,0.8)] border border-blue-500/30 rounded p-2 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
                <textarea 
                  value={newSession.notes} 
                  onChange={e => setNewSession({...newSession, notes: e.target.value})} 
                  className="w-full bg-[rgba(26,26,46,0.8)] border border-blue-500/30 rounded p-2 text-white h-20 resize-none" 
                  placeholder="Additional notes about this study session..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1 border border-blue-500/30 hover:bg-blue-500/10 text-white">Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">Create Session</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
        </>
      )}
    </motion.div>
  )
}
