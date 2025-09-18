import NextAuth, { DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// تعريف أنواع البيانات المخصصة
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      roleId: number
      roleName: string
      restaurantId?: string
      status: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    username: string
    roleId: number
    roleName: string
    restaurantId?: string
    status: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    roleId: number
    roleName: string
    restaurantId?: string
    status: string
  }
}

// تحقق من بيانات تسجيل الدخول
const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        try {
          // التحقق من صحة البيانات
          const { username, password } = loginSchema.parse(credentials)

          // البحث عن المستخدم في قاعدة البيانات
          const user = await prisma.user.findUnique({
            where: { username },
            include: {
              role: true,
              restaurant: {
                select: {
                  id: true
                }
              }
            }
          })

          if (!user) {
            return null
          }

          // التحقق من كلمة المرور
          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            return null
          }

          // التحقق من حالة المستخدم
          if (user.status !== "active") {
            throw new Error("الحساب غير مفعل")
          }

          // تحديث وقت آخر دخول
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          })

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            roleId: user.roleId,
            roleName: user.role.name,
            restaurantId: user.restaurant?.id,
            status: user.status,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.roleId = user.roleId
        token.roleName = user.roleName
        token.restaurantId = user.restaurantId
        token.status = user.status
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.roleId = token.roleId
        session.user.roleName = token.roleName
        session.user.restaurantId = token.restaurantId
        session.user.status = token.status
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async signOut({ token }) {
      // تسجيل عملية تسجيل الخروج
      if (token?.id) {
        console.log(`User ${token.username} signed out at ${new Date()}`)
      }
    },
  },
})
