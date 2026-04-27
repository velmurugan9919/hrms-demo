import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1))
        const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()))

        // Get employee by user email
        const employee = await prisma.employee.findUnique({
            where: { email: session.user.email }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        // Get start and end of month
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0)

        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: "asc" }
        })

        // Calculate summary
        const summary = {
            present: attendance.filter(a => a.status === "PRESENT").length,
            absent: attendance.filter(a => a.status === "ABSENT").length,
            late: attendance.filter(a => a.status === "LATE").length,
            leave: attendance.filter(a => a.status === "ON_LEAVE").length,
            totalHours: attendance.reduce((sum, a) => sum + (Number(a.workHours) || 0), 0)
        }

        return NextResponse.json({ attendance, summary })
    } catch (error: any) {
        console.error("GET Portal Attendance Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
    }
}
