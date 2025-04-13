import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

// Extend the built-in types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
  }
  
  interface User extends DefaultUser {
    token?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
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
          // Here you would typically validate against your backend
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const user = await res.json();

          if (res.ok && user) {
            return user;
          }
          return null;
        } catch (error) {
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions); 