// UAE Labor Law Calculations

/**
 * Calculate Gratuity as per UAE Labor Law
 *
 * For Limited Contract (resignation):
 * - Less than 1 year: No gratuity
 * - 1-3 years: 1/3 of 21 days per year
 * - 3-5 years: 2/3 of 21 days per year
 * - 5+ years: Full 21 days per year (first 5) + 30 days per year (after 5)
 *
 * For Unlimited Contract or Termination by employer:
 * - Less than 1 year: No gratuity
 * - 1-5 years: 21 days basic salary per year
 * - 5+ years: 30 days basic salary per year (for years beyond 5)
 *
 * Maximum gratuity: 2 years of total salary
 */
export function calculateGratuity(params: {
    basicSalary: number
    totalSalary: number
    joiningDate: Date
    lastWorkingDate: Date
    terminationType: 'RESIGNATION' | 'TERMINATION' | 'END_OF_CONTRACT' | 'MUTUAL_AGREEMENT' | 'ABSCONDING' | 'DEATH' | 'RETIREMENT'
    contractType: 'LIMITED' | 'UNLIMITED'
}): {
    totalYears: number
    totalMonths: number
    totalDays: number
    gratuityDays: number
    gratuityAmount: number
    breakdown: string[]
} {
    const { basicSalary, totalSalary, joiningDate, lastWorkingDate, terminationType, contractType } = params

    // Calculate service duration
    const startDate = new Date(joiningDate)
    const endDate = new Date(lastWorkingDate)

    const diffTime = endDate.getTime() - startDate.getTime()
    const totalDaysServed = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    const totalYears = totalDaysServed / 365
    const fullYears = Math.floor(totalYears)
    const remainingDays = totalDaysServed % 365
    const totalMonths = Math.floor(totalDaysServed / 30.44)

    const breakdown: string[] = []
    let gratuityDays = 0

    // No gratuity for less than 1 year
    if (totalYears < 1) {
        breakdown.push('Service less than 1 year - No gratuity applicable')
        return {
            totalYears: parseFloat(totalYears.toFixed(2)),
            totalMonths,
            totalDays: totalDaysServed,
            gratuityDays: 0,
            gratuityAmount: 0,
            breakdown
        }
    }

    // No gratuity for absconding employees
    if (terminationType === 'ABSCONDING') {
        breakdown.push('Employee absconded - No gratuity applicable as per UAE Labor Law')
        return {
            totalYears: parseFloat(totalYears.toFixed(2)),
            totalMonths,
            totalDays: totalDaysServed,
            gratuityDays: 0,
            gratuityAmount: 0,
            breakdown
        }
    }

    const dailyBasic = basicSalary / 30

    if (terminationType === 'RESIGNATION' && contractType === 'UNLIMITED') {
        // Resignation from unlimited contract - reduced gratuity for first 5 years
        if (totalYears >= 1 && totalYears < 3) {
            // 1/3 of 21 days per year
            gratuityDays = (21 / 3) * totalYears
            breakdown.push(`1-3 years service: ${totalYears.toFixed(2)} years × 7 days = ${gratuityDays.toFixed(2)} days (1/3 of 21 days)`)
        } else if (totalYears >= 3 && totalYears < 5) {
            // First 3 years at 1/3
            const firstThreeYears = 3 * (21 / 3)
            // Remaining at 2/3
            const remainingYearsCount = totalYears - 3
            const remainingGratuity = remainingYearsCount * (21 * 2 / 3)
            gratuityDays = firstThreeYears + remainingGratuity
            breakdown.push(`First 3 years: 3 × 7 days = 21 days (1/3 of 21 days)`)
            breakdown.push(`Years 3-5: ${remainingYearsCount.toFixed(2)} × 14 days = ${remainingGratuity.toFixed(2)} days (2/3 of 21 days)`)
        } else if (totalYears >= 5) {
            // Full gratuity after 5 years
            const firstFiveYears = 5 * 21
            const afterFiveYears = (totalYears - 5) * 30
            gratuityDays = firstFiveYears + afterFiveYears
            breakdown.push(`First 5 years: 5 × 21 days = 105 days`)
            if (totalYears > 5) {
                breakdown.push(`Beyond 5 years: ${(totalYears - 5).toFixed(2)} × 30 days = ${afterFiveYears.toFixed(2)} days`)
            }
        }
    } else {
        // Termination by employer, end of contract, mutual agreement, death, retirement
        // OR resignation from limited contract after 5 years
        if (totalYears >= 1 && totalYears <= 5) {
            gratuityDays = 21 * totalYears
            breakdown.push(`1-5 years service: ${totalYears.toFixed(2)} years × 21 days = ${gratuityDays.toFixed(2)} days`)
        } else if (totalYears > 5) {
            const firstFiveYears = 5 * 21  // 105 days
            const afterFiveYears = (totalYears - 5) * 30
            gratuityDays = firstFiveYears + afterFiveYears
            breakdown.push(`First 5 years: 5 × 21 days = 105 days`)
            breakdown.push(`Beyond 5 years: ${(totalYears - 5).toFixed(2)} × 30 days = ${afterFiveYears.toFixed(2)} days`)
        }
    }

    // Calculate gratuity amount
    let gratuityAmount = gratuityDays * dailyBasic

    // Maximum gratuity cap: 2 years of total salary
    const maxGratuity = totalSalary * 24 // 2 years = 24 months
    if (gratuityAmount > maxGratuity) {
        breakdown.push(`Gratuity capped at 2 years salary: AED ${maxGratuity.toFixed(2)}`)
        gratuityAmount = maxGratuity
    }

    breakdown.push(`Daily basic salary: AED ${dailyBasic.toFixed(2)}`)
    breakdown.push(`Total gratuity days: ${gratuityDays.toFixed(2)}`)
    breakdown.push(`Gratuity amount: ${gratuityDays.toFixed(2)} days × AED ${dailyBasic.toFixed(2)} = AED ${gratuityAmount.toFixed(2)}`)

    return {
        totalYears: parseFloat(totalYears.toFixed(2)),
        totalMonths,
        totalDays: totalDaysServed,
        gratuityDays: parseFloat(gratuityDays.toFixed(2)),
        gratuityAmount: parseFloat(gratuityAmount.toFixed(2)),
        breakdown
    }
}

/**
 * Calculate Leave Encashment
 * Daily salary = Monthly Total Salary / 30
 */
export function calculateLeaveEncashment(params: {
    totalSalary: number
    pendingLeaveDays: number
}): number {
    const { totalSalary, pendingLeaveDays } = params
    const dailySalary = totalSalary / 30
    return parseFloat((dailySalary * pendingLeaveDays).toFixed(2))
}

/**
 * Calculate Notice Period Pay/Deduction
 */
export function calculateNoticePeriod(params: {
    totalSalary: number
    noticePeriodDays: number
    noticePeriodServed: number
}): {
    payable: number
    deductible: number
} {
    const { totalSalary, noticePeriodDays, noticePeriodServed } = params
    const dailySalary = totalSalary / 30
    const shortfall = noticePeriodDays - noticePeriodServed

    if (shortfall > 0) {
        // Employee didn't serve full notice - deduction applies
        return {
            payable: 0,
            deductible: parseFloat((dailySalary * shortfall).toFixed(2))
        }
    } else if (shortfall < 0) {
        // Employer asked to leave early - payment to employee
        return {
            payable: parseFloat((dailySalary * Math.abs(shortfall)).toFixed(2)),
            deductible: 0
        }
    }

    return { payable: 0, deductible: 0 }
}

/**
 * Generate Settlement Number
 */
export function generateSettlementNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `FS-${year}${month}-${random}`
}

/**
 * UAE Leave Entitlements
 */
export const UAE_LEAVE_ENTITLEMENTS = {
    ANNUAL: {
        name: 'Annual Leave',
        daysPerYear: 30, // After 1 year
        daysFirstYear: 2, // 2 days per month in first year
        isPaid: true,
        carryForward: true,
        maxCarryDays: 15
    },
    SICK: {
        name: 'Sick Leave',
        totalDays: 90,
        fullPayDays: 15,
        halfPayDays: 30,
        unpaidDays: 45,
        isPaid: true
    },
    MATERNITY: {
        name: 'Maternity Leave',
        totalDays: 60,
        fullPayDays: 45,
        halfPayDays: 15,
        isPaid: true
    },
    PATERNITY: {
        name: 'Paternity Leave',
        daysPerYear: 5,
        isPaid: true
    },
    HAJJ: {
        name: 'Hajj Leave',
        totalDays: 30,
        isPaid: false,
        onceDuringService: true
    },
    BEREAVEMENT: {
        name: 'Bereavement Leave',
        spouseDays: 5,
        parentChildDays: 3,
        isPaid: true
    },
    STUDY: {
        name: 'Study Leave',
        daysPerYear: 10,
        isPaid: false,
        requiresApproval: true
    }
}
