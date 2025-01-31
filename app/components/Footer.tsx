'use client'

import { Flex, Text, Link, useColorMode } from '@chakra-ui/react'
import { FiLinkedin } from 'react-icons/fi'

export function Footer() {
  const { colorMode } = useColorMode()
  
  return (
    <Flex
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      p={3}
      justify="center"
      align="center"
      borderTop="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(23, 25, 35, 0.9)'}
      backdropFilter="blur(8px)"
      zIndex={1000}
    >
      <Text fontSize="sm">
        Created by Sai Dinesh • 
        <Link 
          href="https://www.linkedin.com/in/saidineshd/" 
          target="_blank" 
          rel="noopener noreferrer"
          ml={2}
          color="brand.500"
          display="inline-flex"
          alignItems="center"
          _hover={{ color: 'brand.600', textDecoration: 'none' }}
        >
          <FiLinkedin style={{ marginRight: '4px' }} /> Connect on LinkedIn
        </Link>
      </Text>
    </Flex>
  )
} 