import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()
        const { name, description } = body

        const department = await prisma.department.update({
            where: { id },
            data: { name, description }
        })

        return NextResponse.json(department)
    } catch (error: any) {
        console.error("PUT Department Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Department name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        // Check if department has employees
        const employeeCount = await prisma.employee.count({
            where: { departmentId: id }
        })

        if (employeeCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete department with employees" },
                { status: 400 }
            )
        }

        await prisma.department.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Department deleted successfully" })
    } catch (error: any) {
        console.error("DELETE Department Error:", error.message)
        return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
    }
}
