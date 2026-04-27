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

        // Get leave balances
        const currentYear = new Date().getFullYear()
        const leaveBalance = await prisma.leaveBalance.findMany({
            where: {
                employeeId: employee.id,
                year: currentYear
            },
            include: {
                leaveType: true
            }
        })

        // Get recent leave requests
        const recentLeaves = await prisma.leaveRequest.findMany({
            where: { employeeId: employee.id },
            include: {
                leaveType: true
            },
            orderBy: { createdAt: "desc" },
            take: 5
        })

        // Get recent payslips
        const recentPayslips = await prisma.payslip.findMany({
            where: { employeeId: employee.id },
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take: 3
        })

        // Get this month's attendance summary
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        const attendanceCount = await prisma.attendance.count({
            where: {
                employeeId: employee.id,
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                },
                status: "PRESENT"
            }
        })

        return NextResponse.json({
            employee,
            leaveBalance,
            recentLeaves,
            recentPayslips,
            attendance: {
                presentDays: attendanceCount
            }
        })
    } catch (error: any) {
        console.error("Portal Dashboard Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 })
    }
}
