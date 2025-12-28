import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal } from "./Terminal"
import { LazyScreenshot } from "./LazyScreenshot"

interface HeroAnimationProps {
  screenshotUrl: string
}

type AnimationState = "typing" | "screenshot"

export function HeroAnimation({ screenshotUrl }: HeroAnimationProps) {
  const [state, setState] = useState<AnimationState>("typing")

  const handleTerminalComplete = () => {
    setState("screenshot")
  }


  // Effect to trigger screenshot exit
  // We can just rely on the onAnimationComplete of the screenshot exit if we structured it that way,
  // but a simple timeout in the effect when state changes to 'screenshot' is easier to manage alongside the enter animation.
  // Actually, I'll put the timeout in the onEnter or just use a useEffect.
  
  // Refined approach:
  // 1. Terminal types. onComplete -> set state 'screenshot'
  // 2. AnimatePresence switches to Screenshot.
  // 3. Screenshot stays for X seconds.
  // 4. Set state 'typing'.
  
  useEffect(() => {
    if (state === "screenshot") {
      const timer = setTimeout(() => setState("typing"), 4000)
      return () => clearTimeout(timer)
    }
  }, [state])

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[300px] md:h-[400px] flex items-start justify-center pt-8">
      <AnimatePresence mode="wait">
        {state === "typing" ? (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.5 } }}
            transition={{ duration: 0.5 }}
            className="w-full absolute"
          >
            <Terminal onComplete={handleTerminalComplete} />
          </motion.div>
        ) : (
          <motion.div
            key="screenshot"
            initial={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full absolute"
          >
            <LazyScreenshot 
              src={screenshotUrl} 
              alt="Shepai Dashboard Demo" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
