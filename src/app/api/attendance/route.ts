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
        const date = searchParams.get("date")
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        const where: any = {}

        if (employeeId) {
            where.employeeId = employeeId
        }

        if (date) {
            where.date = new Date(date)
        } else if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }

        const attendance = await prisma.attendance.findMany({
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
                }
            },
            orderBy: [{ date: "desc" }, { clockIn: "desc" }]
        })

        return NextResponse.json(attendance)
    } catch (error: any) {
        console.error("GET Attendance Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { employeeId, date, clockIn, clockOut, status, notes } = body

        if (!employeeId || !date) {
            return NextResponse.json(
                { error: "Employee ID and date are required" },
                { status: 400 }
            )
        }

        // Calculate work hours if both clock in and out are provided
        let workHours = null
        if (clockIn && clockOut) {
            const inTime = new Date(clockIn)
            const outTime = new Date(clockOut)
            workHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60)
        }

        const attendance = await prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId,
                    date: new Date(date)
                }
            },
            update: {
                clockIn: clockIn ? new Date(clockIn) : undefined,
                clockOut: clockOut ? new Date(clockOut) : undefined,
                status: status || undefined,
                workHours,
                notes
            },
            create: {
                employeeId,
                date: new Date(date),
                clockIn: clockIn ? new Date(clockIn) : null,
                clockOut: clockOut ? new Date(clockOut) : null,
                status: status || "PRESENT",
                workHours,
                notes
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return NextResponse.json(attendance, { status: 201 })
    } catch (error: any) {
        console.error("POST Attendance Error:", error.message)
        return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
    }
}
