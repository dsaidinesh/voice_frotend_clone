"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Box, VStack, Heading, Text, Button, Icon, useToast, IconButton, Flex } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import { FiMic, FiStopCircle, FiVolume2, FiVolumeX } from "react-icons/fi"
import VoiceVisualization from "./VoiceVisualization"
import { askQuestion, textToSpeech } from "@/app/utils/api"

const pulseKeyframes = keyframes`
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(237, 100, 100, 0.7); }
  50% { transform: scale(1.05); opacity: 0.8; box-shadow: 0 0 0 25px rgba(237, 100, 100, 0); }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(237, 100, 100, 0); }
`

const glowKeyframes = keyframes`
  0% { box-shadow: 0 0 10px #4299E1, 0 0 20px #4299E1, 0 0 30px #4299E1; }
  50% { box-shadow: 0 0 20px #4299E1, 0 0 40px #4299E1, 0 0 60px #4299E1; }
  100% { box-shadow: 0 0 10px #4299E1, 0 0 20px #4299E1, 0 0 30px #4299E1; }
`

const floatKeyframes = keyframes`
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-15px) scale(1.05); }
  100% { transform: translateY(0px) scale(1); }
`

const rotateKeyframes = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-5deg) scale(1.1); }
  75% { transform: rotate(5deg) scale(1.1); }
  100% { transform: rotate(0deg) scale(1); }
`

interface VoiceAIPanelProps {
  selectedDocuments: string[];
}

// Add proper type declarations at the top
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function VoiceAIPanel({ selectedDocuments }: VoiceAIPanelProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [status, setStatus] = useState("🎤 Tap and hold microphone to speak")
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const hasResultRef = useRef(false)
  const speechResultRef = useRef("")
  const isHoldingRef = useRef(false)
  const toast = useToast()

  const processQuestion = async (text: string) => {
    setIsProcessing(true)
    setStatus('⚡ Processing your question...')

    try {
      const response = await askQuestion(text, selectedDocuments)
      setIsSpeaking(true)
      setStatus('🔊 AI is speaking...')
      await playAudio(response.answer)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to process your question. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setStatus('🎤 Tap and hold microphone to speak')
    } finally {
      setIsProcessing(false)
    }
  }

  const startListening = useCallback(async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to ask questions about.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    hasResultRef.current = false
    speechResultRef.current = ""
    isHoldingRef.current = true

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = true

    recognition.onresult = async (event: any) => {
      const userText = event.results[event.results.length - 1][0].transcript
      hasResultRef.current = true
      speechResultRef.current = userText
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      hasResultRef.current = false
      speechResultRef.current = ""
      if (event.error === 'not-allowed') {
        setStatus('🚫 Microphone access denied')
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice features.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      } else {
        setStatus('❌ Error: ' + event.error)
      }
      setIsListening(false)
      isHoldingRef.current = false
    }

    recognition.onend = () => {
      // If still holding the button, restart recognition
      if (isHoldingRef.current && !isProcessing) {
        try {
          recognition.start()
        } catch (error) {
          console.error('Failed to restart recognition:', error)
        }
      } else {
        if (!hasResultRef.current && !isProcessing) {
          setStatus('🎤 Tap and hold microphone to speak')
        }
        setIsListening(false)
      }
    }

    try {
      await recognition.start()
      recognitionRef.current = recognition
      setIsListening(true)
      setStatus('🎙️ Listening... Release to send')
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast({
        title: "Error",
        description: "Failed to start recording. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setStatus('🎤 Tap and hold microphone to speak')
      isHoldingRef.current = false
    }
  }, [selectedDocuments, isProcessing])

  const stopListening = useCallback(() => {
    isHoldingRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
      
      // Process the speech result after stopping recognition
      if (hasResultRef.current && speechResultRef.current) {
        processQuestion(speechResultRef.current)
      }
    }
  }, [])

  const handleMouseDown = useCallback(() => {
    if (!isProcessing && !isSpeaking) {
      startListening()
    }
  }, [isProcessing, isSpeaking, startListening])

  const handleMouseUp = useCallback(() => {
    if (isListening) {
      stopListening()
    }
  }, [isListening, stopListening])

  const handleTouchStart = useCallback(() => {
    if (!isProcessing && !isSpeaking) {
      startListening()
    }
  }, [isProcessing, isSpeaking, startListening])

  const handleTouchEnd = useCallback(() => {
    if (isListening) {
      stopListening()
    }
  }, [isListening, stopListening])

  const interruptAI = useCallback(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop()
      audioSourceRef.current = null
    }
    setIsSpeaking(false)
    setStatus('🎤 Tap and hold microphone to speak')
  }, [])

  const playAudio = async (text: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }

      if (audioSourceRef.current) {
        audioSourceRef.current.stop()
        audioSourceRef.current = null
      }

      setIsSpeaking(true)
      setStatus('🔊 AI is speaking...')
      
      const audioData = await textToSpeech(text)
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData)
      
      const source = audioContextRef.current.createBufferSource()
      audioSourceRef.current = source
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      
      source.onended = () => {
        audioSourceRef.current = null
        setIsSpeaking(false)
        setStatus('🎤 Tap and hold microphone to speak')
      }
      
      source.start(0)
    } catch (error) {
      console.error('Text-to-speech error:', error)
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setIsSpeaking(false)
      setStatus('🎤 Tap and hold microphone to speak')
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (audioSourceRef.current) {
        audioSourceRef.current.stop()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <Box flex={1} p={8} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      {/* Header */}
      <Box 
        w="full" 
        h="16" 
        bg="blue.500" 
        position="fixed" 
        top={0} 
        left={0} 
        right={0}
        zIndex={20}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={4}
      >
        <Box w="64" /> {/* Spacer to center the title */}
        <Heading size="lg" color="white">DocuVoice AI</Heading>
        <Box w="64" display="flex" justifyContent="flex-end">
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: 'blue.600' }}
            onClick={() => window.location.href = '/'}
          >
            Logout
          </Button>
        </Box>
      </Box>
      <VStack spacing={8} w="full" maxW="7xl">
        <Heading size="lg" mb={4}>Voice Assistant</Heading>
        <VStack flex="1" spacing={4} align="center" justify="center">
          <Button
            w="48"
            h="48"
            rounded="full"
            bg={isListening ? "red.500" : isProcessing ? "yellow.500" : isSpeaking ? "green.500" : "white"}
            color={isListening || isProcessing || isSpeaking ? "white" : "blue.500"}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            _hover={{
              transform: "scale(1.1)",
              bg: isListening ? "red.600" : isProcessing ? "yellow.600" : isSpeaking ? "green.600" : "gray.100"
            }}
            animation={
              isListening 
                ? `${pulseKeyframes} 1.5s infinite` 
                : isProcessing
                ? `${rotateKeyframes} 1s infinite`
                : isSpeaking 
                ? `${glowKeyframes} 2s infinite, ${floatKeyframes} 3s infinite` 
                : undefined
            }
            position="relative"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            boxShadow="lg"
            _before={{
              content: '""',
              position: "absolute",
              top: "-3px",
              right: "-3px",
              bottom: "-3px",
              left: "-3px",
              borderRadius: "full",
              background: isListening 
                ? "linear-gradient(45deg, #FF0080, #FF4D4D)"
                : isProcessing
                ? "linear-gradient(45deg, #FFD700, #FFA500)"
                : isSpeaking 
                ? "linear-gradient(45deg, #00FF80, #4DFF4D)"
                : "linear-gradient(45deg, #0080FF, #4D4DFF)",
              opacity: 0.3,
              filter: "blur(8px)",
              transition: "all 0.3s"
            }}
            cursor={isProcessing || isSpeaking ? "not-allowed" : "pointer"}
          >
            <Icon 
              as={isListening ? FiMic : isProcessing ? FiStopCircle : isSpeaking ? FiVolume2 : FiMic} 
              boxSize={24}
              transition="all 0.3s"
              transform={isListening ? "scale(0.9)" : "scale(1)"}
            />
          </Button>

          <VoiceVisualization isRecording={isListening} />

          <Button
            colorScheme="orange"
            onClick={interruptAI}
            isDisabled={!isSpeaking}
            leftIcon={<Icon as={FiStopCircle} />}
            size="lg"
          >
            Interrupt AI
          </Button>

          <Text 
            fontSize="lg" 
            fontWeight="medium" 
            color={
              isListening 
                ? "red.500" 
                : isProcessing 
                ? "yellow.500" 
                : isSpeaking 
                ? "green.500" 
                : "gray.600"
            }
          >
            {selectedDocuments.length === 0 
              ? "📄 Select documents to start" 
              : status}
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
}