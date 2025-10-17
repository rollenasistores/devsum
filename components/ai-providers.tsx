"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { scrollReveal, staggerCards, staggerCard, hoverLift, breathe, staggerChildren } from "@/lib/animations"

const providers = [
  {
    name: "Claude",
    model: "claude-3-5-sonnet",
    description:
      "Anthropic's most capable model. Excellent at understanding context and generating professional narratives.",
    features: ["Best quality", "Context-aware", "Professional tone"],
    recommended: true,
  },
  {
    name: "GPT-4",
    model: "gpt-4-turbo",
    description: "OpenAI's flagship model. Great balance of speed and quality with strong technical understanding.",
    features: ["Fast", "Reliable", "Technical depth"],
    recommended: false,
  },
  {
    name: "Gemini",
    model: "gemini-pro",
    description: "Google's advanced AI model. Cost-effective option with good performance for most use cases.",
    features: ["Cost-effective", "Fast", "Good quality"],
    recommended: false,
  },
]

export function AIProviders() {
  return (
    <section className="border-b border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose your AI provider</h2>
          <p className="mt-4 text-lg text-muted-foreground">DevSum works with the leading AI models</p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3"
          variants={staggerCards}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {providers.map((provider, index) => (
            <motion.div
              key={provider.name}
              variants={staggerCard}
              whileHover="hover"
              className="group"
            >
              <motion.div
                variants={hoverLift}
                className="h-full"
              >
                <Card className="relative border-border bg-card p-6 h-full">
                  {provider.recommended && (
                    <motion.div
                      initial={{ scale: 0, rotate: -10 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    >
                      <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">Recommended</Badge>
                    </motion.div>
                  )}
                  <motion.div 
                    className="mb-4"
                    variants={breathe}
                    animate="animate"
                  >
                    <h3 className="text-xl font-bold text-card-foreground">{provider.name}</h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{provider.model}</p>
                  </motion.div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{provider.description}</p>
                  <motion.div 
                    className="mt-6 space-y-2"
                    variants={staggerChildren}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {provider.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={feature} 
                        className="flex items-center gap-2 text-sm text-card-foreground"
                        variants={staggerChildren}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + featureIndex * 0.1 }}
                      >
                        <motion.div 
                          className="h-1.5 w-1.5 rounded-full bg-accent"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.4 + featureIndex * 0.1 }}
                        />
                        {feature}
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
