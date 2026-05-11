'use client'

import { motion } from 'framer-motion'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-[20%] right-[-20%] w-[60vw] h-[60vw] bg-purple-500/20 rounded-full blur-[150px]"
        animate={{
          x: [0, -50, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[40vw] h-[40vw] bg-blue-500/20 rounded-full blur-[100px]"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[50px]"></div>
    </div>
  )
}
