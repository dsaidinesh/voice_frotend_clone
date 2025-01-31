"use client"

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react"
import { ArrowForwardIcon } from "@chakra-ui/icons"
import { FiFileText, FiMic, FiCpu } from "react-icons/fi"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "./utils/api"
import { IconType } from "react-icons"

interface FeatureCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export default function Home() {
  const router = useRouter()
  const bgGradient = useColorModeValue("linear(to-b, gray.50, white)", "linear(to-b, gray.900, gray.800)")

  const handleGetStarted = () => {
    if (typeof window !== 'undefined') {
      if (isAuthenticated()) {
        router.push("/workspace")
      } else {
        router.push("/login")
      }
    }
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="container.xl" pt={20}>
        <VStack spacing={8} textAlign="center" mb={16}>
          <Heading as="h1" size="3xl" bgGradient="linear(to-r, brand.400, brand.600)" bgClip="text">
            DocuVoice AI
          </Heading>
          <Text fontSize="xl" maxW="2xl">
            Experience the future of document analysis with our advanced AI-powered voice assistant.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mb={16}>
          <FeatureCard
            icon={FiFileText}
            title="Smart Document Analysis"
            description="Instantly analyze and extract key information from your documents using cutting-edge AI technology."
          />
          <FeatureCard
            icon={FiMic}
            title="Voice-Powered Interaction"
            description="Interact with your documents naturally using voice commands for a hands-free experience."
          />
          <FeatureCard
            icon={FiCpu}
            title="AI-Driven Insights"
            description="Gain valuable insights and summaries from your documents with our advanced AI algorithms."
          />
        </SimpleGrid>

        <Flex justify="center">
          <Button
            size="lg"
            rightIcon={<ArrowForwardIcon />}
            colorScheme="brand"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </Flex>
      </Container>
    </Box>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <VStack
      align="start"
      p={6}
      bg={useColorModeValue("white", "gray.700")}
      rounded="lg"
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: "lg", transform: "translateY(-5px)" }}
    >
      <Icon as={icon} boxSize={10} color="brand.500" mb={4} />
      <Heading as="h3" size="md" mb={2}>
        {title}
      </Heading>
      <Text color={useColorModeValue("gray.600", "gray.400")}>{description}</Text>
    </VStack>
  )
}

