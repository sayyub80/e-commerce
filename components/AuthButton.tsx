'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react'; 

export function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Button onClick={() => signOut()} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn()}>
      <LogIn className="mr-2 h-4 w-4" />
      Sign In
    </Button>
  );
}