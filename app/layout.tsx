import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TinyLandlord – Property Management for Small Landlords',
  description: 'Never chase rent again. Automatic reminders, late fees, and tax-ready reports for $9/month.',
  keywords: 'property management, landlord software, rent tracking, small landlord',
  openGraph: {
    title: 'TinyLandlord',
    description: 'Never chase rent again.',
    url: 'https://tinylandlord.com',
    siteName: 'TinyLandlord',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
