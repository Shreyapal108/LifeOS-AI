'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Activity, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface HealthLoggingModalProps {
  onSuccess?: () => void;
}

export function HealthLoggingModal({ onSuccess }: HealthLoggingModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [sleepHours, setSleepHours] = useState('')
  const [waterIntake, setWaterIntake] = useState('')
  const [mood, setMood] = useState('')
  const [steps, setSteps] = useState('')
  const [workoutCompleted, setWorkoutCompleted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const payload = {
        user_id: user.id,
        sleep_hours: parseFloat(sleepHours) || 0,
        water_intake_liters: parseFloat(waterIntake) || 0,
        mood: mood || null,
        steps: parseInt(steps, 10) || 0,
        workout_completed: workoutCompleted,
        log_date: new Date().toISOString().split('T')[0], // Current date (YYYY-MM-DD)
      }

      // Check if a log for today already exists
      const { data: existingLog } = await supabase
        .from('health_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('log_date', payload.log_date)
        .maybeSingle()

      let operationError = null

      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('health_logs')
          .update(payload)
          .eq('id', existingLog.id)
        operationError = error
      } else {
        // Insert new log
        const { error } = await supabase
          .from('health_logs')
          .insert([payload])
        operationError = error
      }

      if (operationError) {
        console.error("Database Error:", operationError);
        throw operationError
      }

      toast.success('Health logged successfully!')
      setOpen(false)
      if (onSuccess) onSuccess()
      router.refresh()

      // Reset form
      setSleepHours('')
      setWaterIntake('')
      setMood('')
      setSteps('')
      setWorkoutCompleted(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to log health data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="futuristic-button h-12 px-8 font-bold uppercase tracking-wider text-xs">
          <Plus size={18} className="mr-2" />
          Log Health Metrics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] glass-heavy border-white/5 text-white p-0 overflow-hidden rounded-[2rem]">
        <div className="p-8 border-b border-white/5 bg-white/2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight">
              Biometric Audit
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              Synchronize your daily wellness metrics with the core system.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sleep" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Rest Cycle (Hours)</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="7.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="futuristic-input h-12 rounded-xl px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Hydration (Liters)</Label>
              <Input
                id="water"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="2.5"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
                className="futuristic-input h-12 rounded-xl px-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="steps" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Kinetic Energy (Steps)</Label>
              <Input
                id="steps"
                type="number"
                min="0"
                placeholder="8000"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="futuristic-input h-12 rounded-xl px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Neural State</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood" className="futuristic-input h-12 rounded-xl px-4 border-white/5 bg-white/2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glass-heavy border-white/10 bg-[#0a0a1a] text-white rounded-xl">
                  <SelectItem value="Excellent" className="focus:bg-cyan-500/10 focus:text-cyan-400">Excellent 🤩</SelectItem>
                  <SelectItem value="Good" className="focus:bg-cyan-500/10 focus:text-cyan-400">Good 🙂</SelectItem>
                  <SelectItem value="Neutral" className="focus:bg-cyan-500/10 focus:text-cyan-400">Neutral 😐</SelectItem>
                  <SelectItem value="Stressed" className="focus:bg-red-500/10 focus:text-red-400">Stressed 😫</SelectItem>
                  <SelectItem value="Tired" className="focus:bg-purple-500/10 focus:text-purple-400">Tired 😴</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/2 transition-colors hover:border-cyan-500/20">
            <div className="space-y-1">
              <Label className="text-sm font-bold text-white uppercase tracking-tight">Active Workout Protocol</Label>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Has physical exertion been logged?</p>
            </div>
            <Switch
              checked={workoutCompleted}
              onCheckedChange={setWorkoutCompleted}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="flex-1 h-12 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white"
            >
              Abort
            </Button>
            <Button 
              type="submit" 
              className="futuristic-button flex-1 h-12 text-xs font-bold uppercase tracking-widest"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
