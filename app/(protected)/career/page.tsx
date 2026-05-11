'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Target, FileText, BookOpen, Plus, Trash2, CheckCircle2, Clock, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface CareerGoal {
  id: string
  title: string
  description: string
  target_date: string
  status: 'active' | 'completed' | 'on_hold'
  created_at: string
}

interface JobApplication {
  id: string
  company_name: string
  role: string
  application_status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  applied_date: string
  notes: string
  created_at: string
}

interface SkillRoadmap {
  id: string
  skill_name: string
  progress: number
  category: string
  target_date: string
  created_at: string
}

interface LearningProgress {
  id: string
  title: string
  platform: string
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
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

export default function CareerPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'goals' | 'applications' | 'skills' | 'learning'>('goals')
  
  // Career Goals
  const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([])
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '', status: 'active' as const })

  // Job Applications
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([])
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [newApplication, setNewApplication] = useState({ company_name: '', role: '', application_status: 'applied' as const, applied_date: '', notes: '' })

  // Skills
  const [skills, setSkills] = useState<SkillRoadmap[]>([])
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [newSkill, setNewSkill] = useState({ skill_name: '', progress: 0, category: '', target_date: '' })

  // Learning
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([])
  const [showLearningModal, setShowLearningModal] = useState(false)
  const [newLearning, setNewLearning] = useState({ title: '', platform: '', progress: 0, status: 'not_started' as const })

  useEffect(() => {
    fetchAllData()

    const supabase = createClient()
    const channel = supabase.channel('career_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'career_goals' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_roadmap' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_progress' }, () => fetchAllData())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const [goals, applications, skillData, learningData] = await Promise.all([
        supabase.from('career_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('job_applications').select('*').eq('user_id', user.id).order('applied_date', { ascending: false }),
        supabase.from('skill_roadmap').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('learning_progress').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      setCareerGoals(goals.data || [])
      setJobApplications(applications.data || [])
      setSkills(skillData.data || [])
      setLearningProgress(learningData.data || [])
    } catch (err: any) {
      setError(err.message)
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

      await supabase.from('career_goals').insert({
        user_id: user.id,
        title: newGoal.title,
        description: newGoal.description,
        target_date: newGoal.target_date || null,
        status: newGoal.status,
      })

      setShowGoalModal(false)
      setNewGoal({ title: '', description: '', target_date: '', status: 'active' })
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('job_applications').insert({
        user_id: user.id,
        company_name: newApplication.company_name,
        role: newApplication.role,
        application_status: newApplication.application_status,
        applied_date: newApplication.applied_date || null,
        notes: newApplication.notes,
      })

      setShowApplicationModal(false)
      setNewApplication({ company_name: '', role: '', application_status: 'applied', applied_date: '', notes: '' })
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('skill_roadmap').insert({
        user_id: user.id,
        skill_name: newSkill.skill_name,
        progress: newSkill.progress,
        category: newSkill.category,
        target_date: newSkill.target_date || null,
      })

      setShowSkillModal(false)
      setNewSkill({ skill_name: '', progress: 0, category: '', target_date: '' })
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateLearning = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('learning_progress').insert({
        user_id: user.id,
        title: newLearning.title,
        platform: newLearning.platform,
        progress: newLearning.progress,
        status: newLearning.status,
      })

      setShowLearningModal(false)
      setNewLearning({ title: '', platform: '', progress: 0, status: 'not_started' })
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'active': case 'in_progress': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
      case 'interviewing': return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
      case 'offered': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      case 'rejected': case 'on_hold': case 'paused': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'withdrawn': case 'not_started': return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-10 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">{error}</div>}

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Career Management</h1>
          <p className="text-gray-400 text-lg">Track your professional development</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 border-b border-gray-700 pb-4">
        {[
          { id: 'goals', label: 'Career Goals', icon: Target },
          { id: 'applications', label: 'Job Applications', icon: Briefcase },
          { id: 'skills', label: 'Skill Roadmap', icon: Award },
          { id: 'learning', label: 'Learning Progress', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </motion.div>

      {/* Career Goals Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Career Goals</h2>
              <Button onClick={() => setShowGoalModal(true)} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus size={16} className="mr-2" />
                Add Goal
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {careerGoals.map((goal) => (
                <motion.div
                  key={goal.id}
                  variants={itemVariants}
                  className="glass rounded-xl border border-cyan-500/20 p-6 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Target className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-semibold text-lg text-white">{goal.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(goal.status)}`}>
                          {goal.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{goal.description}</p>
                      {goal.target_date && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={14} />
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <button className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {careerGoals.length === 0 && (
                <div className="glass rounded-xl border border-cyan-500/20 p-12 text-center">
                  <Target className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No career goals yet</h3>
                  <p className="text-gray-400 mb-6">Set your career objectives to get started</p>
                  <Button onClick={() => setShowGoalModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    Create Your First Goal
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Job Applications Tab */}
        {activeTab === 'applications' && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Job Applications</h2>
              <Button onClick={() => setShowApplicationModal(true)} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus size={16} className="mr-2" />
                Add Application
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {jobApplications.map((app) => (
                <motion.div
                  key={app.id}
                  variants={itemVariants}
                  className="glass rounded-xl border border-cyan-500/20 p-6 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                        <h3 className="font-semibold text-lg text-white">{app.role}</h3>
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(app.application_status)}`}>
                          {app.application_status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{app.company_name}</p>
                      {app.applied_date && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={14} />
                          Applied: {new Date(app.applied_date).toLocaleDateString()}
                        </div>
                      )}
                      {app.notes && (
                        <p className="text-gray-400 text-sm mt-2 italic">{app.notes}</p>
                      )}
                    </div>
                    <button className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {jobApplications.length === 0 && (
                <div className="glass rounded-xl border border-cyan-500/20 p-12 text-center">
                  <Briefcase className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No job applications yet</h3>
                  <p className="text-gray-400 mb-6">Track your job applications to stay organized</p>
                  <Button onClick={() => setShowApplicationModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    Add Your First Application
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Skill Roadmap</h2>
              <Button onClick={() => setShowSkillModal(true)} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus size={16} className="mr-2" />
                Add Skill
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {skills.map((skill) => (
                <motion.div
                  key={skill.id}
                  variants={itemVariants}
                  className="glass rounded-xl border border-cyan-500/20 p-6 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-cyan-400" />
                      <div>
                        <h3 className="font-semibold text-lg text-white">{skill.skill_name}</h3>
                        <p className="text-gray-400 text-sm">{skill.category}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-cyan-400">{skill.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  {skill.target_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Clock size={14} />
                      Target: {new Date(skill.target_date).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              ))}
              {skills.length === 0 && (
                <div className="glass rounded-xl border border-cyan-500/20 p-12 text-center">
                  <Award className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No skills tracked yet</h3>
                  <p className="text-gray-400 mb-6">Build your skill roadmap to track progress</p>
                  <Button onClick={() => setShowSkillModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    Add Your First Skill
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Learning Tab */}
        {activeTab === 'learning' && (
          <motion.div
            key="learning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Learning Progress</h2>
              <Button onClick={() => setShowLearningModal(true)} className="bg-cyan-500 hover:bg-cyan-600">
                <Plus size={16} className="mr-2" />
                Add Course
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {learningProgress.map((learning) => (
                <motion.div
                  key={learning.id}
                  variants={itemVariants}
                  className="glass rounded-xl border border-cyan-500/20 p-6 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      <div>
                        <h3 className="font-semibold text-lg text-white">{learning.title}</h3>
                        <p className="text-gray-400 text-sm">{learning.platform}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(learning.status)}`}>
                      {learning.status}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${learning.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-bold text-cyan-400">{learning.progress}%</span>
                  </div>
                </motion.div>
              ))}
              {learningProgress.length === 0 && (
                <div className="glass rounded-xl border border-cyan-500/20 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No courses tracked yet</h3>
                  <p className="text-gray-400 mb-6">Track your learning journey and progress</p>
                  <Button onClick={() => setShowLearningModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                    Add Your First Course
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Career Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl border border-cyan-500/20 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add Career Goal</h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    required
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="e.g., Become Senior Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white h-20 resize-none"
                    placeholder="Describe your career goal..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={newGoal.status}
                    onChange={(e) => setNewGoal({ ...newGoal, status: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option value="active" className="bg-gray-900 text-white">Active</option>
                    <option value="completed" className="bg-gray-900 text-white">Completed</option>
                    <option value="on_hold" className="bg-gray-900 text-white">On Hold</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowGoalModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                    Add Goal
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Application Modal */}
      <AnimatePresence>
        {showApplicationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApplicationModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl border border-cyan-500/20 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add Job Application</h2>
              <form onSubmit={handleCreateApplication} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                  <input
                    required
                    value={newApplication.company_name}
                    onChange={(e) => setNewApplication({ ...newApplication, company_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Role</label>
                  <input
                    required
                    value={newApplication.role}
                    onChange={(e) => setNewApplication({ ...newApplication, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={newApplication.application_status}
                    onChange={(e) => setNewApplication({ ...newApplication, application_status: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option value="applied" className="bg-gray-900 text-white">Applied</option>
                    <option value="interviewing" className="bg-gray-900 text-white">Interviewing</option>
                    <option value="offered" className="bg-gray-900 text-white">Offered</option>
                    <option value="rejected" className="bg-gray-900 text-white">Rejected</option>
                    <option value="withdrawn" className="bg-gray-900 text-white">Withdrawn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={newApplication.applied_date}
                    onChange={(e) => setNewApplication({ ...newApplication, applied_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <textarea
                    value={newApplication.notes}
                    onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white h-20 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowApplicationModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                    Add Application
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSkillModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl border border-cyan-500/20 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add Skill</h2>
              <form onSubmit={handleCreateSkill} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Skill Name</label>
                  <input
                    required
                    value={newSkill.skill_name}
                    onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="e.g., React"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <input
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="e.g., Frontend"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newSkill.progress}
                    onChange={(e) => setNewSkill({ ...newSkill, progress: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newSkill.target_date}
                    onChange={(e) => setNewSkill({ ...newSkill, target_date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowSkillModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                    Add Skill
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning Modal */}
      <AnimatePresence>
        {showLearningModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLearningModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-xl border border-cyan-500/20 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Add Learning Course</h2>
              <form onSubmit={handleCreateLearning} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Course Title</label>
                  <input
                    required
                    value={newLearning.title}
                    onChange={(e) => setNewLearning({ ...newLearning, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="e.g., Advanced React Patterns"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Platform</label>
                  <input
                    value={newLearning.platform}
                    onChange={(e) => setNewLearning({ ...newLearning, platform: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="e.g., Udemy"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Status</label>
                  <select
                    value={newLearning.status}
                    onChange={(e) => setNewLearning({ ...newLearning, status: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    <option value="not_started" className="bg-gray-900 text-white">Not Started</option>
                    <option value="in_progress" className="bg-gray-900 text-white">In Progress</option>
                    <option value="completed" className="bg-gray-900 text-white">Completed</option>
                    <option value="paused" className="bg-gray-900 text-white">Paused</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newLearning.progress}
                    onChange={(e) => setNewLearning({ ...newLearning, progress: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowLearningModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                    Add Course
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
