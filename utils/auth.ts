import prisma from "@/prisma/connection.prisma";
import  { NextAuthOptions } from "next-auth";
import CredentialsProvider  from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

declare module "next-auth"{
    interface Session{
        user:{
            createdAt: string | number | Date;
            image: string | null | undefined;
            name:string,
            email:string,
            age: number,
            id: string, 
            password: string
        }
    }
}


export const authOptions: NextAuthOptions = {
  debug:true,
  session: {
    strategy: "jwt",
    maxAge: 10*24*60*60
  },  
  providers: [
    CredentialsProvider({
      name: "Linq",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.users.findUnique({
          where: { email: credentials?.email },
        });
        if (
          user &&
          user.password &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        }
        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/signin",
    error:'/auth/error'
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      if (!user.email) return false;
      if (account?.provider === 'credentials') {
        if (!user?.id) {
            console.error('Credentials user object missing ID after successful authorization.');
            return false;
        }
        return true;
    }
      const existingUser = await prisma.users.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          return true;
        }
      let newUserid:string;
      if (account?.provider === "google" || account?.provider === "github") {
      newUserid = user.id;
    } else {
      newUserid = uuidv4();
    }
        
      try {
        await prisma.users.create({
          data: {
            //id: newUserid,
            email: user.email!,
            name: user.name!,
            image: user.image || null,
            password: "oauth-user", 
            age: null,
          },
        });

        return true;
      } catch (error) {
        console.error(`Error in ${account?.provider} sign in:`, error);
        return false; 
    }
    return true;
  },
    // async jwt({ token, user }) {
    //   if (user) {
    //     token.id = user.id;
    //   }
    //   return token;
    // },
    async session({ session, token }) {
      const User = await prisma.users.findUnique({
        where: { email: session.user?.email! },
        select: { id: true },
      });
      session.user.id = User?.id!;
      session.user.name = session.user.name!;
      session.user.email = session.user.email!;
      session.user.image = session.user.image!;

      if (token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },

     async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      //return `${baseUrl}/chat`;
      return baseUrl;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    },
  },
  events: {
    async signIn(message) {
      console.log("SIGN IN EVENT:", message);
    },
    async signOut(message) {
      console.log("SIGN OUT EVENT:", message);
    },
  },
};