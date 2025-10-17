"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Terminal, Github, BookOpen } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"

export function Header() {
  const { scrollY } = useScroll()
  const headerHeight = useTransform(scrollY, [0, 100], [80, 60])
  const headerOpacity = useTransform(scrollY, [0, 50], [0.95, 0.98])
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      style={{ 
        height: headerHeight,
        opacity: headerOpacity
      }}
    >
      <div className="container mx-auto max-w-7xl px-6 flex h-full items-center justify-between">
        <motion.div
          style={{ scale: logoScale }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Terminal className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-bold text-xl">DevSum CLI</span>
          </Link>
        </motion.div>

        <motion.nav 
          className="hidden md:flex items-center gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/#examples"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Examples
            </Link>
          </motion.div>
        </motion.nav>

        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex"
          >
            <Button variant="ghost" size="sm" asChild>
              <Link href="https://github.com/rollenasistores/devsum" target="_blank" rel="noopener noreferrer">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Github className="h-4 w-4 mr-2" />
                </motion.div>
                GitHub
              </Link>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button size="sm" asChild>
              <Link href="/docs">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                </motion.div>
                Get Started
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  )
}
