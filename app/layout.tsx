import type { Metadata } from 'next'
import { Providers } from './providers'
import { ColorModeToggle } from './components/ColorModeToggle'
import { Footer } from './components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'DocuVoice AI',
  description: 'Voice-enabled document assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{ 
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: '60px'
          }}>
            <ColorModeToggle />
            <div style={{ flex: 1 }}>
              {children}
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}

