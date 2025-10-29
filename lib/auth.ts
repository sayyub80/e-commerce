
import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth/next';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('Auth: Missing credentials');
          return null;
        }

        const isAdminUser = credentials.username === process.env.ADMIN_USERNAME;
        const isAdminPass = credentials.password === process.env.ADMIN_PASSWORD;

        if (isAdminUser && isAdminPass) {
          console.log('Auth: Admin authorized');
          return { id: 'admin-user-id', name: 'Admin', role: 'admin' };
        }

        console.log('Auth: Invalid credentials');
        return null;
      },
    }),
  ],
  session: {
     strategy: 'jwt'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.role && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  debug: process.env.NODE_ENV === 'development',

  secret: process.env.NEXTAUTH_SECRET,
};

export const handlers = NextAuth(authOptions);

export default async function auth() {
  return await getServerSession(authOptions);
}