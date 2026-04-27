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

        const designation = await prisma.designation.update({
            where: { id },
            data: { name, description }
        })

        return NextResponse.json(designation)
    } catch (error: any) {
        console.error("PUT Designation Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Designation name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update designation" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        // Check if designation has employees
        const employeeCount = await prisma.employee.count({
            where: { designationId: id }
        })

        if (employeeCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete designation with employees" },
                { status: 400 }
            )
        }

        await prisma.designation.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Designation deleted successfully" })
    } catch (error: any) {
        console.error("DELETE Designation Error:", error.message)
        return NextResponse.json({ error: "Failed to delete designation" }, { status: 500 })
    }
}
