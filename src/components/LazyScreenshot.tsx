import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LazyScreenshotProps {
  src: string
  alt: string
  className?: string
}

export function LazyScreenshot({ src, alt, className }: LazyScreenshotProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setIsLoaded(true)
  }, [src])

  return (
    <div className={cn("relative rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-background", className)}>
      {/* Skeleton / Placeholder */}
      <div 
        className={cn(
          "absolute inset-0 bg-muted/30 animate-pulse flex flex-col",
          isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        )} 
      >
        {/* Generic Skeleton Header */}
        <div className="h-12 border-b border-border/10 flex items-center px-4 gap-4">
          <div className="w-full h-full flex items-center gap-2">
             <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
             <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
             <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          </div>
        </div>
        
        {/* Empty Content Body */}
        <div className="flex-1 bg-muted/10" />
      </div>
      
      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-auto duration-700 ease-in-out",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        )}
      />
    </div>
  )
}
