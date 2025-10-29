import { ReactNode } from 'react';
import auth from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // If user is not an admin, redirect to login
  if (session?.user?.role !== 'admin') {
    redirect('/login');
  }

  // If they are an admin, show the admin content
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  );
}