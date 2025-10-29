

import 'next-auth';
import 'next-auth/jwt';


// 1. Extend the built-in 'User' type
declare module 'next-auth' {
  /**
   * This is the user object returned from the 'authorize' callback.
   */
  interface User {
    role?: string;
  }

  /**
   * This is the session object returned from 'useSession' or 'auth()'.
   */
  interface Session {
    user: {
      role?: string;
    } & DefaultSession['user']; // Keep the default properties
  }
}

// 2. Extend the built-in 'JWT' type
declare module 'next-auth/jwt' {
  /**
   * This is the token object passed to the 'jwt' callback.
   */
  interface JWT {
    role?: string;
  }
}