import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"
import { hash } from "bcryptjs"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                isSystem: true,
                employeeId: true,
                employee: {
                    select: {
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        department: { select: { name: true } },
                        designation: { select: { name: true } }
                    }
                },
                createdAt: true,
                updatedAt: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Don't expose system users
        if (user.isSystem) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error: any) {
        console.error("GET User Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params
        const body = await req.json()
        const { name, email, password, role, isActive } = body

        // Check if target user is a system user
        const targetUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Prevent modifying system users through API
        if (targetUser.isSystem) {
            return NextResponse.json(
                { error: "Cannot modify system user" },
                { status: 403 }
            )
        }

        // Prevent assigning system roles
        if (['SUPER_ADMIN', 'DEVELOPER'].includes(role)) {
            return NextResponse.json(
                { error: "Cannot assign system role" },
                { status: 400 }
            )
        }

        const updateData: any = {}
        if (name) updateData.name = name
        if (email) updateData.email = email
        if (role) updateData.role = role
        if (typeof isActive === 'boolean') updateData.isActive = isActive
        if (password) {
            updateData.password = await hash(password, 10)
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true
            }
        })

        return NextResponse.json(user)
    } catch (error: any) {
        console.error("PUT User Error:", error.message)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
        const { id } = await params

        // Check if target user is a system user
        const targetUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Prevent deleting system users
        if (targetUser.isSystem) {
            return NextResponse.json(
                { error: "Cannot delete system user" },
                { status: 403 }
            )
        }

        // Prevent self-deletion
        if (targetUser.email === session.user.email) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            )
        }

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({ message: "User deleted successfully" })
    } catch (error: any) {
        console.error("DELETE User Error:", error.message)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }
}
