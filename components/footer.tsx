"use client"

import { Github, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { scrollReveal, staggerChildren, hoverScale } from "@/lib/animations"

export function Footer() {
  return (
    <footer className="bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 gap-8 lg:grid-cols-4"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div className="lg:col-span-2" variants={scrollReveal}>
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="rounded bg-primary p-1.5"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="h-5 w-5 font-mono text-xs font-bold text-primary-foreground flex items-center justify-center">
                  DS
                </div>
              </motion.div>
              <span className="text-lg font-bold text-foreground">DevSum CLI</span>
            </motion.div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Transform your git commits into professional accomplishment reports with AI. Open source and built for
              developers.
            </p>
            <motion.div 
              className="mt-6 flex items-center gap-4"
              variants={staggerChildren}
            >
              <motion.div variants={hoverScale}>
                <Button size="icon" variant="ghost">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Github className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div variants={hoverScale}>
                <Button size="icon" variant="ghost">
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <Twitter className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
              <motion.div variants={hoverScale}>
                <Button size="icon" variant="ghost">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mail className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div variants={scrollReveal}>
            <h3 className="font-semibold text-foreground">Product</h3>
            <motion.ul 
              className="mt-4 space-y-2 text-sm text-muted-foreground"
              variants={staggerChildren}
            >
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Features
                </motion.a>
              </motion.li>
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#installation" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Installation
                </motion.a>
              </motion.li>
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#commands" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Documentation
                </motion.a>
              </motion.li>
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Changelog
                </motion.a>
              </motion.li>
            </motion.ul>
          </motion.div>

          <motion.div variants={scrollReveal}>
            <h3 className="font-semibold text-foreground">Resources</h3>
            <motion.ul 
              className="mt-4 space-y-2 text-sm text-muted-foreground"
              variants={staggerChildren}
            >
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  GitHub
                </motion.a>
              </motion.li>
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Examples
                </motion.a>
              </motion.li>
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Community
                </motion.a>
              </motion.li>
              <motion.li variants={staggerChildren}>
                <motion.a 
                  href="#" 
                  className="hover:text-foreground transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Support
                </motion.a>
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground"
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <p>© 2025 DevSum CLI. Released under the MIT License.</p>
        </motion.div>
      </div>
    </footer>
  )
}
