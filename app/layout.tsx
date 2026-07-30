import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Poppins, Changa } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/language-context'

const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })
const changa = Changa({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: '20% - Portail des Masters Algériens',
  description: 'Explorez les masters disponibles dans les universités algériennes - استكشف الماجستيرات المتاحة في الجامعات الجزائرية',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
