import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'چت‌بات مامی‌لند | MamiLand Chatbot',
  description: 'دستیار هوشمند مامی‌لند برای مادران و خانواده‌ها',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-vazir">{children}</body>
    </html>
  )
}