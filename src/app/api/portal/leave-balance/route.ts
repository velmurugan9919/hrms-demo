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

        const currentYear = new Date().getFullYear()

        // Get existing balances
        let balances = await prisma.leaveBalance.findMany({
            where: {
                employeeId: employee.id,
                year: currentYear
            },
            include: {
                leaveType: true
            }
        })

        // If no balances exist, create them from leave types
        if (balances.length === 0) {
            const leaveTypes = await prisma.leaveType.findMany({
                where: { isActive: true }
            })

            for (const leaveType of leaveTypes) {
                await prisma.leaveBalance.create({
                    data: {
                        employeeId: employee.id,
                        leaveTypeId: leaveType.id,
                        year: currentYear,
                        totalDays: leaveType.daysPerYear,
                        usedDays: 0
                    }
                })
            }

            balances = await prisma.leaveBalance.findMany({
                where: {
                    employeeId: employee.id,
                    year: currentYear
                },
                include: {
                    leaveType: true
                }
            })
        }

        return NextResponse.json(balances)
    } catch (error: any) {
        console.error("GET Leave Balance Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch leave balance" }, { status: 500 })
    }
}
