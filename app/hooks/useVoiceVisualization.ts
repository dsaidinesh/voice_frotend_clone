import { useState, useEffect, useRef } from 'react'

interface WindowWithWebkit extends Window {
  webkitAudioContext: typeof AudioContext;
}

export function useVoiceVisualization(isRecording: boolean) {
  const [levels, setLevels] = useState<number[]>(Array(20).fill(20))
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const prevLevelRef = useRef<number>(20)

  useEffect(() => {
    let audioContext: AudioContext | null = null

    const initializeAudio = async () => {
      try {
        if (isRecording) {
          audioContext = new (window.AudioContext || (window as WindowWithWebkit).webkitAudioContext)()
          const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          })
          mediaStreamRef.current = stream
          
          const source = audioContext.createMediaStreamSource(stream)
          const analyser = audioContext.createAnalyser()
          analyser.fftSize = 256 // Increased for better frequency resolution
          analyser.minDecibels = -90
          analyser.maxDecibels = -10
          analyser.smoothingTimeConstant = 0.85
          source.connect(analyser)
          analyserRef.current = analyser

          const updateLevels = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(dataArray)
            
            // Focus on vocal frequency range (roughly 85-255 Hz)
            const vocalRange = dataArray.slice(2, 6)
            const average = vocalRange.reduce((acc, val) => acc + val, 0) / vocalRange.length
            
            // Convert to percentage (0-100) with enhanced sensitivity
            let normalizedLevel = (average / 255) * 150 // Increased range for better visibility
            
            // Smooth transitions between levels
            normalizedLevel = prevLevelRef.current * 0.6 + normalizedLevel * 0.4
            prevLevelRef.current = normalizedLevel

            // Ensure minimum visibility and cap maximum
            normalizedLevel = Math.max(20, Math.min(100, normalizedLevel))

            // Create smooth wave effect
            setLevels(prev => {
              const newLevels = [...prev]
              newLevels.pop()
              newLevels.unshift(normalizedLevel)
              return newLevels
            })

            animationFrameRef.current = requestAnimationFrame(updateLevels)
          }

          updateLevels()
        } else {
          // Reset visualization when not recording
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop())
            mediaStreamRef.current = null
          }
          if (analyserRef.current) {
            analyserRef.current = null
          }
          if (audioContext) {
            audioContext.close()
          }
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
          setLevels(Array(20).fill(20))
          prevLevelRef.current = 20
        }
      } catch (error) {
        console.error('Error accessing microphone:', error)
      }
    }

    initializeAudio()

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [isRecording])

  return levels
}

