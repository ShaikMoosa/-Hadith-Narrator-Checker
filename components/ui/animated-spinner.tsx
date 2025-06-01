'use client'

import { motion } from 'framer-motion'
import { Brain, Sparkles } from 'lucide-react'

interface AnimatedSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  icon?: 'brain' | 'sparkles'
}

export function AnimatedSpinner({ size = 'md', text, icon = 'brain' }: AnimatedSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  const IconComponent = icon === 'brain' ? Brain : Sparkles

  return (
    <div className="flex items-center justify-center gap-3">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className={`${sizeClasses[size]} rounded-full border-2 border-blue-200 border-t-blue-600`} />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <IconComponent className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600`} />
        </motion.div>
      </motion.div>
      
      {text && (
        <motion.p
          className="text-sm text-gray-600"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
} 