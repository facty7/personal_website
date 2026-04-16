import 'katex/dist/katex.min.css';
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './Providers'
import { Navbar } from '@/components/Navbar'
import { ToastContainer } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'AI Research Lab — SR3 & 3DGS',
  description: 'Personal AI research platform for image super-resolution and 3D Gaussian Splatting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 100%)',
          }}
        />
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
        <ToastContainer />
      </body>
    </html>
  )
}
