import { Feedback } from "@/components/feedback"
import { TRPCReactProvider } from "@/trpc/client"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
})

const APP_NAME = "Task Manager tRPC"
const APP_DESCRIPTION = "A simple task manager built with Next.js and tRPC"

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  icons: { apple: "/logo.png" }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCReactProvider>
          <header className="border-b border-gray-200 dark:border-gray-800">
            <div className="mx-auto flex max-w-2xl items-center px-6 py-3 font-sans">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Image src="/logo.svg" alt="" width={28} height={28} priority />
                {APP_NAME}
              </Link>
            </div>
          </header>
          {children}
          <Feedback />
        </TRPCReactProvider>
      </body>
    </html>
  )
}
