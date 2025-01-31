"use client"

import { useEffect, useState } from "react"
import { Flex, Box, Text, Button, useToast, useColorMode, IconButton, Heading } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import SourcesPanel from "./components/SourcesPanel"
import VoiceAIPanel from "./components/VoiceAIPanel"
import ChatPanel from "./components/ChatPanel"
import { isAuthenticated, logout } from "../utils/api"
import { FiSun, FiMoon } from "react-icons/fi"

export default function Workspace() {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const router = useRouter()
  const toast = useToast()
  const { colorMode, toggleColorMode } = useColorMode()

  useEffect(() => {
    // Check authentication on component mount and when it changes
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/login")
      }
    }

    checkAuth()
    // Add event listener for storage changes (in case of logout in another tab)
    window.addEventListener('storage', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
    router.push("/login")
  }

  const handleDocumentSelect = (documentIds: string[]) => {
    setSelectedDocuments(documentIds)
  }

  return (
    <Box h="100vh" position="relative">
      {/* Header */}
      <Flex 
        bg="brand.500" 
        p={4} 
        justify="space-between" 
        align="center"
        h="16"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={10}
      >
        <Heading
          fontSize="2xl"
          fontWeight="bold"
          color="white"
          bgGradient="linear(to-r, white, blue.100)"
          bgClip="text"
          letterSpacing="wide"
          ml={2}
        >
          DocuVoice AI
        </Heading>
        <Flex gap={2}>
          <IconButton
            aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="whiteAlpha"
            _hover={{ bg: 'whiteAlpha.200' }}
          />
          <Button 
            _hover={{ bg: 'whiteAlpha.200', borderColor: 'white' }}
            _active={{ bg: 'whiteAlpha.300' }}
            fontWeight="normal"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Flex>
      </Flex>

      {/* Main Content */}
      <Flex 
        position="fixed" 
        top="64px" 
        left={0} 
        right={0} 
        bottom="48px"
        overflow="hidden"
      >
        {/* Sources Panel - Fixed width, scrollable content */}
        <Box 
          w="64" 
          minW="64" 
          position="fixed"
          left={0}
          top="64px"
          bottom="48px"
          borderRight="1px"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
        >
          <SourcesPanel onDocumentSelect={handleDocumentSelect} />
        </Box>

        {/* Voice Assistant Panel - Centered, fixed */}
        <Box 
          flex={1} 
          ml="64" 
          mr="96"
        >
          <VoiceAIPanel selectedDocuments={selectedDocuments} />
        </Box>

        {/* Chat Panel - Fixed width, scrollable content */}
        <Box 
          w="96" 
          minW="96" 
          position="fixed"
          right={0}
          top="64px"
          bottom="48px"
          borderLeft="1px"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
        >
          <ChatPanel selectedDocuments={selectedDocuments} />
        </Box>
      </Flex>
    </Box>
  )
}

