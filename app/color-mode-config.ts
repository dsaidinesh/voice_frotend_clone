// This is needed to prevent hydration mismatch
if (typeof window !== 'undefined') {
  // Get the initial color mode from localStorage or default to 'dark'
  const initialColorMode = localStorage.getItem('chakra-ui-color-mode') || 'dark'
  
  // Set the color-scheme CSS property
  document.documentElement.style.setProperty('color-scheme', initialColorMode)
}

export const colorModeConfig = {
  initialColorMode: 'dark' as const,
  useSystemColorMode: false,
} 