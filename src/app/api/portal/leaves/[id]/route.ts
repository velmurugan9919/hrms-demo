import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()

        // Get employee by user email
        const employee = await prisma.employee.findUnique({
            where: { email: session.user.email }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        // Get leave request
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        })

        if (!leaveRequest) {
            return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
        }

        // Verify ownership
        if (leaveRequest.employeeId !== employee.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        if (body.action === "CANCEL") {
            if (leaveRequest.status !== "PENDING") {
                return NextResponse.json({
                    error: "Only pending leave requests can be cancelled"
                }, { status: 400 })
            }

            const updated = await prisma.leaveRequest.update({
                where: { id },
                data: { status: "CANCELLED" },
                include: { leaveType: true }
            })

            return NextResponse.json(updated)
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error: any) {
        console.error("PUT Portal Leave Error:", error.message)
        return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 })
    }
}
