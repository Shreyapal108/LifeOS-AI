'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { Github, Loader2, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import { SparklesCore } from '@/components/ui/sparkles'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-stretch justify-center relative overflow-hidden bg-background text-foreground selection:bg-cyan-500/30 transition-colors duration-300">
      <AnimatedBackground />

      {/* Left Side: Cinematic Content (Desktop Only) */}
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-1/2 relative bg-background overflow-hidden border-r border-border order-1 transition-colors duration-300"
      >
        {/* Logo (Top Left) */}
        <div className="absolute top-12 left-16 z-30">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 transition-colors duration-300">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-foreground font-heading transition-colors duration-300">LifeOS AI</span>
          </Link>
        </div>

        {/* Centered Content with Isolated Particles */}
        <div className="relative z-20 w-full flex flex-col items-center justify-start px-16 pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold text-foreground tracking-tighter text-center leading-tight font-heading uppercase transition-colors duration-300">
              Access Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-colors duration-300">
                Life Operating System.
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground/70 text-sm max-w-sm text-center leading-relaxed font-medium tracking-tight transition-colors duration-300">
              Sign in to synchronize your neural-link node and resume operations.
            </p>

            {/* Glowing Line & Sparkles Module */}
            <div className="relative mt-12 w-full max-w-xl h-48">
              {/* Cinematic Gradients */}
              <div className="absolute inset-x-10 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent blur-sm transition-colors duration-300" />
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent transition-colors duration-300" />
              <div className="absolute inset-x-40 top-0 h-[5px] bg-gradient-to-r from-transparent via-accent to-transparent blur-md transition-colors duration-300" />
              <div className="absolute inset-x-40 top-0 h-px bg-gradient-to-r from-transparent via-accent/80 to-transparent transition-colors duration-300" />

              {/* Core Particles */}
              <SparklesCore
                id="signin-sparkles-module"
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={900}
                className="w-full h-full"
                particleColor="#FFFFFF"
                speed={0.8}
              />

              {/* Radial Gradient mask for seamless blending */}
              <div className="absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)] transition-colors duration-300" />
            </div>
          </motion.div>
        </div>

        {/* Protocol Line */}
        <div className="absolute bottom-12 left-16 z-30">
          <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/10 uppercase tracking-[0.4em] font-mono transition-colors duration-300">
            AUTHENTICATION_MODULE // SECURE_UPLINK
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Right Side: Auth Form */}
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10 order-2 bg-background transition-colors duration-300"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 transition-colors duration-300">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-foreground transition-colors duration-300">LifeOS AI</span>
            </Link>
          </div>

          <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-border shadow-[0_0_50px_color-mix(in_srgb,var(--primary)_10%,transparent)] backdrop-blur-2xl relative overflow-hidden group transition-colors duration-300">

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight transition-colors duration-300">Access Interface</h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed transition-colors duration-300">Welcome back. Enter your credentials to proceed.</p>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <Button variant="outline" className="bg-card/50 border-border hover:bg-card/60 text-foreground font-medium h-12 rounded-2xl transition-all duration-300">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button variant="outline" className="bg-card/50 border-border hover:bg-card/60 text-foreground font-medium h-12 rounded-2xl transition-all duration-300">
                <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                <span className="bg-background px-3 text-muted-foreground font-bold transition-colors duration-300">Or use email</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1 transition-colors duration-300">
                  Identity (Email)
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full h-12 bg-card/50 border-border focus:border-primary/50 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-2xl transition-all duration-300 pl-4 text-sm font-medium"
                  />
                  <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within:border-primary/50 transition-all pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] transition-colors duration-300">
                    Security Key (Password)
                  </label>
                  <Link href="#" className="text-[10px] text-primary hover:text-primary/80 font-bold transition-colors uppercase tracking-wider">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 bg-card/50 border-border focus:border-primary/50 focus:ring-primary/20 text-foreground placeholder-muted-foreground rounded-2xl transition-all duration-300 pl-4 pr-12 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <div className="absolute inset-0 rounded-2xl border border-primary/0 group-focus-within:border-primary/50 transition-all pointer-events-none" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-xs font-bold flex items-center gap-3 overflow-hidden transition-colors duration-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_20%,transparent)] disabled:opacity-50 relative overflow-hidden"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Authorize Access"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest transition-colors duration-300">
                Need an interface node?
              </p>

              <Link href="/sign-up">
                <Button
                  variant="ghost"
                  className="h-10 px-6 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl transition-all flex items-center gap-2"
                >
                  Create Node
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

