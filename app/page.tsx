'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { renderCanvas } from '@/components/ui/hero-designali'
import { ThemeToggle } from '@/components/ui/theme-toggle'
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-x-hidden font-sans relative transition-colors duration-300">
      <canvas className="pointer-events-none fixed inset-0 w-full h-full" id="canvas" style={{ zIndex: 0 }}></canvas>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-colors duration-300">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">LifeOS AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/sign-in" 
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:flex items-center"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleAuthNavigation(e, '/sign-in')}
                disabled={!!loadingRoute}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg px-5 h-9 text-xs transition-all shadow-sm"
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
            <div className="inline-flex items-center gap-3 p-1 pr-4 rounded-full border border-border bg-card/50 text-xs font-medium mb-6 transition-colors duration-300">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/20 transition-colors duration-300">
                AI-Powered Life Management
              </div>
              <span className="text-muted-foreground text-[10px] flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
                Explore Platform <ArrowRight size={12} />
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 leading-[1.1] uppercase text-foreground font-sans transition-colors duration-300">
              Your AI-Powered <br />
              <span className="text-primary drop-shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-colors duration-300">Life Operating System</span>
            </h1>
            
            <p className="text-xs md:text-sm text-muted-foreground mb-3 leading-relaxed max-w-2xl mx-auto lg:mx-0 transition-colors duration-300">
              An AI-driven platform for real-time goal tracking, habit formation, financial analysis, and automated productivity remediation.
            </p>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-success/20 bg-success/5 text-success text-[8px] font-bold tracking-widest uppercase mb-4 transition-colors duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
              Autonomous Detection Enabled
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/sign-in" className="w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto h-8 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] rounded-full transition-all group"
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
                    className="w-full sm:w-auto h-8 px-4 bg-transparent border border-border hover:bg-card/50 text-foreground font-bold text-[10px] rounded-full transition-all"
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 blur-[80px] rounded-full pointer-events-none transition-colors duration-300" />
            
            {/* Node indicator Top */}
            <div className="absolute top-0 right-10 z-30 flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-card/80 backdrop-blur-md text-[9px] text-muted-foreground uppercase tracking-widest shadow-sm transition-colors duration-300">
              <div className="w-1 h-1 rounded-full bg-primary"></div>
              Data Sync: Realtime
            </div>

            {/* Card 1: System Health */}
            <div className="absolute top-0 right-0 w-72 glass-light rounded-xl border border-border p-4 shadow-xl z-10 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-success/10 border border-success/20 flex items-center justify-center transition-colors duration-300">
                    <Heart className="w-3.5 h-3.5 text-success" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-xs tracking-wide">Wellness Score</h3>
                    <p className="text-[8px] text-success font-bold tracking-widest uppercase mt-0.5">Optimal Balance</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">92.5%</p>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-0.5">Weekly Average</p>
                </div>
              </div>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden mb-2 transition-colors duration-300">
                <div className="h-full bg-success w-[92.5%] transition-colors duration-300"></div>
              </div>
              <div className="flex justify-between text-[7px] text-muted-foreground uppercase tracking-widest transition-colors duration-300">
                <span>Sleep: 7.5h</span>
                <span>Activity: High</span>
              </div>
            </div>

            {/* Card 2: Anomaly Engine */}
            <div className="absolute top-32 right-20 w-72 glass-light rounded-xl border border-border p-4 shadow-xl z-20 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors duration-300">
                  <Target className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-xs tracking-wide">Habit Engine</h3>
                  <p className="text-[8px] text-primary font-bold tracking-widest uppercase mt-0.5">Tracking 12 Active Habits</p>
                </div>
              </div>
              <div className="flex items-end gap-1 h-10 w-full">
                {[30, 45, 25, 60, 40, 80, 50, 40, 30, 20, 35, 60].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-sm ${i === 6 ? 'bg-primary w-1 relative shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_60%,transparent)]' : 'bg-primary/10 border border-primary/10'}`} style={{ height: `${h}%` }}>
                    {i === 6 && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[1px] h-[120%] bg-primary/80"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: AI Actions */}
            <div className="absolute top-[220px] right-4 w-72 glass-light rounded-xl border border-border p-4 shadow-xl z-30 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-3.5 h-3.5 text-warning" />
                <h3 className="text-foreground font-bold text-[9px] uppercase tracking-widest">AI Productivity Actions</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-primary font-bold text-[10px] tracking-wider">GOAL_ADJUSTED</p>
                    <p className="text-muted-foreground text-[8px] mt-0.5">Learn Spanish (Extended by 2d)</p>
                  </div>
                  <span className="text-[8px] text-muted-foreground font-medium">2m ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-accent font-bold text-[10px] tracking-wider">BUDGET_WARNING</p>
                    <p className="text-muted-foreground text-[8px] mt-0.5">Dining out limit reached</p>
                  </div>
                  <span className="text-[8px] text-muted-foreground font-medium">12m ago</span>
                </div>
              </div>
            </div>

            {/* Node indicator Bottom */}
            <div className="absolute bottom-4 right-10 z-30 flex items-center gap-2 px-2.5 py-1 rounded-full border border-border bg-card/80 backdrop-blur-md text-[9px] text-muted-foreground uppercase tracking-widest shadow-sm transition-colors duration-300">
              <div className="w-1 h-1 rounded-full bg-accent"></div>
              AI Model: Active
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Ecosystem Showcase */}
      <section className="py-24 px-6 relative z-20">
        <div className="max-w-6xl mx-auto border-t border-border pt-20 transition-colors duration-300">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-widest font-sans text-foreground transition-colors duration-300"
            >
              One <span className="text-primary">Connected Ecosystem.</span>
            </motion.h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed transition-colors duration-300">Replace 5 different subscription apps with one unified, intelligent platform powered by AI.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: "easeOut" }}
                className="glass-light p-6 rounded-2xl border-border hover:bg-card/50 transition-colors duration-300 cursor-default group"
              >
                <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 border border-border">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold mb-2 tracking-wide text-foreground transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed transition-colors duration-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights Showcase */}
      <section className="py-24 px-6 relative z-20 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 border-t border-border pt-20 transition-colors duration-300">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight uppercase tracking-widest font-sans text-foreground transition-colors duration-300">
              AI that actually <br/><span className="text-accent">understands you.</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md transition-colors duration-300">
              LifeOS AI doesn't just store your data; it analyzes it. By cross-referencing your sleep patterns with your productivity metrics and financial habits, it generates personalized recommendations to optimize your life.
            </p>
            <ul className="space-y-4">
              {['Predictive burnout alerts', 'Automated budget optimization', 'Spaced-repetition scheduling', 'Correlated health analytics'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground text-xs font-medium transition-colors duration-300">
                  <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center transition-colors duration-300">
                    <CheckCircle2 className="text-accent w-3 h-3" />
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
              <div className="glass-light p-5 rounded-xl border-border transition-colors duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-destructive w-4 h-4" />
                  <span className="font-bold text-destructive text-[10px] uppercase tracking-widest">Wellness Alert</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed transition-colors duration-300">Your sleep consistency dropped by 15% this week. This strongly correlates with your missed workouts. Consider sleeping 30m earlier tonight.</p>
              </div>
              
              <div className="glass-light p-5 rounded-xl border-border ml-4 lg:ml-8 transition-colors duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="text-primary w-4 h-4" />
                  <span className="font-bold text-primary text-[10px] uppercase tracking-widest">Goal Milestone</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed transition-colors duration-300">You are 80% likely to finish your "Learn Spanish" goal by Friday based on your current velocity. Keep up the 14-day streak!</p>
              </div>

              <div className="glass-light p-5 rounded-xl border-border transition-colors duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="text-success w-4 h-4" />
                  <span className="font-bold text-success text-[10px] uppercase tracking-widest">Budget Optimization</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed transition-colors duration-300">You've spent ₹120 on dining out this week. Pausing subscriptions XYZ could save you ₹45/mo to offset this.</p>
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
            className="bg-card/40 rounded-3xl p-10 md:p-16 border border-border text-center relative overflow-hidden transition-colors duration-300"
          >
            <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4 uppercase tracking-widest font-sans text-foreground transition-colors duration-300">Ready to upgrade your life?</h2>
            <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto leading-relaxed transition-colors duration-300">
              Join thousands of high-achievers using LifeOS AI to organize, track, and elevate their daily routines.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/sign-in">
                <Button 
                  className="h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-full transition-all"
                >
                  Create Free Account
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-6 relative z-20 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-colors duration-300">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight transition-colors duration-300">LifeOS AI</span>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground transition-colors duration-300">
            <Link href="#" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground transition-colors duration-300">
            <a href="#" className="hover:text-foreground transition-colors"><Github size={16} /></a>
            <a href="#" className="hover:text-foreground transition-colors"><Linkedin size={16} /></a>
          </div>
        </div>
        <div className="text-center text-muted-foreground text-[10px] mt-8 font-medium transition-colors duration-300">
          &copy; {new Date().getFullYear()} LifeOS AI. All rights reserved. Built for the future.
        </div>
      </footer>
    </div>
  )
}
