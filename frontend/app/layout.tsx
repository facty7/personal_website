import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './Providers'
import { ToastContainer } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

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
    <html lang="zh">
      <body className={`${inter.className} ${jetbrainsMono.variable}`}>
        <Providers>
          <header className="sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-zinc-100">SR3 & 3DGS</h1>
                <p className="text-xs text-zinc-500">Processing Platform</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 1.743-.27.501 0 1.006.068 1.471.2 1.453-.287 2.897-.723 3.982-2.187 0 0 .828-.212 1.576.774 0 0 .414 1.201.34 2.082.98-.292 2.003-.447 2.998-.447 1 0 1.968.151 2.895.447.442-.73.34-1.83.34-1.83s.556-1.01 2.008-.774c.926.974 1.356 2.187 1.356 2.187.69.395 1.082 1.09 1.082 2.182 0 3.85-2.34 4.69-4.566 4.938.358.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-zinc-800 mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-zinc-600 text-sm">
              <p>Backend on Hugging Face Spaces • Frontend on Vercel</p>
            </div>
          </footer>
        </Providers>
        <ToastContainer />
      </body>
    </html>
  )
}
