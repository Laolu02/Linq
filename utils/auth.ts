import prisma from "@/prisma/connection.prisma";
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider  from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github";
import bcrypt from 'bcryptjs';

declare module "next-auth"{
    interface Session{
        user:{
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
    signIn: "/auth",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider == "google") {
        const User = await prisma.users.findFirst({
          where: { email: user.email! },
        });
        if (User) {
          return true;
        }
        await prisma.users.create({
          data: {
            email: user.email!,
            name: user.name!,
            password: "oauth-user",
            age: null!,
          },
        });
      }
      if (account?.provider == "github") {
        const User = await prisma.users.findFirst({
          where: { email: user.email! },
        });
        if (User) {
          return true;
        }
        await prisma.users.create({
          data: {
            email: user.email!,
            name: user.name!,
            password: "oauth-user",
            age: null!,
          },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      const User = await prisma.users.findFirst({
        where: { email: session.user?.email! },
        select: { id: true },
      });
      session.user.id = User?.id!;
      if (token.id) {
        session.user.id = token.id as string;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
     
      return `${baseUrl}/chat`;
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