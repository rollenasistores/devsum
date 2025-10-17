"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function GlobalCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Only show custom cursor on the main page
  const shouldShowCustomCursor = pathname === '/'

  useEffect(() => {
    setMounted(true)

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

  if (!mounted || !shouldShowCustomCursor) return null

  return (
    <>
      {/* Cursor ring - follows immediately */}
      <motion.div
        className="fixed w-6 h-6 rounded-full border border-primary/50 pointer-events-none z-[9998]"
        animate={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
        transition={{ 
          duration: 0.1, 
          ease: "easeOut"
        }}
        style={{
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.3)"
        }}
      />
      
      {/* Inner circle - follows with delay */}
      <motion.div
        className="fixed w-4 h-4 rounded-full bg-primary pointer-events-none z-[9999]"
        animate={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
        transition={{ 
          duration: 0.3, 
          ease: "easeOut"
        }}
        style={{
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4)"
        }}
      />

      {/* Simple cursor trail */}
      <motion.div
        className="fixed w-16 h-16 rounded-full bg-primary/10 blur-xl pointer-events-none z-[9997]"
        animate={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
        }}
        transition={{ 
          duration: 0.1, 
          ease: "easeOut"
        }}
        style={{
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)"
        }}
      />
    </>
  )
}
