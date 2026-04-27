import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Get employee by user email
        const employee = await prisma.employee.findUnique({
            where: { email: session.user.email },
            include: {
                department: true,
                designation: true
            }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        const payslips = await prisma.payslip.findMany({
            where: { employeeId: employee.id },
            orderBy: [{ year: "desc" }, { month: "desc" }]
        })

        return NextResponse.json({
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                firstName: employee.firstName,
                lastName: employee.lastName,
                email: employee.email,
                department: employee.department,
                designation: employee.designation
            },
            payslips
        })
    } catch (error: any) {
        console.error("GET Portal Payslips Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch payslips" }, { status: 500 })
    }
}
