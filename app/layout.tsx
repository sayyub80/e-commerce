
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/sooner';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import StoreProvider from '@/store/StoreProvider'; // <-- Import StoreProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'E-Commerce Pro', // Updated Title
  description: 'A premium e-commerce platform built with Next.js', // Updated Desc
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <StoreProvider> {/* <-- Wrap with StoreProvider */}
          <SessionProviderWrapper>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <main className="container mx-auto flex-1 px-14 py-8 md:py-12"> {/* Added more padding */}
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="bottom-right" richColors /> {/* Moved to bottom-right */}
          </SessionProviderWrapper>
        </StoreProvider> {/* <-- Close Provider */}
      </body>
    </html>
  );
}