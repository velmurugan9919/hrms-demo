import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"
import { calculateGratuity, calculateLeaveEncashment, calculateNoticePeriod, generateSettlementNumber } from "@/lib/uae-calculations"

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
        if (employeeId) where.employeeId = employeeId
        if (status) where.status = status

        const settlements = await prisma.finalSettlement.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        department: { select: { name: true } },
                        designation: { select: { name: true } },
                        terminationType: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(settlements)
    } catch (error: any) {
        console.error("GET Settlements Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch settlements" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { employeeId, lastWorkingDate, pendingLeaveDays, noticePeriodServed, airfareAllowance, bonusOrIncentive, otherPayments, loanBalance, advanceBalance, otherDeductions, remarks } = body

        // Get employee details
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            select: {
                id: true,
                joiningDate: true,
                basicSalary: true,
                totalSalary: true,
                noticePeriodDays: true,
                contractType: true,
                terminationType: true
            }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        if (!employee.terminationType) {
            return NextResponse.json({ error: "Please set termination type for employee first" }, { status: 400 })
        }

        const basicSalary = Number(employee.basicSalary) || 0
        const totalSalary = Number(employee.totalSalary) || basicSalary

        // Calculate gratuity
        const gratuityResult = calculateGratuity({
            basicSalary,
            totalSalary,
            joiningDate: employee.joiningDate,
            lastWorkingDate: new Date(lastWorkingDate),
            terminationType: employee.terminationType as any,
            contractType: (employee.contractType || 'LIMITED') as any
        })

        // Calculate leave encashment
        const leaveEncashmentAmount = calculateLeaveEncashment({
            totalSalary,
            pendingLeaveDays: pendingLeaveDays || 0
        })

        // Calculate notice period
        const noticePeriodResult = calculateNoticePeriod({
            totalSalary,
            noticePeriodDays: employee.noticePeriodDays || 30,
            noticePeriodServed: noticePeriodServed || 0
        })

        // Calculate totals
        const totalEarnings = gratuityResult.gratuityAmount +
            leaveEncashmentAmount +
            noticePeriodResult.payable +
            (Number(airfareAllowance) || 0) +
            (Number(bonusOrIncentive) || 0) +
            (Number(otherPayments) || 0)

        const totalDeductionsCalc = noticePeriodResult.deductible +
            (Number(loanBalance) || 0) +
            (Number(advanceBalance) || 0) +
            (Number(otherDeductions) || 0)

        const netSettlement = totalEarnings - totalDeductionsCalc

        const settlement = await prisma.finalSettlement.create({
            data: {
                employeeId,
                settlementNumber: generateSettlementNumber(),
                joiningDate: employee.joiningDate,
                lastWorkingDate: new Date(lastWorkingDate),
                totalServiceYears: gratuityResult.totalYears,
                totalServiceMonths: gratuityResult.totalMonths,
                totalServiceDays: gratuityResult.totalDays,
                basicSalary,
                totalSalary,
                gratuityDays: gratuityResult.gratuityDays,
                gratuityAmount: gratuityResult.gratuityAmount,
                pendingLeaveDays: pendingLeaveDays || 0,
                leaveEncashment: leaveEncashmentAmount,
                noticePeriodDays: employee.noticePeriodDays || 30,
                noticePeriodServed: noticePeriodServed || 0,
                noticePeriodPayable: noticePeriodResult.payable,
                noticePeriodDeduction: noticePeriodResult.deductible,
                airfareAllowance: airfareAllowance || 0,
                bonusOrIncentive: bonusOrIncentive || 0,
                otherPayments: otherPayments || 0,
                loanBalance: loanBalance || 0,
                advanceBalance: advanceBalance || 0,
                otherDeductions: otherDeductions || 0,
                totalEarnings,
                totalDeductions: totalDeductionsCalc,
                netSettlement,
                status: "DRAFT",
                remarks
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

        return NextResponse.json({
            settlement,
            gratuityBreakdown: gratuityResult.breakdown
        }, { status: 201 })
    } catch (error: any) {
        console.error("POST Settlement Error:", error.message)
        return NextResponse.json({ error: "Failed to create settlement" }, { status: 500 })
    }
}
