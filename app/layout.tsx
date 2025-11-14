import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Credit Card Recommendation Chatbot',
  description: 'Get personalized credit card recommendations using AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

