"use client"

import { useState } from "react"
import { ChevronRight, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function StudioPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [notes, setNotes] = useState("")

  if (isCollapsed) {
    return (
      <div className="w-12 bg-surface p-2 flex flex-col items-center">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[320px] bg-surface p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Studio</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Audio Controls</h3>
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="icon">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold mb-2">Notes</h3>
        <Textarea
          placeholder="Type your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-full"
        />
      </div>
    </div>
  )
}

