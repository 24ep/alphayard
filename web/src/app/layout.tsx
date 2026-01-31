import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Bondarys - Circle Management Platform',
  description: 'Ultra-clean and premium Circle management platform with deep planning and socializing capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ServiceWorkerRegistration />
          {children}
        </Providers>
      </body>
    </html>
  )
}


