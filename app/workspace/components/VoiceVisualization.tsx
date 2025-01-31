"use client"

import { Box, Flex } from "@chakra-ui/react"
import { useVoiceVisualization } from "@/app/hooks/useVoiceVisualization"
import { keyframes } from "@emotion/react"

const pulseKeyframes = keyframes`
  0% { transform: scaleY(1); }
  50% { transform: scaleY(1.1); }
  100% { transform: scaleY(1); }
`

export default function VoiceVisualization({ isRecording }: { isRecording: boolean }) {
  const levels = useVoiceVisualization(isRecording)

  return (
    <Flex 
      align="flex-end" 
      justify="center" 
      h="16" 
      w="48" 
      gap="1"
      bg="blackAlpha.50"
      p={2}
      rounded="xl"
    >
      {levels.map((height, index) => (
        <Box
          key={index}
          w="1.5"
          bg="brand.500"
          h={`${height}%`}
          transition="height 0.1s ease-in-out"
          animation={isRecording ? `${pulseKeyframes} 0.5s infinite` : undefined}
          rounded="full"
          opacity={isRecording ? 1 : 0.5}
          sx={{
            animationDelay: `${index * 0.05}s`,
            background: isRecording 
              ? "linear-gradient(to top, #3182CE, #63B3ED)" 
              : "gray.300",
          }}
        />
      ))}
    </Flex>
  )
}

