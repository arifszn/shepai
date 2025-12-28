import { useEffect, useRef } from "react"
import Typed from "typed.js"
import { cn } from "@/lib/utils"

interface TerminalProps {
  className?: string
}

export function Terminal({ className }: TerminalProps) {
  const typedRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!typedRef.current) return

    const typed = new Typed(typedRef.current, {
      strings: ["shepai file sample.log"],
      typeSpeed: 50,
      backSpeed: 30,
      smartBackspace: true,
      loop: true,
      fadeOut: true,
      fadeOutDelay: 500,
      showCursor: true,
      cursorChar: "|",
    })

    return () => {
      typed.destroy()
    }
  }, [])

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-2xl",
        className
      )}
    >
      {/* macOS Window Controls */}
      <div className="bg-[#1e1e1e] px-4 py-3 flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
      </div>

      {/* Terminal Content */}
      <div className="bg-[#1e1e1e] px-4 py-6 min-h-[160px] font-mono text-sm text-left">
        <div className="text-gray-300 text-left">
          <span className="text-white">$ </span>
          <span ref={typedRef} className="text-white" />
        </div>
      </div>
    </div>
  )
}
