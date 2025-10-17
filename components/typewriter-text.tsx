"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  onComplete?: () => void
  loop?: boolean
  highlightWords?: string[]
  highlightClassName?: string
}

export function TypewriterText({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = "",
  onComplete,
  loop = false,
  highlightWords = [],
  highlightClassName = "text-primary font-bold"
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isLooping, setIsLooping] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, delay + (currentIndex * speed))

      return () => clearTimeout(timeout)
    } else if (!isComplete) {
      setIsComplete(true)
      onComplete?.()
      
      // If looping is enabled, reset after a delay
      if (loop) {
        setTimeout(() => {
          setDisplayedText("")
          setCurrentIndex(0)
          setIsComplete(false)
          setIsLooping(true)
        }, 2000) // Wait 2 seconds before restarting
      }
    }
  }, [currentIndex, text, speed, delay, isComplete, onComplete, loop])

  // Reset looping state when starting new cycle
  useEffect(() => {
    if (isLooping && currentIndex === 0) {
      setIsLooping(false)
    }
  }, [isLooping, currentIndex])

  // Function to render text with highlighted words
  const renderTextWithHighlights = (text: string) => {
    if (highlightWords.length === 0) return text
    
    let result = text
    highlightWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      result = result.replace(regex, `<span class="${highlightClassName}">${word}</span>`)
    })
    return result
  }

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span 
        dangerouslySetInnerHTML={{ 
          __html: renderTextWithHighlights(displayedText) 
        }} 
      />
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="ml-1"
      >
        |
      </motion.span>
    </motion.span>
  )
}
