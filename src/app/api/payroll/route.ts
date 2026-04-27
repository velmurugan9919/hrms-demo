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
        const month = searchParams.get("month")
        const year = searchParams.get("year")
        const employeeId = searchParams.get("employeeId")
        const status = searchParams.get("status")

        const where: any = {}

        if (month) where.month = parseInt(month)
        if (year) where.year = parseInt(year)
        if (employeeId) where.employeeId = employeeId
        if (status) where.status = status

        const payslips = await prisma.payslip.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        department: { select: { name: true } },
                        designation: { select: { name: true } }
                    }
                }
            },
            orderBy: [{ year: "desc" }, { month: "desc" }]
        })

        return NextResponse.json(payslips)
    } catch (error: any) {
        console.error("GET Payslips Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch payslips" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { employeeId, month, year } = body

        // Check if payslip already exists
        const existing = await prisma.payslip.findUnique({
            where: { employeeId_month_year: { employeeId, month, year } }
        })

        if (existing) {
            return NextResponse.json({ error: "Payslip already exists for this period" }, { status: 400 })
        }

        // Get employee salary details
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: {
                basicSalary: true,
                housingAllowance: true,
                transportAllowance: true,
                foodAllowance: true,
                phoneAllowance: true,
                otherAllowance: true,
                totalSalary: true
            }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        const basicSalary = Number(employee.basicSalary) || 0
        const housingAllowance = Number(employee.housingAllowance) || 0
        const transportAllowance = Number(employee.transportAllowance) || 0
        const foodAllowance = Number(employee.foodAllowance) || 0
        const phoneAllowance = Number(employee.phoneAllowance) || 0
        const otherAllowance = Number(employee.otherAllowance) || 0

        const grossEarnings = basicSalary + housingAllowance + transportAllowance +
            foodAllowance + phoneAllowance + otherAllowance +
            (Number(body.overtimePay) || 0) + (Number(body.bonus) || 0)

        const totalDeductions = (Number(body.leaveDeduction) || 0) +
            (Number(body.loanDeduction) || 0) +
            (Number(body.advanceDeduction) || 0) +
            (Number(body.otherDeduction) || 0)

        const netSalary = grossEarnings - totalDeductions

        const payslip = await prisma.payslip.create({
            data: {
                employeeId,
                month,
                year,
                basicSalary,
                housingAllowance,
                transportAllowance,
                foodAllowance,
                phoneAllowance,
                otherAllowance,
                overtimePay: body.overtimePay || 0,
                bonus: body.bonus || 0,
                grossEarnings,
                leaveDeduction: body.leaveDeduction || 0,
                loanDeduction: body.loanDeduction || 0,
                advanceDeduction: body.advanceDeduction || 0,
                otherDeduction: body.otherDeduction || 0,
                totalDeductions,
                netSalary,
                status: "DRAFT"
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return NextResponse.json(payslip, { status: 201 })
    } catch (error: any) {
        console.error("POST Payslip Error:", error.message)
        return NextResponse.json({ error: "Failed to create payslip" }, { status: 500 })
    }
}
