import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SR3 & 3DGS Processing Platform',
  description: 'Frontend for SR3 super-resolution and 3DGS 3D reconstruction',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">SR3 & 3DGS Processing Platform</h1>
            <p className="text-gray-300">Vercel Frontend + Hugging Face Spaces Backend</p>
          </div>
        </header>
        <main className="container mx-auto p-4">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center text-gray-400">
            <p>Backend deployed on Hugging Face Spaces • Frontend deployed on Vercel</p>
          </div>
        </footer>
      </body>
    </html>
  )
}