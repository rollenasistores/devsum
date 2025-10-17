import { Variants } from "framer-motion"

// Basic animation variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

// Stagger container variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const staggerChildren: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const staggerCards: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

export const staggerCard: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Hover animations
export const hoverScale: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const hoverLift: Variants = {
  rest: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: { 
    y: -8,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

export const hoverGlow: Variants = {
  rest: { 
    boxShadow: "0 0 0 rgba(59, 130, 246, 0)",
    borderColor: "rgba(0,0,0,0.1)"
  },
  hover: { 
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    transition: { duration: 0.3 }
  }
}

// Continuous animations
export const float: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const breathe: Variants = {
  animate: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const pulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export const rotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Scroll reveal variants
export const scrollReveal: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const scrollRevealLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export const scrollRevealRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Tab content animations
export const tabContent: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

// Counter animation
export const counterAnimation = {
  from: 0,
  to: (value: number) => value,
  duration: 2,
  ease: "easeOut"
}

// Typewriter effect
export const typewriter = {
  hidden: { width: 0 },
  visible: {
    width: "100%",
    transition: {
      duration: 2,
      ease: "easeInOut"
    }
  }
}

// Parallax variants
export const parallaxUp: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: -100, 
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" }
  }
}

export const parallaxDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 100, 
    opacity: 1,
    transition: { duration: 1, ease: "easeOut" }
  }
}
