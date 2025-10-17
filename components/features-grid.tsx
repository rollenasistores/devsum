"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, Zap, FileText, Filter, Workflow, Palette } from "lucide-react"
import { motion } from "framer-motion"
import { scrollReveal, staggerCards, staggerCard, hoverLift, hoverGlow, breathe } from "@/lib/animations"

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Analysis",
    description: "Leverage Claude, GPT-4, or Gemini to transform raw commits into professional narratives.",
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Export to Markdown, JSON, HTML, or PDF. Perfect for any workflow or documentation system.",
  },
  {
    icon: Filter,
    title: "Flexible Filtering",
    description: "Filter by date range, author, branch, or file patterns. Get exactly the commits you need.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with caching and parallel processing. Analyze thousands of commits in seconds.",
  },
  {
    icon: Workflow,
    title: "Automated Workflows",
    description: "Integrate with CI/CD pipelines. Generate reports automatically on schedule or trigger.",
  },
  {
    icon: Palette,
    title: "Beautiful Terminal UI",
    description: "Enjoy a polished CLI experience with progress indicators, colors, and interactive prompts.",
  },
]

export function FeaturesGrid() {
  return (
    <section className="border-b border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to summarize your work
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed for developers who value their time
          </p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerCards}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={staggerCard}
              whileHover="hover"
              className="group"
            >
              <motion.div
                variants={hoverLift}
                className="h-full"
              >
                <Card
                  className="group relative overflow-hidden border-border bg-card p-6 transition-colors hover:border-primary/50 h-full"
                >
                  <motion.div 
                    className="flex items-start gap-4"
                    variants={breathe}
                    animate="animate"
                  >
                    <motion.div 
                      className="rounded-lg bg-primary/10 p-2 text-primary"
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: [0, -5, 5, -5, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      <feature.icon className="h-5 w-5" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                  
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    variants={hoverGlow}
                  />
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
