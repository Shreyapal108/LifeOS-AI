'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { renderCanvas } from '@/components/ui/hero-designali'
import { 
  Target, Zap, IndianRupee, BookOpen, Heart, 
  Lightbulb, BarChart3, Github, 
  Linkedin, ArrowRight, ShieldCheck, Sparkles, Brain, CheckCircle2, Activity, Loader2
} from 'lucide-react'

const features = [
  { icon: Target, title: "Goal Management", desc: "Break down ambitious dreams into daily actionable steps.", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { icon: Zap, title: "Habit Tracking", desc: "Build unbreakable streaks with gamified consistency tracking.", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { icon: IndianRupee, title: "Expense Monitoring", desc: "AI-driven budgeting to maximize your financial health.", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  { icon: BookOpen, title: "Study Planner", desc: "Optimize your learning curve with intelligent spaced repetition.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: Heart, title: "Health & Wellness", desc: "Correlate sleep, hydration, and mood with your productivity.", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { icon: Lightbulb, title: "AI Insights", desc: "Get real-time actionable recommendations tailored to you.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
]

export default function Home() {
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    renderCanvas()
  }, [])

  const handleAuthNavigation = async (e: React.MouseEvent, targetRoute: string) => {
    e.preventDefault()
    if (loadingRoute) return
    
    setLoadingRoute(targetRoute)
    
    // Always redirect to sign-in page first
    // The sign-in page will handle checking for existing sessions
    router.push('/sign-in')
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-cyan-500/30 overflow-x-hidden font-sans relative">
      <canvas className="pointer-events-none fixed inset-0 w-full h-full" id="canvas" style={{ zIndex: 0 }}></canvas>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">LifeOS AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/sign-in" 
              className="text-xs font-semibold text-gray-400 hover:text-white transition-colors hidden sm:flex items-center"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleAuthNavigation(e, '/sign-in')}
                disabled={!!loadingRoute}
                className="bg-white hover:bg-gray-200 text-black font-bold rounded-lg px-5 h-9 text-xs transition-all shadow-sm"
              >
                {loadingRoute === '/sign-in' ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Static Clean Hero Section */}
      <section className="pt-28 lg:pt-36 pb-20 px-6 relative z-10">
        <div className="max-w-6xl w-full mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          
          {/* Left: Text Content */}
          <motion.div 
            className="flex-1 text-center lg:text-left z-20 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Top Pill */}
            <div className="inline-flex items-center gap-3 p-1 pr-4 rounded-full border border-white/5 bg-white/[0.02] text-xs font-medium mb-6">
              <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20">
                AI-Powered Life Management
              </div>
              <span className="text-gray-400 text-[10px] flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                Explore Platform <ArrowRight size={12} />
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-[1.1] uppercase text-white font-sans">
              Your AI-Powered <br />
              <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.2)]">Life Operating System</span>
            </h1>
            
            <p className="text-xs md:text-sm text-gray-400 mb-3 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              An AI-driven platform for real-time goal tracking, habit formation, financial analysis, and automated productivity remediation.
            </p>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-green-500/20 bg-green-500/5 text-green-400 text-[8px] font-bold tracking-widest uppercase mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Autonomous Detection Enabled
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto h-8 px-4 bg-white hover:bg-gray-200 text-black font-bold text-[10px] rounded-full transition-all group"
                  >
                    <Zap className="w-3 h-3 mr-1.5" />
                    Launch Dashboard
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto h-8 px-4 bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold text-[10px] rounded-full transition-all"
                  >
                    <Activity className="w-3 h-3 mr-1.5" />
                    Explore Dashboard
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Floating Cards (Clean Layout) */}
          <motion.div 
            className="flex-1 w-full relative z-10 hidden lg:block h-[450px]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
          >
            {/* Subtle glow behind cards */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            {/* Node indicator Top */}
            <div className="absolute top-0 right-10 z-30 flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md text-[9px] text-gray-400 uppercase tracking-widest shadow-sm">
              <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              Data Sync: Realtime
            </div>

            {/* Card 1: System Health */}
            <div className="absolute top-0 right-0 w-72 glass-light bg-[#0a0a0f]/60 rounded-xl border border-white/5 p-4 shadow-none z-10 hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xs tracking-wide">Wellness Score</h3>
                    <p className="text-[8px] text-green-400 font-bold tracking-widest uppercase mt-0.5">Optimal Balance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">92.5%</p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">Weekly Average</p>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-green-400 w-[92.5%]"></div>
              </div>
              <div className="flex justify-between text-[7px] text-gray-500 uppercase tracking-widest">
                <span>Sleep: 7.5h</span>
                <span>Activity: High</span>
              </div>
            </div>

            {/* Card 2: Anomaly Engine */}
            <div className="absolute top-32 right-20 w-72 glass-light bg-[#0a0a0f]/80 rounded-xl border border-white/5 p-4 shadow-none z-20 hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xs tracking-wide">Habit Engine</h3>
                  <p className="text-[8px] text-blue-400 font-bold tracking-widest uppercase mt-0.5">Tracking 12 Active Habits</p>
                </div>
              </div>
              <div className="flex items-end gap-1 h-10 w-full">
                {[30, 45, 25, 60, 40, 80, 50, 40, 30, 20, 35, 60].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-sm ${i === 6 ? 'bg-blue-400 w-1 relative shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-blue-500/10 border border-blue-500/10'}`} style={{ height: `${h}%` }}>
                    {i === 6 && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[1px] h-[120%] bg-blue-300"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: AI Actions */}
            <div className="absolute top-[220px] right-4 w-72 glass-light bg-[#0a0a0f]/70 rounded-xl border border-white/5 p-4 shadow-none z-30 hover:-translate-y-1 transition-transform">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <h3 className="text-white font-bold text-[9px] uppercase tracking-widest">AI Productivity Actions</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-400 font-bold text-[10px] tracking-wider">GOAL_ADJUSTED</p>
                    <p className="text-gray-500 text-[8px] mt-0.5">Learn Spanish (Extended by 2d)</p>
                  </div>
                  <span className="text-[8px] text-gray-600 font-medium">2m ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-purple-400 font-bold text-[10px] tracking-wider">BUDGET_WARNING</p>
                    <p className="text-gray-500 text-[8px] mt-0.5">Dining out limit reached</p>
                  </div>
                  <span className="text-[8px] text-gray-600 font-medium">12m ago</span>
                </div>
              </div>
            </div>

            {/* Node indicator Bottom */}
            <div className="absolute bottom-4 right-10 z-30 flex items-center gap-2 px-2.5 py-1 rounded-full border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md text-[9px] text-gray-400 uppercase tracking-widest shadow-sm">
              <div className="w-1 h-1 rounded-full bg-purple-500"></div>
              AI Model: Active
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Ecosystem Showcase */}
      <section className="py-24 px-6 relative z-20">
        <div className="max-w-6xl mx-auto border-t border-white/5 pt-20">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-widest font-sans"
            >
              One <span className="text-cyan-400">Connected Ecosystem.</span>
            </motion.h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">Replace 5 different subscription apps with one unified, intelligent platform powered by AI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                className="glass-light shadow-none bg-[#0a0a0f]/40 p-6 rounded-2xl border-white/5 hover:bg-[#0a0a0f]/80 transition-colors duration-300 cursor-default group"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold mb-2 tracking-wide">{feature.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights Showcase */}
      <section className="py-24 px-6 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 border-t border-white/5 pt-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight uppercase tracking-widest font-sans">
              AI that actually <br/><span className="text-magenta-400">understands you.</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-md">
              LifeOS AI doesn't just store your data; it analyzes it. By cross-referencing your sleep patterns with your productivity metrics and financial habits, it generates personalized recommendations to optimize your life.
            </p>
            <ul className="space-y-4">
              {['Predictive burnout alerts', 'Automated budget optimization', 'Spaced-repetition scheduling', 'Correlated health analytics'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300 text-xs font-medium">
                  <div className="w-5 h-5 rounded-full bg-magenta-500/10 flex items-center justify-center">
                    <CheckCircle2 className="text-magenta-400 w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 relative w-full"
          >
            {/* Cleaner Insight Cards layout */}
            <div className="space-y-4 relative z-10 w-full max-w-sm mx-auto lg:ml-auto lg:mr-0">
              <div className="glass-light shadow-none bg-[#0a0a0f]/60 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-rose-400 w-4 h-4" />
                  <span className="font-bold text-rose-400 text-[10px] uppercase tracking-widest">Wellness Alert</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">Your sleep consistency dropped by 15% this week. This strongly correlates with your missed workouts. Consider sleeping 30m earlier tonight.</p>
              </div>
              
              <div className="glass-light shadow-none bg-[#0a0a0f]/60 p-5 rounded-xl border border-white/5 ml-4 lg:ml-8">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-cyan-400 w-4 h-4" />
                  <span className="font-bold text-cyan-400 text-[10px] uppercase tracking-widest">Goal Milestone</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">You are 80% likely to finish your "Learn Spanish" goal by Friday based on your current velocity. Keep up the 14-day streak!</p>
              </div>

              <div className="glass-light shadow-none bg-[#0a0a0f]/60 p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="text-green-400 w-4 h-4" />
                  <span className="font-bold text-green-400 text-[10px] uppercase tracking-widest">Budget Optimization</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">You've spent ₹120 on dining out this week. Pausing subscriptions XYZ could save you ₹45/mo to offset this.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Analytics CTA */}
      <section className="py-24 px-6 relative z-20">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#0a0a0f]/40 rounded-3xl p-10 md:p-16 border border-white/5 text-center relative overflow-hidden"
          >
            <ShieldCheck className="w-10 h-10 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-widest font-sans">Ready to upgrade your life?</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of high-achievers using LifeOS AI to organize, track, and elevate their daily routines.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/sign-in">
                <Button 
                  className="h-10 px-8 bg-white text-black hover:bg-gray-200 font-bold text-xs rounded-full transition-all"
                >
                  Create Free Account
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030303] py-12 px-6 relative z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">LifeOS AI</span>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-medium text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Features</Link>
            <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>

          <div className="flex items-center gap-4 text-gray-500">
            <a href="#" className="hover:text-white transition-colors"><Github size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={16} /></a>
          </div>
        </div>
        <div className="text-center text-gray-700 text-[10px] mt-8 font-medium">
          &copy; {new Date().getFullYear()} LifeOS AI. All rights reserved. Built for the future.
        </div>
      </footer>
    </div>
  )
}
