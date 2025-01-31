"use client"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  useColorModeValue,
  Flex,
  IconButton,
  useToast,
  Icon,
} from "@chakra-ui/react"
import { FiSend, FiFileText, FiList, FiBookOpen, FiCheckCircle, FiSearch } from "react-icons/fi"
import { askQuestion } from "@/app/utils/api"

interface Message {
  type: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  selectedDocuments: string[]
}

export default function ChatPanel({ selectedDocuments }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const userMessageBg = useColorModeValue("blue.50", "blue.900")
  const assistantMessageBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    const question = inputValue.trim()
    if (!question) return

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

    setMessages(prev => [...prev, { type: 'user', content: question }])
    setInputValue("")
    setIsProcessing(true)

    try {
      const response = await askQuestion(question, selectedDocuments)
      setMessages(prev => [...prev, { type: 'assistant', content: response.answer }])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get an answer. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Flex 
      direction="column" 
      h="full"
      maxH="full"
      overflow="hidden"
      bg={bgColor}
      borderLeft="1px"
      borderColor={borderColor}
    >
      {/* Messages Container */}
      <Box 
        flex="1"
        overflowY="auto"
        minH="0"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.300',
            borderRadius: '24px',
          },
        }}
      >
        <VStack spacing={4} align="stretch" p={4}>
          {messages.map((message, index) => (
            <Box
              key={index}
              bg={message.type === 'user' ? userMessageBg : assistantMessageBg}
              p={3}
              rounded="md"
              alignSelf={message.type === 'user' ? "flex-end" : "flex-start"}
              maxW="80%"
              shadow="sm"
            >
              <Text>{message.content}</Text>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Input Container */}
      <Box 
        p={4} 
        borderTop="1px" 
        borderColor={borderColor}
        bg={bgColor}
      >
        {/* Quick Action Buttons */}
        <Flex mb={4} gap={2} flexWrap="wrap">
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={() => setInputValue("Can you summarize this document?")}
            leftIcon={<Icon as={FiFileText} />}
          >
            Summarize
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="purple"
            onClick={() => setInputValue("What are the key points in this document?")}
            leftIcon={<Icon as={FiList} />}
          >
            Key Points
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="green"
            onClick={() => setInputValue("Can you explain this in simpler terms?")}
            leftIcon={<Icon as={FiBookOpen} />}
          >
            Simplify
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="orange"
            onClick={() => setInputValue("What are the main conclusions?")}
            leftIcon={<Icon as={FiCheckCircle} />}
          >
            Conclusions
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="pink"
            onClick={() => setInputValue("Can you find examples in this document?")}
            leftIcon={<Icon as={FiSearch} />}
          >
            Find Examples
          </Button>
        </Flex>

        <Flex>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question..."
            mr={2}
            disabled={isProcessing}
            bg={useColorModeValue("white", "gray.700")}
          />
          <IconButton
            aria-label="Send message"
            icon={<FiSend />}
            onClick={handleSendMessage}
            isLoading={isProcessing}
            disabled={!inputValue.trim() || selectedDocuments.length === 0}
            colorScheme="brand"
          />
        </Flex>
        {selectedDocuments.length === 0 && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            Select documents from the sidebar to start chatting
          </Text>
        )}
      </Box>
    </Flex>
  )
}

