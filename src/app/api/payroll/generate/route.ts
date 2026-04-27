import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"
import { calculateMonthlyPayroll } from "@/lib/payroll-calculations"

// Generate payroll for all active employees
export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { month, year, branchId } = body

        if (!month || !year) {
            return NextResponse.json({ error: "Month and year are required" }, { status: 400 })
        }

        // Get all active employees with salary details
        const whereClause: any = {
            status: { in: ["ACTIVE", "PROBATION"] },
            basicSalary: { not: null }
        }

        // Filter by branch if provided
        if (branchId) {
            whereClause.branchId = branchId
        }

        const employees = await prisma.employee.findMany({
            where: whereClause,
            include: {
                branch: true
            }
        })

        const results = {
            created: 0,
            skipped: 0,
            errors: 0,
            details: [] as any[]
        }

        for (const employee of employees) {
            try {
                // Check if payslip already exists
                const existing = await prisma.payslip.findUnique({
                    where: {
                        employeeId_month_year: {
                            employeeId: employee.id,
                            month,
                            year
                        }
                    }
                })

                if (existing) {
                    results.skipped++
                    results.details.push({
                        employeeId: employee.employeeId,
                        name: `${employee.firstName} ${employee.lastName}`,
                        status: "skipped",
                        reason: "Payslip already exists"
                    })
                    continue
                }

                // Determine country from branch or default to UAE
                const country = employee.branch?.country || 'UAE'
                const currency = employee.branch?.currency || 'AED'

                // Calculate payroll based on country
                const payroll = calculateMonthlyPayroll({
                    country,
                    employee: {
                        basicSalary: Number(employee.basicSalary) || 0,
                        // UAE allowances
                        housingAllowance: Number(employee.housingAllowance) || 0,
                        transportAllowance: Number(employee.transportAllowance) || 0,
                        foodAllowance: Number(employee.foodAllowance) || 0,
                        phoneAllowance: Number(employee.phoneAllowance) || 0,
                        otherAllowance: Number(employee.otherAllowance) || 0,
                        // India allowances
                        hra: Number(employee.hra) || 0,
                        conveyanceAllowance: Number(employee.conveyanceAllowance) || 0,
                        medicalAllowance: Number(employee.medicalAllowance) || 0,
                        specialAllowance: Number(employee.specialAllowance) || 0,
                        lta: Number(employee.lta) || 0,
                        state: employee.state || 'KARNATAKA'
                    }
                })

                // Create payslip with country-specific data
                const payslipData: any = {
                    employeeId: employee.id,
                    month,
                    year,
                    country,
                    currency,
                    basicSalary: payroll.earnings.basicSalary,
                    grossEarnings: payroll.earnings.grossEarnings,
                    overtimePay: 0,
                    bonus: 0,
                    leaveDeduction: 0,
                    loanDeduction: 0,
                    advanceDeduction: 0,
                    otherDeduction: 0,
                    status: "DRAFT"
                }

                if (country === 'UAE') {
                    // UAE specific fields
                    payslipData.housingAllowance = payroll.earnings.housingAllowance || 0
                    payslipData.transportAllowance = payroll.earnings.transportAllowance || 0
                    payslipData.foodAllowance = payroll.earnings.foodAllowance || 0
                    payslipData.phoneAllowance = payroll.earnings.phoneAllowance || 0
                    payslipData.otherAllowance = payroll.earnings.otherAllowance || 0
                    payslipData.totalDeductions = payroll.deductions.totalDeductions || 0
                    payslipData.netSalary = payroll.netSalary
                    // No statutory deductions for UAE
                    payslipData.pfEmployee = 0
                    payslipData.pfEmployer = 0
                    payslipData.esiEmployee = 0
                    payslipData.esiEmployer = 0
                    payslipData.professionalTax = 0
                    payslipData.tds = 0
                } else {
                    // India specific fields
                    payslipData.hra = payroll.earnings.hra || 0
                    payslipData.conveyanceAllowance = payroll.earnings.conveyanceAllowance || 0
                    payslipData.medicalAllowance = payroll.earnings.medicalAllowance || 0
                    payslipData.specialAllowance = payroll.earnings.specialAllowance || 0
                    payslipData.lta = payroll.earnings.lta || 0
                    payslipData.pfEmployee = payroll.statutory.pfEmployee
                    payslipData.pfEmployer = payroll.statutory.pfEmployer
                    payslipData.esiEmployee = payroll.statutory.esiEmployee
                    payslipData.esiEmployer = payroll.statutory.esiEmployer
                    payslipData.professionalTax = payroll.statutory.professionalTax
                    payslipData.tds = payroll.statutory.tds
                    payslipData.totalDeductions = payroll.totalDeductions
                    payslipData.netSalary = payroll.netSalary
                }

                await prisma.payslip.create({ data: payslipData })

                results.created++
                results.details.push({
                    employeeId: employee.employeeId,
                    name: `${employee.firstName} ${employee.lastName}`,
                    branch: employee.branch?.name || 'N/A',
                    country,
                    status: "created",
                    grossSalary: payroll.earnings.grossEarnings,
                    netSalary: payroll.netSalary
                })
            } catch (err: any) {
                console.error(`Payroll error for ${employee.employeeId}:`, err.message)
                results.errors++
                results.details.push({
                    employeeId: employee.employeeId,
                    name: `${employee.firstName} ${employee.lastName}`,
                    status: "error",
                    reason: err.message || "Failed to create payslip"
                })
            }
        }

        return NextResponse.json({
            message: `Payroll generated: ${results.created} created, ${results.skipped} skipped, ${results.errors} errors`,
            ...results
        })
    } catch (error: any) {
        console.error("Generate Payroll Error:", error.message)
        return NextResponse.json({ error: "Failed to generate payroll" }, { status: 500 })
    }
}
