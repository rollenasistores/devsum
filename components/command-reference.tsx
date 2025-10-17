"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/ui/code-block"
import { motion } from "framer-motion"
import { scrollReveal, tabContent, hoverLift } from "@/lib/animations"

export function CommandReference() {
  return (
    <section id="commands" className="border-b border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Command reference</h2>
          <p className="mt-4 text-lg text-muted-foreground">Complete guide to all available commands and options</p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 max-w-4xl"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Tabs defaultValue="analyze" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analyze">analyze</TabsTrigger>
                <TabsTrigger value="config">config</TabsTrigger>
                <TabsTrigger value="export">export</TabsTrigger>
                <TabsTrigger value="help">help</TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="analyze" className="mt-6 space-y-4">
              <motion.div
                variants={tabContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                <motion.div 
                  className="rounded-lg border border-border bg-card p-6"
                  variants={hoverLift}
                  whileHover="hover"
                >
                  <h3 className="font-semibold text-card-foreground">devsum analyze</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Analyze git commits and generate a summary report</p>
                </motion.div>
                <CodeBlock
                  code={`# Basic usage
devsum analyze

# Custom date range
devsum analyze --since="2024-01-01" --until="2024-12-31"

# Filter by author
devsum analyze --author="john@example.com"

# Specify output format
devsum analyze --format=pdf --output=report.pdf`}
                  language="bash"
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="config" className="mt-6 space-y-4">
              <motion.div
                variants={tabContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                <motion.div 
                  className="rounded-lg border border-border bg-card p-6"
                  variants={hoverLift}
                  whileHover="hover"
                >
                  <h3 className="font-semibold text-card-foreground">devsum config</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Configure AI provider and default settings</p>
                </motion.div>
                <CodeBlock
                  code={`# Set AI provider
devsum config set provider claude

# Set API key
devsum config set apiKey sk-...

# View current config
devsum config list`}
                  language="bash"
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="export" className="mt-6 space-y-4">
              <motion.div
                variants={tabContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                <motion.div 
                  className="rounded-lg border border-border bg-card p-6"
                  variants={hoverLift}
                  whileHover="hover"
                >
                  <h3 className="font-semibold text-card-foreground">devsum export</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Export existing analysis to different formats</p>
                </motion.div>
                <CodeBlock
                  code={`# Export to PDF
devsum export --format=pdf --input=report.json

# Export to HTML
devsum export --format=html --input=report.json`}
                  language="bash"
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="help" className="mt-6 space-y-4">
              <motion.div
                variants={tabContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                <motion.div 
                  className="rounded-lg border border-border bg-card p-6"
                  variants={hoverLift}
                  whileHover="hover"
                >
                  <h3 className="font-semibold text-card-foreground">devsum help</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Display help information for any command</p>
                </motion.div>
                <CodeBlock
                  code={`# General help
devsum help

# Command-specific help
devsum help analyze`}
                  language="bash"
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}
