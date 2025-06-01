'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number | string
  duration?: number
  delay?: number
}

export function AnimatedCounter({ value, duration = 2, delay = 0 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(0)
  
  // Convert string values like "10,000+" to numbers for animation
  const numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/[^\d]/g, '')) || 0 
    : value

  const spring = useSpring(0, { duration: duration * 1000 })
  const display = useTransform(spring, (current) => {
    if (typeof value === 'string' && value.includes('+')) {
      return current < numericValue ? Math.round(current).toLocaleString() + '+' : value
    }
    if (typeof value === 'string' && value.includes('%')) {
      return Math.round(current) + '%'
    }
    if (typeof value === 'string' && value.includes('s')) {
      return '< ' + Math.round(current) + 's avg'
    }
    return Math.round(current).toLocaleString()
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(numericValue)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [spring, numericValue, delay])

  useEffect(() => {
    return display.on("change", (latest) => setDisplayValue(latest))
  }, [display])

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {displayValue}
    </motion.span>
  )
} 