import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SkillGraph AI — Zero-Trust Developer Portfolio Auditor',
  description:
    'Audit GitHub portfolios with AST lineage, commit cadence modelling and AI claim reconciliation. Authenticity scores, anomaly detection and generated screening questions.',
  generator: 'v0.app',
  openGraph: {
    title: 'SkillGraph AI — Zero-Trust Developer Verification',
    description: 'Audit GitHub portfolios with AST and AI.',
    type: 'website',
    url: 'https://skillgraph-ai.vercel.app',
    siteName: 'SkillGraph AI',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#020617',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
