"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

// Scroll progress indicator
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
      style={{ scaleX }}
    />
  )
}

// Parallax component
interface ParallaxProps {
  children: React.ReactNode
  offset?: number
  className?: string
}

export function Parallax({ children, offset = 50, className = "" }: ParallaxProps) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -offset])

  return (
    <motion.div
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  )
}

// Scroll reveal hook
export function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
      }
    )

    observer.observe(ref)

    return () => {
      observer.unobserve(ref)
    }
  }, [ref])

  return { ref: setRef, isVisible }
}

// Mouse parallax effect
export function MouseParallax({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 20,
        y: (e.clientY - window.innerHeight / 2) / 20,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <motion.div
      className={className}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  )
}
