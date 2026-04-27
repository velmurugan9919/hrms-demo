import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"
import { calculateSettlement } from "@/lib/payroll-calculations"

// Calculate settlement preview without saving
export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            employeeId,
            lastWorkingDate,
            pendingLeaveDays,
            noticePeriodServed,
            terminationType,
            pendingSalary,
            airfareAllowance,
            bonusOrIncentive,
            otherPayments,
            loanBalance,
            advanceBalance,
            otherDeductions,
            pfBalance  // India only
        } = body

        // Get employee details with branch
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                branch: true,
                department: { select: { name: true } },
                designation: { select: { name: true } }
            }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        const basicSalary = Number(employee.basicSalary) || 0
        const totalSalary = Number(employee.totalSalary) || basicSalary
        const da = Number(employee.specialAllowance) || 0  // DA for India
        const termType = terminationType || employee.terminationType

        if (!termType) {
            return NextResponse.json({ error: "Termination type is required" }, { status: 400 })
        }

        // Determine country from branch or default to UAE
        const country = (employee.branch?.country || 'UAE') as 'UAE' | 'IND'
        const currency = employee.branch?.currency || 'AED'

        // Calculate settlement using unified function
        const settlementResult = calculateSettlement({
            country,
            basicSalary,
            totalSalary,
            da,
            joiningDate: employee.joiningDate,
            lastWorkingDate: new Date(lastWorkingDate),
            terminationType: termType,
            contractType: (employee.contractType || 'LIMITED') as any,
            pendingLeaveDays: pendingLeaveDays || 0,
            noticePeriodDays: employee.noticePeriodDays || 30,
            noticePeriodServed: noticePeriodServed || 0,
            pendingSalary: Number(pendingSalary) || 0,
            bonus: Number(bonusOrIncentive) || 0,
            loanBalance: Number(loanBalance) || 0,
            advanceBalance: Number(advanceBalance) || 0,
            otherDeductions: Number(otherDeductions) || 0,
            airfareAllowance: Number(airfareAllowance) || 0,
            pfBalance: Number(pfBalance) || 0
        })

        return NextResponse.json({
            employee: {
                id: employee.id,
                employeeId: employee.employeeId,
                name: `${employee.firstName} ${employee.lastName}`,
                department: employee.department?.name,
                designation: employee.designation?.name,
                branch: employee.branch?.name,
                joiningDate: employee.joiningDate,
                basicSalary,
                totalSalary,
                noticePeriodDays: employee.noticePeriodDays || 30,
                contractType: employee.contractType
            },
            country,
            currency,
            serviceDetails: {
                totalYears: settlementResult.gratuity.totalYears,
                totalMonths: settlementResult.gratuity.totalMonths,
                totalDays: settlementResult.gratuity.totalDays
            },
            gratuity: {
                eligible: settlementResult.gratuity.gratuityEligible !== false,
                days: settlementResult.gratuity.gratuityDays,
                amount: settlementResult.gratuity.gratuityAmount,
                breakdown: settlementResult.gratuity.breakdown,
                note: country === 'IND'
                    ? 'India: Eligible after 5 years of service (Payment of Gratuity Act)'
                    : 'UAE: Eligible after 1 year of service (UAE Labor Law)'
            },
            leaveEncashment: settlementResult.leaveEncashment,
            noticePeriod: settlementResult.noticePeriod,
            earnings: settlementResult.earnings,
            deductions: settlementResult.deductions,
            summary: {
                totalEarnings: settlementResult.earnings.total,
                totalDeductions: settlementResult.deductions.total,
                netSettlement: settlementResult.netSettlement
            }
        })
    } catch (error: any) {
        console.error("Calculate Settlement Error:", error.message)
        return NextResponse.json({ error: "Failed to calculate settlement" }, { status: 500 })
    }
}
