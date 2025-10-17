"use client"

import { CodeBlock } from "@/components/ui/code-block"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { scrollReveal, staggerChildren, tabContent, typewriter } from "@/lib/animations"

export function InstallationSection() {
  return (
    <section id="installation" className="border-b border-border bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get started in seconds</h2>
          <p className="mt-4 text-lg text-muted-foreground">Install DevSum CLI with your favorite package manager</p>
        </motion.div>

        <motion.div 
          className="mx-auto mt-16 max-w-3xl"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Tabs defaultValue="npm" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="npm">npm</TabsTrigger>
                <TabsTrigger value="yarn">yarn</TabsTrigger>
                <TabsTrigger value="pnpm">pnpm</TabsTrigger>
              </TabsList>
            </motion.div>
            
            <TabsContent value="npm" className="mt-6">
              <motion.div
                variants={tabContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <CodeBlock code="npm install -g @rollenasistores/devsum" language="bash" />
              </motion.div>
            </TabsContent>
            <TabsContent value="yarn" className="mt-6">
              <motion.div
                variants={tabContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <CodeBlock code="yarn global add @rollenasistores/devsum" language="bash" />
              </motion.div>
            </TabsContent>
            <TabsContent value="pnpm" className="mt-6">
              <motion.div
                variants={tabContent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <CodeBlock code="pnpm add -g @rollenasistores/devsum" language="bash" />
              </motion.div>
            </TabsContent>
          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="mt-8 border-border bg-card p-6">
              <h3 className="font-semibold text-card-foreground">Requirements</h3>
              <motion.ul 
                className="mt-4 space-y-2 text-sm text-muted-foreground"
                variants={staggerChildren}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.li 
                  className="flex items-center gap-2"
                  variants={staggerChildren}
                >
                  <motion.div 
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  />
                  Node.js 18.0 or higher
                </motion.li>
                <motion.li 
                  className="flex items-center gap-2"
                  variants={staggerChildren}
                >
                  <motion.div 
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  />
                  Git 2.0 or higher
                </motion.li>
                <motion.li 
                  className="flex items-center gap-2"
                  variants={staggerChildren}
                >
                  <motion.div 
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  />
                  API key for your preferred AI provider (Claude, OpenAI, or Gemini)
                </motion.li>
              </motion.ul>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
