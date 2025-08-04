import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
// import Passkey from "next-auth/providers/passkey"
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [GoogleProvider, GithubProvider],
})
