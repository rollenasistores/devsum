"use client"

import { Button } from "@/components/ui/button"
import { Github, ArrowRight } from "lucide-react"
import { TerminalWindow } from "@/components/ui/terminal-window"
import { AnimatedTerminal } from "@/components/animated-terminal"
import { VersionBadgeClient } from "@/components/version-badge-client"
import Link from "next/link"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer, staggerChildren, float, pulse, hoverScale, hoverGlow } from "@/lib/animations"
import { Parallax } from "@/components/scroll-effects"
import { TypewriterText } from "@/components/typewriter-text"
import { ConstellationBackground } from "@/components/constellation-background"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border min-h-screen flex items-center">
      <ConstellationBackground />
      
      {/* Additional gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/30" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp}>
            <VersionBadgeClient className="mb-4" />
          </motion.div>

              <motion.h1
                className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl text-balance"
                variants={fadeInUp}
              >
                  <TypewriterText
                    text="Transform Git Commits into Professional Reports"
                    speed={5}
                    delay={50}
                    className="text-foreground"
                    loop={true}
                    highlightWords={["Git Commits"]}
                    highlightClassName="text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg"
                  />
              </motion.h1>

          <motion.p 
            className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty"
            variants={fadeInUp}
          >
            DevSum CLI uses AI to analyze your git history and generate polished accomplishment summaries. Perfect for
            performance reviews, sprint reports, and project updates.
          </motion.p>

          <motion.div 
            className="mt-10 flex items-center justify-center gap-4"
            variants={staggerChildren}
          >
            <motion.div variants={hoverScale}>
              <Button size="lg" className="gap-2" asChild>
                <Link href="/docs">
                  Get Started
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={hoverScale}>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href="https://github.com/rollenasistores/devsum" target="_blank" rel="noopener noreferrer">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Github className="h-4 w-4" />
                  </motion.div>
                  View on GitHub
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground"
            variants={staggerChildren}
          >
            <motion.div 
              className="flex items-center gap-2"
              variants={fadeInUp}
            >
              <motion.div 
                className="h-2 w-2 rounded-full bg-accent"
                variants={pulse}
                animate="animate"
              />
              <span>Open Source</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              variants={fadeInUp}
            >
              <motion.div 
                className="h-2 w-2 rounded-full bg-accent"
                variants={pulse}
                animate="animate"
              />
              <span>TypeScript</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2"
              variants={fadeInUp}
            >
              <motion.div 
                className="h-2 w-2 rounded-full bg-accent"
                variants={pulse}
                animate="animate"
              />
              <span>AI-Powered</span>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 max-w-4xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.div
            className="relative"
            animate={{
              y: [0, -10, 0],
              rotateX: [0, 5, 0],
              rotateY: [0, 2, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -15,
              rotateX: 10,
              rotateY: 5,
              transition: { duration: 0.3 }
            }}
            style={{
              transformStyle: "preserve-3d",
              perspective: "1000px"
            }}
          >
            {/* 3D shadow effect */}
            <div 
              className="absolute inset-0 bg-primary/20 blur-xl scale-110 -z-10"
              style={{
                transform: "translateZ(-50px) rotateX(10deg)"
              }}
            />
            <TerminalWindow>
              <AnimatedTerminal />
            </TerminalWindow>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
