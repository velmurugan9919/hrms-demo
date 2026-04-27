import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

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
        const branch = await prisma.branch.findUnique({
            where: { id },
            include: {
                employees: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        designation: true,
                        department: true
                    }
                },
                leavePolicy: {
                    include: {
                        leaveType: true
                    }
                },
                _count: {
                    select: { employees: true }
                }
            }
        })

        if (!branch) {
            return NextResponse.json({ error: "Branch not found" }, { status: 404 })
        }

        return NextResponse.json(branch)
    } catch (error: any) {
        console.error("GET Branch Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch branch" }, { status: 500 })
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

    try {
        const { id } = await params
        const body = await req.json()
        const { name, code, country, currency, address, city, state, phone, email, isActive } = body

        const branch = await prisma.branch.update({
            where: { id },
            data: {
                name,
                code,
                country,
                currency,
                address,
                city,
                state,
                phone,
                email,
                isActive
            }
        })

        return NextResponse.json(branch)
    } catch (error: any) {
        console.error("PUT Branch Error:", error.message)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Branch not found" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to update branch" }, { status: 500 })
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

    try {
        const { id } = await params

        // Check if branch has employees
        const employeeCount = await prisma.employee.count({
            where: { branchId: id }
        })

        if (employeeCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete branch with employees. Please reassign employees first." },
                { status: 400 }
            )
        }

        await prisma.branch.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Branch deleted successfully" })
    } catch (error: any) {
        console.error("DELETE Branch Error:", error.message)
        if (error.code === "P2025") {
            return NextResponse.json({ error: "Branch not found" }, { status: 404 })
        }
        return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 })
    }
}
