'use client'; 

import Link from 'next/link';
import { ShoppingBag, LayoutDashboard } from 'lucide-react'; 
import { useSession } from 'next-auth/react'; 
import { AuthButton } from './AuthButton';
import { CartIcon } from './CartIcon';

export function Header() {
  const { data: session } = useSession(); 
  const isAdmin = session?.user?.role === 'admin'; 

  return (
    <header className="sticky px-12 top-0 z-50 w-full border-b bg-background/95 backdrop-blur py-2">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">E-Commerce</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm md:flex lg:gap-6">
          <Link href="/" className="font-medium text-foreground/80 transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/dashboard" className="font-medium text-foreground/80 transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/recommendations" className="font-medium text-foreground/80 transition-colors hover:text-foreground">
            For You
          </Link>

          {/* Conditionally render Admin link */}
          {isAdmin && (
            <Link href="/admin" className="flex items-center font-medium text-primary transition-colors hover:text-primary/80">
              <LayoutDashboard className="mr-1 h-4 w-4" /> 
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <CartIcon />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}