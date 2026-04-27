import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                department: true,
                designation: true
            }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        return NextResponse.json(employee)
    } catch (error: any) {
        console.error("GET Employee Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()
        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            city,
            state,
            country,
            zipCode,
            joiningDate,
            status,
            salary,
            departmentId,
            designationId
        } = body

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                employeeId,
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                address,
                city,
                state,
                country,
                zipCode,
                joiningDate: joiningDate ? new Date(joiningDate) : undefined,
                status,
                salary: salary || null,
                departmentId: departmentId || null,
                designationId: designationId || null
            },
            include: {
                department: true,
                designation: true
            }
        })

        return NextResponse.json(employee)
    } catch (error: any) {
        console.error("PUT Employee Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Employee ID or email already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        await prisma.employee.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Employee deleted successfully" })
    } catch (error: any) {
        console.error("DELETE Employee Error:", error.message)
        return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
    }
}
