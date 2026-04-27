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
        const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())

        if (!employeeId) {
            return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
        }

        // Get all leave types
        const leaveTypes = await prisma.leaveType.findMany({
            where: { isActive: true }
        })

        // Get leave balances for the employee
        const balances = await prisma.leaveBalance.findMany({
            where: {
                employeeId,
                year
            },
            include: {
                leaveType: true
            }
        })

        // Create a combined view with all leave types
        const result = leaveTypes.map(leaveType => {
            const balance = balances.find(b => b.leaveTypeId === leaveType.id)
            return {
                leaveTypeId: leaveType.id,
                leaveTypeName: leaveType.name,
                isPaid: leaveType.isPaid,
                totalDays: balance?.totalDays ?? leaveType.daysPerYear,
                usedDays: balance?.usedDays ?? 0,
                availableDays: (balance?.totalDays ?? leaveType.daysPerYear) - (balance?.usedDays ?? 0)
            }
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error("GET Leave Balance Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch leave balance" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { employeeId, leaveTypeId, year, totalDays } = body

        if (!employeeId || !leaveTypeId) {
            return NextResponse.json(
                { error: "Employee ID and leave type ID are required" },
                { status: 400 }
            )
        }

        const currentYear = year || new Date().getFullYear()

        const balance = await prisma.leaveBalance.upsert({
            where: {
                employeeId_leaveTypeId_year: {
                    employeeId,
                    leaveTypeId,
                    year: currentYear
                }
            },
            update: {
                totalDays: totalDays
            },
            create: {
                employeeId,
                leaveTypeId,
                year: currentYear,
                totalDays: totalDays || 0,
                usedDays: 0
            },
            include: {
                leaveType: true
            }
        })

        return NextResponse.json(balance)
    } catch (error: any) {
        console.error("POST Leave Balance Error:", error.message)
        return NextResponse.json({ error: "Failed to update leave balance" }, { status: 500 })
    }
}
