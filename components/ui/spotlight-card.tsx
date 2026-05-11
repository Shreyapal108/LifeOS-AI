'use client'

import React, { useEffect, useRef, ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'cyan' | 'magenta'
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  customSize?: boolean // When true, ignores size prop and uses width/height or className
}

const glowColorMap = {
  blue: 'rgba(59, 130, 246, 0.25)',
  purple: 'rgba(168, 85, 247, 0.25)',
  green: 'rgba(34, 197, 94, 0.25)',
  red: 'rgba(239, 68, 68, 0.25)',
  orange: 'rgba(249, 115, 22, 0.25)',
  cyan: 'rgba(6, 182, 212, 0.25)',
  magenta: 'rgba(236, 72, 153, 0.25)'
}

export const GlowCard = ({
  children,
  className = '',
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
}: GlowCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      container.style.setProperty('--x', `${x}px`)
      container.style.setProperty('--y', `${y}px`)
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const sizeStyles = customSize
    ? { width: width || 'auto', height: height || 'auto' }
    : {
      width: width || (size === 'sm' ? '280px' : size === 'md' ? '400px' : '600px'),
      height: height || (size === 'sm' ? '180px' : size === 'md' ? '250px' : '350px'),
    }

  const glowColorValue = glowColorMap[glowColor] || glowColorMap.blue

  return (
    <div
      ref={containerRef}
      className={`glass rounded-2xl group ${className}`}
      style={{
        ...sizeStyles,
        ['--glow-color' as any]: glowColorValue,
      }}
    >
      {/* Background spotlight effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at var(--x) var(--y), var(--glow-color), transparent 40%)`,
        }}
      />

      {/* Subtle overlay to soften the glow */}
      <div className="absolute inset-0 bg-white/10 dark:bg-[#030712]/40 backdrop-blur-[1px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  )
}
