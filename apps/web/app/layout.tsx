import { GlobalErrorBoundary } from '@/components/global-error-boundary';
import { SessionProvider } from '@/components/session-provider';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'clipcode - Code Snippet Manager',
  description: 'Manage your code snippets with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <GlobalErrorBoundary>
            {children}
            <Toaster richColors position="top-right" />
          </GlobalErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
