"use client"

import { useState } from "react"
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Text, useToast } from "@chakra-ui/react"
import { login } from "../utils/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      router.push("/workspace")
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box width="full" maxW="md" p={8} borderWidth={1} borderRadius={8} boxShadow="lg">
        <VStack spacing={4} align="flex-start" w="full">
          <Heading>Login</Heading>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack spacing={4} align="flex-start" w="full">
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </FormControl>
              <Button type="submit" colorScheme="brand" width="full" isLoading={isLoading}>
                Login
              </Button>
            </VStack>
          </form>
          <Text>
            Don&apos;t have an account? <Link href="/register">Register here</Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}

