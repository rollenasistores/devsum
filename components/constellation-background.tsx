"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  baseX: number
  baseY: number
}

interface ConstellationBackgroundProps {
  className?: string
}

export function ConstellationBackground({ className = "" }: ConstellationBackgroundProps) {
  const [stars, setStars] = useState<Star[]>([])
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  useEffect(() => {
    setMounted(true)
    
    // Generate random stars (reduced count for performance)
    const generateStars = () => {
      const newStars: Star[] = []
      const starCount = 60 // Reduced from 150
      
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 2, // Larger, more visible stars
          opacity: Math.random() * 0.8 + 0.4, // More opaque
          delay: Math.random() * 2,
          baseX: Math.random() * 100,
          baseY: Math.random() * 100
        })
      }
      setStars(newStars)
    }

    generateStars()

    // Throttled mouse movement handler
    let animationFrame: number
    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      
      animationFrame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100
        const y = (e.clientY / window.innerHeight) * 100
        setMousePosition({ x, y })
      })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  if (!mounted) return null

  return (
    <div className={`absolute inset-0 overflow-hidden cursor-none ${className}`}>

      {/* Reduced gradient overlay for more visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-background/60" />
      
      {/* Optimized stars with CSS transforms */}
      {stars.map((star) => {
        // Simplified distance calculation (avoid Math.sqrt for performance)
        const dx = mousePosition.x - star.baseX
        const dy = mousePosition.y - star.baseY
        const distanceSquared = dx * dx + dy * dy
        const maxDistanceSquared = 30 * 30 // 30px radius squared
        
        // Only calculate if within influence radius
        const attraction = distanceSquared < maxDistanceSquared 
          ? (1 - distanceSquared / maxDistanceSquared) * 0.1
          : 0
        
        return (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white shadow-lg"
            style={{
              left: `${star.baseX}%`,
              top: `${star.baseY}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              boxShadow: `0 0 ${star.size * 2}px rgba(59, 130, 246, 0.4)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.4, star.opacity + attraction * 0.3, 0.4],
              scale: [0.8, 1 + attraction * 0.2, 0.9, 1 + attraction * 0.1],
              x: dx * attraction,
              y: dy * attraction,
            }}
            transition={{
              duration: 3,
              delay: star.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 2 + 1,
              ease: "easeInOut"
            }}
          />
        )
      })}

      {/* Constellation lines */}
      <svg className="absolute inset-0 w-full h-full">
        {stars.slice(0, 20).map((star, index) => {
          const nextStar = stars[(index + 1) % 20]
          return (
            <motion.line
              key={`line-${star.id}`}
              x1={`${star.x}%`}
              y1={`${star.y}%`}
              x2={`${nextStar.x}%`}
              y2={`${nextStar.y}%`}
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.7, 0] }}
              transition={{
                duration: 4,
                delay: index * 0.2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          )
        })}
      </svg>

      {/* Enhanced floating particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-primary/50 rounded-full shadow-lg"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 8px rgba(59, 130, 246, 0.4)`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: 8,
            delay: Math.random() * 4,
            repeat: Infinity,
            repeatDelay: Math.random() * 4,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Static radial gradient for performance */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(59,130,246,0.1)_50%,_transparent_100%)]" />


      {/* Connecting lines from cursor to nearby stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {stars.slice(0, 15).map((star) => {
          // Calculate distance from cursor to star
          const dx = mousePosition.x - star.baseX
          const dy = mousePosition.y - star.baseY
          const distanceSquared = dx * dx + dy * dy
          const distance = Math.sqrt(distanceSquared)
          
          // Only draw lines to nearby stars (within 25% of screen)
          if (distance < 25) {
            const opacity = Math.max(0, 1 - distance / 25) * 0.3
            
            return (
              <motion.line
                key={`cursor-line-${star.id}`}
                x1={`${mousePosition.x}%`}
                y1={`${mousePosition.y}%`}
                x2={`${star.baseX}%`}
                y2={`${star.baseY}%`}
                stroke="rgba(59,130,246,0.6)"
                strokeWidth="1.5"
                opacity={opacity}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: opacity 
                }}
                transition={{ 
                  duration: 0.2, 
                  ease: "easeOut" 
                }}
              />
            )
          }
          return null
        })}
      </svg>
    </div>
  )
}
