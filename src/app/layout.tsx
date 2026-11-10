import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
const geist = localFont({
  src: '../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
})
const mono = localFont({
  src: '../../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  preload: false,
  display: 'swap',
})
import './globals.css'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { QueryProvider } from '@/lib/query-client'
import { ThemeProvider } from '@/lib/theme'
export const metadata: Metadata = {
  title: 'Overhead',
  description: 'Satellite and ISS tracker',
}
const bootstrap = `(function(){try{var p=localStorage.getItem('overhead:theme')||'system';document.documentElement.dataset.theme=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):(p==='light'?'light':'dark')}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()`
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {bootstrap}
        </Script>
      </head>
      <body>
        <NuqsAdapter>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
