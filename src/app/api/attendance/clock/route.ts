import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { employeeId, action } = body

        if (!employeeId || !action) {
            return NextResponse.json(
                { error: "Employee ID and action (in/out) are required" },
                { status: 400 }
            )
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const now = new Date()

        // Check existing attendance for today
        let attendance = await prisma.attendance.findUnique({
            where: {
                employeeId_date: {
                    employeeId,
                    date: today
                }
            }
        })

        if (action === "in") {
            if (attendance?.clockIn) {
                return NextResponse.json(
                    { error: "Already clocked in today" },
                    { status: 400 }
                )
            }

            // Determine if late (after 9 AM)
            const nineAM = new Date(today)
            nineAM.setHours(9, 0, 0, 0)
            const status = now > nineAM ? "LATE" : "PRESENT"

            attendance = await prisma.attendance.upsert({
                where: {
                    employeeId_date: {
                        employeeId,
                        date: today
                    }
                },
                update: {
                    clockIn: now,
                    status
                },
                create: {
                    employeeId,
                    date: today,
                    clockIn: now,
                    status
                }
            })

            return NextResponse.json({
                message: "Clocked in successfully",
                attendance
            })
        } else if (action === "out") {
            if (!attendance?.clockIn) {
                return NextResponse.json(
                    { error: "Not clocked in today" },
                    { status: 400 }
                )
            }

            if (attendance.clockOut) {
                return NextResponse.json(
                    { error: "Already clocked out today" },
                    { status: 400 }
                )
            }

            // Calculate work hours
            const workHours = (now.getTime() - attendance.clockIn.getTime()) / (1000 * 60 * 60)

            // Determine if half day (less than 4 hours)
            let status = attendance.status
            if (workHours < 4) {
                status = "HALF_DAY"
            }

            attendance = await prisma.attendance.update({
                where: { id: attendance.id },
                data: {
                    clockOut: now,
                    workHours,
                    status
                }
            })

            return NextResponse.json({
                message: "Clocked out successfully",
                attendance
            })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error: any) {
        console.error("Clock Error:", error.message)
        return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
    }
}
