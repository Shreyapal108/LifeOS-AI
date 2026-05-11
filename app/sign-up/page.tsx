'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Github, Loader2, Eye, EyeOff, Sparkles, ArrowLeft, User, Mail, Lock } from 'lucide-react'
import { SparklesCore } from '@/components/ui/sparkles'

export default function SignUpPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-stretch justify-center relative overflow-hidden bg-background text-foreground selection:bg-cyan-500/30 transition-colors duration-300">
      <AnimatedBackground />

      {/* Left Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 order-2 lg:order-1 bg-background transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white">LifeOS AI</span>
            </Link>
          </div>

          <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/20 via-cyan-500 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Interface</h2>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">Initialize your neural-link node to begin operations.</p>
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Node Operator (Full Name)
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full h-12 bg-white/5 border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white placeholder-gray-600 rounded-2xl transition-all duration-300 pl-4 text-sm font-medium"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-cyan-500/0 group-focus-within:border-cyan-500/50 transition-all pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Identity (Email)
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full h-12 bg-white/5 border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white placeholder-gray-600 rounded-2xl transition-all duration-300 pl-4 text-sm font-medium"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-cyan-500/0 group-focus-within:border-cyan-500/50 transition-all pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Security Key (Password)
                </label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 bg-white/5 border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white placeholder-gray-600 rounded-2xl transition-all duration-300 pl-4 pr-12 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl border border-cyan-500/0 group-focus-within:border-cyan-500/50 transition-all pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  Confirm Security Key
                </label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 bg-white/5 border-white/5 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-white placeholder-gray-600 rounded-2xl transition-all duration-300 pl-4 pr-12 text-sm font-medium"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-cyan-500/0 group-focus-within:border-cyan-500/50 transition-all pointer-events-none" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 overflow-hidden"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-white text-black hover:bg-gray-200 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-50 relative overflow-hidden"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Initialize Node"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-12 h-12 bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-2xl transition-all p-0"
                >
                  <Github className="w-5 h-5" />
                </Button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                Already part of the network?
              </p>
              <Link href="/sign-in">
                <Button variant="ghost" className="h-10 px-6 text-[10px] font-bold uppercase tracking-widest text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/5 rounded-xl transition-all flex items-center gap-2">
                  Access Interface
                  <ArrowLeft size={14} className="rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side: Cinematic Content (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden border-l border-white/5 order-1 lg:order-2">
        {/* Logo (Top Right) */}
        <div className="absolute top-12 right-16 z-30">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl font-bold tracking-tighter text-white font-heading">LifeOS AI</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Centered Content with Isolated Particles */}
        <div className="relative z-20 w-full flex flex-col items-center justify-start px-16 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold text-white tracking-tighter text-center leading-tight font-heading uppercase">
              Build Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Life Operating System.
              </span>
            </h1>
            <p className="mt-4 text-white/30 text-sm max-w-sm text-center leading-relaxed font-medium tracking-tight">
              Create your AI-powered productivity, finance, wellness, and learning command center.
            </p>

            {/* Glowing Line & Sparkles Module */}
            <div className="relative mt-12 w-full max-w-xl h-48">
              {/* Cinematic Gradients */}
              <div className="absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-sm" />
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
              <div className="absolute inset-x-40 top-0 h-[5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-md" />
              <div className="absolute inset-x-40 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />

              {/* Core Particles */}
              <SparklesCore
                id="signup-sparkles-module"
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={900}
                className="w-full h-full"
                particleColor="#FFFFFF"
                speed={0.8}
              />

              {/* Radial Gradient mask for seamless blending */}
              <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
            </div>
          </motion.div>
        </div>

        {/* Protocol Line */}
        <div className="absolute bottom-12 right-16 z-30">
          <div className="flex items-center gap-4 text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] font-mono">
             DEPLOYMENT_V1.0 // NEURAL_GRID_STANDBY
             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
