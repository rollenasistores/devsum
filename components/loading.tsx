"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface LoadingProps {
  className?: string
  onComplete?: () => void
}

export function Loading({ className = "", onComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [shouldSkipLoading, setShouldSkipLoading] = useState(false)

  useEffect(() => {
    // Check if user came from docs page
    const referrer = document.referrer
    const isFromDocs = referrer.includes('/docs') || referrer.includes('docs')
    
    if (isFromDocs) {
      setShouldSkipLoading(true)
      setIsComplete(true)
      onComplete?.()
      return
    }

    // Check if page is loaded
    const checkPageLoaded = () => {
      if (document.readyState === 'complete') {
        setIsPageLoaded(true)
      }
    }

    // If already loaded
    if (document.readyState === 'complete') {
      setIsPageLoaded(true)
    } else {
      // Listen for load event
      window.addEventListener('load', checkPageLoaded)
      return () => window.removeEventListener('load', checkPageLoaded)
    }
  }, [onComplete])

  useEffect(() => {
    if (!isPageLoaded || shouldSkipLoading) return

    const startTime = Date.now()
    setStartTime(startTime)

    const timer = setInterval(() => {
      setProgress(prev => {
        const elapsed = Date.now() - startTime
        const minProgress = Math.min(95, (elapsed / 3000) * 100) // Minimum 3 seconds to reach 95%
        
        if (prev >= 100) {
          setIsComplete(true)
          onComplete?.()
          return 100
        }
        
        // Use the higher of current progress + increment or minimum progress
        const increment = Math.random() * 3 + 1 // 1-4% increments
        const newProgress = Math.max(prev + increment, minProgress)
        
        return Math.min(newProgress, 100)
      })
    }, 200) // Slower updates: every 200ms instead of 100ms

    return () => clearInterval(timer)
  }, [isPageLoaded, onComplete, shouldSkipLoading])

  if (isComplete || shouldSkipLoading) return null

  return (
    <div className={`fixed inset-0 bg-background z-[9999] flex items-center justify-center ${className}`}>
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main loading content */}
      <div className="relative z-10 text-center">

        {/* Loading animation */}
        <div className="mb-6">
          <motion.div
            className="flex justify-center space-x-1 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
          
          <motion.p
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            Initializing application...
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <motion.div
            className="mt-2 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {Math.round(progress)}%
          </motion.div>
        </div>

        {/* Loading messages */}
        <motion.div
          className="mt-6 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {progress < 30 && "Loading components..."}
            {progress >= 30 && progress < 60 && "Preparing interface..."}
            {progress >= 60 && progress < 90 && "Finalizing setup..."}
            {progress >= 90 && "Almost ready..."}
          </motion.div>
        </motion.div>
      </div>

      {/* Animated border */}
      <motion.div
        className="absolute inset-0 border-2 border-primary/20 rounded-none"
        animate={{
          borderColor: ["rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.8)", "rgba(59, 130, 246, 0.2)"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
