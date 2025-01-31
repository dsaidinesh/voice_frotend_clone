'use client'

import { IconButton, useColorMode } from '@chakra-ui/react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { usePathname } from 'next/navigation'

export function ColorModeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()
  const pathname = usePathname()
  
  // Check if we're in the workspace
  const isWorkspace = pathname?.startsWith('/workspace')

  return (
    <IconButton
      aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
      onClick={toggleColorMode}
      variant="ghost"
      size="lg"
      fontSize="24px"
      colorScheme={isWorkspace ? "whiteAlpha" : "brand"}
      color={isWorkspace ? "white" : undefined}
      _hover={{ bg: isWorkspace ? 'whiteAlpha.300' : 'brand.100' }}
      position="fixed"
      top="12px"
      right="120px"
      zIndex={1400}
      boxSize="40px"
      borderRadius="10px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    />
  )
} 