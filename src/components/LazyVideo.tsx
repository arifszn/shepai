import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause } from "lucide-react"

interface LazyVideoProps {
  src: string
  className?: string
}

export function LazyVideo({ src, className }: LazyVideoProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleCanPlay = () => setIsLoaded(true)
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

      video.addEventListener("canplay", handleCanPlay)
      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)

      // Check if it's already playing (autoplay success)
      if (!video.paused) {
        setIsPlaying(true)
      }

      return () => {
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
      }
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  return (
    <div 
      className={cn("relative rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-background group cursor-pointer", className)}
      onClick={togglePlay}
    >
      {/* Skeleton / Placeholder */}
      <div
        className={cn(
          "absolute inset-0 bg-muted/30 animate-pulse flex flex-col z-10",
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

      {/* Play/Pause Overlay */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center z-20 transition-all duration-300 bg-black/20",
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </div>
      </div>

      {/* Actual Video */}
      <video
        ref={videoRef}
        src={src}
        className={cn(
          "w-full h-auto duration-700 ease-in-out",
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        )}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  )
}
