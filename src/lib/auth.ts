import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare, hash } from "bcryptjs"
import { prisma } from "./db.server"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // First try to find in User table (Admin, HR, Manager, etc.)
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (user) {
                    const isPasswordValid = await compare(
                        credentials.password as string,
                        user.password
                    )

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                }

                // If not found in User table, check Employee table
                // Employees can login using their email and employeeId as password
                const employee = await prisma.employee.findUnique({
                    where: { email: credentials.email as string }
                })

                if (employee) {
                    // For employees, password can be their employeeId or a set password
                    // Check if there's a linked user account
                    const linkedUser = await prisma.user.findFirst({
                        where: { employeeId: employee.id }
                    })

                    if (linkedUser) {
                        const isPasswordValid = await compare(
                            credentials.password as string,
                            linkedUser.password
                        )

                        if (!isPasswordValid) {
                            return null
                        }

                        return {
                            id: linkedUser.id,
                            email: linkedUser.email,
                            name: linkedUser.name,
                            role: linkedUser.role
                        }
                    }

                    // If no linked user, allow login with employeeId as password (first time)
                    if (credentials.password === employee.employeeId) {
                        // Create a user account for this employee
                        const hashedPassword = await hash(employee.employeeId, 10)
                        const newUser = await prisma.user.create({
                            data: {
                                email: employee.email,
                                name: `${employee.firstName} ${employee.lastName}`,
                                password: hashedPassword,
                                role: "USER",
                                employeeId: employee.id
                            }
                        })

                        return {
                            id: newUser.id,
                            email: newUser.email,
                            name: newUser.name,
                            role: newUser.role
                        }
                    }
                }

                return null
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id as string
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                if (token.role) {
                    session.user.role = token.role as string
                }
                if (token.id) {
                    session.user.id = token.id as string
                }
            }
            return session
        }
    },
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt"
    }
})
