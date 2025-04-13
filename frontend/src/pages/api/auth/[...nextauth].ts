import NextAuth, { DefaultSession, DefaultUser, SessionStrategy } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

// Extend the built-in types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
    } & DefaultSession['user'];
  }
  
  interface User extends DefaultUser {
    id?: string;
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Check if we're in development mode and use mock data if needed
          if (!process.env.NEXT_PUBLIC_AUTH_URL) {
            console.warn('NEXT_PUBLIC_AUTH_URL not set, using mock authentication');
            // Mock authentication for development
            if (credentials?.email === 'demo@example.com' && credentials?.password === 'password') {
              return {
                id: '1',
                name: 'Demo User',
                email: 'demo@example.com',
                token: 'mock-token-for-development'
              };
            }
            return null;
          }

          // Here you would typically validate against your backend
          const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          // Check if the response is JSON
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Response is not JSON:', await res.text());
            return null;
          }

          const user = await res.json();

          if (res.ok && user) {
            return user;
          }
          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth',
    signOut: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.id = token.id;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-development-secret-key',
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions); 