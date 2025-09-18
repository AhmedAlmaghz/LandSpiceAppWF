import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      email: string | null
      firstName: string | null
      lastName: string | null
      role: string
      status: string
    }
  }

  interface User {
    username: string
    firstName: string | null
    lastName: string | null
    role: string
    status: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
    firstName: string | null
    lastName: string | null
    role: string
    status: string
  }
}
