import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const employeeId = searchParams.get("employeeId")
        const status = searchParams.get("status")

        const where: any = {}

        if (employeeId) {
            where.employeeId = employeeId
        }

        if (status) {
            where.status = status
        }

        const leaveRequests = await prisma.leaveRequest.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        department: { select: { name: true } }
                    }
                },
                leaveType: true
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(leaveRequests)
    } catch (error: any) {
        console.error("GET Leave Requests Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { employeeId, leaveTypeId, startDate, endDate, reason } = body

        if (!employeeId || !leaveTypeId || !startDate || !endDate) {
            return NextResponse.json(
                { error: "Employee, leave type, start date, and end date are required" },
                { status: 400 }
            )
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (end < start) {
            return NextResponse.json(
                { error: "End date cannot be before start date" },
                { status: 400 }
            )
        }

        // Calculate total days (excluding weekends)
        let totalDays = 0
        const currentDate = new Date(start)
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay()
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                totalDays++
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }

        // Check leave balance
        const currentYear = new Date().getFullYear()
        const leaveBalance = await prisma.leaveBalance.findUnique({
            where: {
                employeeId_leaveTypeId_year: {
                    employeeId,
                    leaveTypeId,
                    year: currentYear
                }
            }
        })

        const availableDays = leaveBalance
            ? leaveBalance.totalDays - leaveBalance.usedDays
            : 0

        if (totalDays > availableDays) {
            return NextResponse.json(
                { error: `Insufficient leave balance. Available: ${availableDays} days` },
                { status: 400 }
            )
        }

        // Check for overlapping requests
        const overlapping = await prisma.leaveRequest.findFirst({
            where: {
                employeeId,
                status: { in: ["PENDING", "APPROVED"] },
                OR: [
                    {
                        startDate: { lte: end },
                        endDate: { gte: start }
                    }
                ]
            }
        })

        if (overlapping) {
            return NextResponse.json(
                { error: "You have an overlapping leave request" },
                { status: 400 }
            )
        }

        const leaveRequest = await prisma.leaveRequest.create({
            data: {
                employeeId,
                leaveTypeId,
                startDate: start,
                endDate: end,
                totalDays,
                reason
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                leaveType: true
            }
        })

        return NextResponse.json(leaveRequest, { status: 201 })
    } catch (error: any) {
        console.error("POST Leave Request Error:", error.message)
        return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
    }
}
