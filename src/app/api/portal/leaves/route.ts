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
            where: { email: session.user.email }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        const leaveRequests = await prisma.leaveRequest.findMany({
            where: { employeeId: employee.id },
            include: {
                leaveType: true
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(leaveRequests)
    } catch (error: any) {
        console.error("GET Portal Leaves Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { leaveTypeId, startDate, endDate, totalDays, reason } = body

        if (!leaveTypeId || !startDate || !endDate || !totalDays) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Get employee by user email
        const employee = await prisma.employee.findUnique({
            where: { email: session.user.email }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        // Check leave balance
        const currentYear = new Date().getFullYear()
        const balance = await prisma.leaveBalance.findUnique({
            where: {
                employeeId_leaveTypeId_year: {
                    employeeId: employee.id,
                    leaveTypeId,
                    year: currentYear
                }
            }
        })

        if (balance) {
            const available = balance.totalDays - balance.usedDays
            if (totalDays > available) {
                return NextResponse.json({
                    error: `Insufficient leave balance. Available: ${available} days`
                }, { status: 400 })
            }
        }

        // Check for overlapping leave requests
        const overlapping = await prisma.leaveRequest.findFirst({
            where: {
                employeeId: employee.id,
                status: { notIn: ["REJECTED", "CANCELLED"] },
                OR: [
                    {
                        startDate: { lte: new Date(endDate) },
                        endDate: { gte: new Date(startDate) }
                    }
                ]
            }
        })

        if (overlapping) {
            return NextResponse.json({
                error: "You have an overlapping leave request for this period"
            }, { status: 400 })
        }

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId: employee.id,
                leaveTypeId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                totalDays,
                reason,
                status: "PENDING"
            },
            include: {
                leaveType: true
            }
        })

        return NextResponse.json(leaveRequest, { status: 201 })
    } catch (error: any) {
        console.error("POST Portal Leave Error:", error.message)
        return NextResponse.json({ error: "Failed to submit leave request" }, { status: 500 })
    }
}
