import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"
import { hash } from "bcryptjs"

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER', 'HR'].includes(currentUser.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        // Filter out system users (hidden accounts)
        const users = await prisma.user.findMany({
            where: {
                isSystem: false  // Hide system accounts
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                employeeId: true,
                employee: {
                    select: {
                        employeeId: true,
                        firstName: true,
                        lastName: true
                    }
                },
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(users)
    } catch (error: any) {
        console.error("GET Users Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin privileges
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!currentUser || !['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'].includes(currentUser.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const body = await req.json()
        const { name, email, password, role, employeeId } = body

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            )
        }

        // Prevent creating system roles through API
        if (['SUPER_ADMIN', 'DEVELOPER'].includes(role)) {
            return NextResponse.json(
                { error: "Cannot create system user through API" },
                { status: 400 }
            )
        }

        const hashedPassword = await hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'USER',
                employeeId: employeeId || null,
                isSystem: false  // Never create system users through API
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true
            }
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error: any) {
        console.error("POST User Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
}
