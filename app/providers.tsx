'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    IconButton: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
})

// Color mode script component
function ColorModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            var colorMode = localStorage.getItem('chakra-ui-color-mode');
            if (!colorMode) {
              localStorage.setItem('chakra-ui-color-mode', 'dark');
              document.documentElement.style.setProperty('color-scheme', 'dark');
            } else {
              document.documentElement.style.setProperty('color-scheme', colorMode);
            }
          } catch (e) {}
        `,
      }}
    />
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ColorModeScript />
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </CacheProvider>
  )
} 