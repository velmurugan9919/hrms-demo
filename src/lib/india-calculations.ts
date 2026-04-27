// India Labor Law Calculations

/**
 * Calculate Gratuity as per India Payment of Gratuity Act, 1972
 *
 * Eligibility: Minimum 5 years of continuous service
 * Formula: (15 × Last Drawn Salary × Years of Service) / 26
 *
 * Last Drawn Salary = Basic + Dearness Allowance (DA)
 * Maximum Gratuity: INR 20,00,000 (20 Lakhs) - as per 2019 amendment
 */
export function calculateIndiaGratuity(params: {
    basicSalary: number  // Monthly basic salary
    da?: number          // Dearness Allowance (if applicable)
    joiningDate: Date
    lastWorkingDate: Date
    terminationType: 'RESIGNATION' | 'TERMINATION' | 'END_OF_CONTRACT' | 'MUTUAL_AGREEMENT' | 'ABSCONDING' | 'RETIREMENT' | 'DEATH'
}): {
    totalYears: number
    totalMonths: number
    totalDays: number
    gratuityEligible: boolean
    gratuityAmount: number
    breakdown: string[]
} {
    const { basicSalary, da = 0, joiningDate, lastWorkingDate, terminationType } = params

    // Calculate service duration
    const startDate = new Date(joiningDate)
    const endDate = new Date(lastWorkingDate)

    const diffTime = endDate.getTime() - startDate.getTime()
    const totalDaysServed = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    const totalYears = totalDaysServed / 365
    const completedYears = Math.floor(totalYears)
    const remainingMonths = Math.floor((totalDaysServed % 365) / 30)
    const totalMonths = Math.floor(totalDaysServed / 30.44)

    const breakdown: string[] = []

    // Check for 5 years minimum (with 6+ months rounding up)
    // If remaining months >= 6, count as an additional year
    const yearsForCalculation = remainingMonths >= 6 ? completedYears + 1 : completedYears
    const gratuityEligible = yearsForCalculation >= 5 || terminationType === 'DEATH'

    if (!gratuityEligible) {
        breakdown.push('Service less than 5 years - No gratuity applicable under Indian law')
        breakdown.push('Note: Death case is exempt from 5-year requirement')
        return {
            totalYears: parseFloat(totalYears.toFixed(2)),
            totalMonths,
            totalDays: totalDaysServed,
            gratuityEligible: false,
            gratuityAmount: 0,
            breakdown
        }
    }

    // No gratuity for absconding employees
    if (terminationType === 'ABSCONDING') {
        breakdown.push('Employee absconded - No gratuity applicable')
        return {
            totalYears: parseFloat(totalYears.toFixed(2)),
            totalMonths,
            totalDays: totalDaysServed,
            gratuityEligible: false,
            gratuityAmount: 0,
            breakdown
        }
    }

    // Last drawn salary (Basic + DA)
    const lastDrawnSalary = basicSalary + da
    breakdown.push(`Last Drawn Salary (Basic + DA): INR ${lastDrawnSalary.toLocaleString('en-IN')}`)

    // Formula: (15 × Last Drawn Salary × Years of Service) / 26
    const gratuityAmount = (15 * lastDrawnSalary * yearsForCalculation) / 26
    breakdown.push(`Formula: (15 × ${lastDrawnSalary.toLocaleString('en-IN')} × ${yearsForCalculation}) / 26`)
    breakdown.push(`Calculated Amount: INR ${gratuityAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`)

    // Maximum cap: INR 20,00,000
    const maxGratuity = 2000000
    let finalAmount = gratuityAmount
    if (gratuityAmount > maxGratuity) {
        finalAmount = maxGratuity
        breakdown.push(`Gratuity capped at maximum: INR ${maxGratuity.toLocaleString('en-IN')}`)
    }

    breakdown.push(`Years of Service for calculation: ${yearsForCalculation} years`)
    breakdown.push(`Final Gratuity Amount: INR ${finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`)

    return {
        totalYears: parseFloat(totalYears.toFixed(2)),
        totalMonths,
        totalDays: totalDaysServed,
        gratuityEligible: true,
        gratuityAmount: parseFloat(finalAmount.toFixed(2)),
        breakdown
    }
}

/**
 * Calculate Provident Fund (PF) contribution
 * Employee: 12% of Basic + DA (capped at INR 15,000 for statutory limit)
 * Employer: 12% of Basic + DA (split into EPF 3.67% + EPS 8.33%)
 */
export function calculatePF(params: {
    basicSalary: number
    da?: number
    useStatutoryLimit?: boolean  // If true, cap at INR 15,000
}): {
    employeeContribution: number
    employerEPF: number
    employerEPS: number
    employerContribution: number
    total: number
} {
    const { basicSalary, da = 0, useStatutoryLimit = false } = params

    let pfWage = basicSalary + da

    // Statutory limit is INR 15,000
    if (useStatutoryLimit && pfWage > 15000) {
        pfWage = 15000
    }

    const employeeContribution = pfWage * 0.12
    const employerEPF = pfWage * 0.0367  // 3.67% to EPF
    const employerEPS = pfWage * 0.0833  // 8.33% to EPS (max INR 1250)

    // EPS contribution capped at INR 1250 (8.33% of 15000)
    const epsMax = 1250
    const actualEPS = Math.min(employerEPS, epsMax)
    const actualEPF = employerEPF + (employerEPS - actualEPS)

    const employerContribution = actualEPF + actualEPS

    return {
        employeeContribution: parseFloat(employeeContribution.toFixed(2)),
        employerEPF: parseFloat(actualEPF.toFixed(2)),
        employerEPS: parseFloat(actualEPS.toFixed(2)),
        employerContribution: parseFloat(employerContribution.toFixed(2)),
        total: parseFloat((employeeContribution + employerContribution).toFixed(2))
    }
}

/**
 * Calculate ESI (Employee State Insurance)
 * Applicable if gross salary <= INR 21,000
 * Employee: 0.75%
 * Employer: 3.25%
 */
export function calculateESI(grossSalary: number): {
    applicable: boolean
    employeeContribution: number
    employerContribution: number
    total: number
} {
    const ESI_LIMIT = 21000

    if (grossSalary > ESI_LIMIT) {
        return {
            applicable: false,
            employeeContribution: 0,
            employerContribution: 0,
            total: 0
        }
    }

    const employeeContribution = grossSalary * 0.0075
    const employerContribution = grossSalary * 0.0325

    return {
        applicable: true,
        employeeContribution: parseFloat(employeeContribution.toFixed(2)),
        employerContribution: parseFloat(employerContribution.toFixed(2)),
        total: parseFloat((employeeContribution + employerContribution).toFixed(2))
    }
}

/**
 * Calculate Professional Tax (State-specific)
 * Example: Karnataka slabs
 */
export function calculateProfessionalTax(
    grossSalary: number,
    state: string = 'KARNATAKA'
): number {
    // Karnataka Professional Tax slabs
    if (state === 'KARNATAKA') {
        if (grossSalary <= 15000) return 0
        if (grossSalary > 15000) return 200
    }

    // Maharashtra Professional Tax slabs
    if (state === 'MAHARASHTRA') {
        if (grossSalary <= 7500) return 0
        if (grossSalary <= 10000) return 175
        if (grossSalary > 10000) return 200 // 300 for Feb
    }

    // Tamil Nadu Professional Tax
    if (state === 'TAMIL_NADU') {
        if (grossSalary <= 3500) return 0
        if (grossSalary <= 5000) return 16.5
        if (grossSalary <= 7500) return 39
        if (grossSalary <= 10000) return 73
        if (grossSalary <= 12500) return 122
        if (grossSalary > 12500) return 182
    }

    // Default (no PT)
    return 0
}

/**
 * Calculate TDS (Tax Deducted at Source) based on Income Tax Slabs
 * FY 2024-25 (AY 2025-26) - New Tax Regime
 */
export function calculateTDS(params: {
    annualIncome: number
    regime: 'OLD' | 'NEW'
    deductions80C?: number  // Only for old regime
    deductions80D?: number  // Only for old regime
    hra?: number           // Only for old regime
}): {
    taxableIncome: number
    annualTax: number
    monthlyTDS: number
    breakdown: string[]
} {
    const { annualIncome, regime, deductions80C = 0, deductions80D = 0, hra = 0 } = params
    const breakdown: string[] = []

    let taxableIncome = annualIncome

    if (regime === 'OLD') {
        // Standard deduction
        const standardDeduction = 50000
        taxableIncome -= standardDeduction
        breakdown.push(`Standard Deduction: INR ${standardDeduction.toLocaleString('en-IN')}`)

        // 80C deductions (max 1.5L)
        const actual80C = Math.min(deductions80C, 150000)
        taxableIncome -= actual80C
        breakdown.push(`80C Deductions: INR ${actual80C.toLocaleString('en-IN')}`)

        // 80D deductions (max 25K for self, 50K for senior citizen)
        const actual80D = Math.min(deductions80D, 25000)
        taxableIncome -= actual80D
        breakdown.push(`80D Deductions: INR ${actual80D.toLocaleString('en-IN')}`)

        // HRA exemption
        if (hra > 0) {
            taxableIncome -= hra
            breakdown.push(`HRA Exemption: INR ${hra.toLocaleString('en-IN')}`)
        }

        taxableIncome = Math.max(0, taxableIncome)
        breakdown.push(`Taxable Income (Old Regime): INR ${taxableIncome.toLocaleString('en-IN')}`)

        // Old regime slabs
        let tax = 0
        if (taxableIncome > 1000000) {
            tax += (taxableIncome - 1000000) * 0.30
            taxableIncome = 1000000
        }
        if (taxableIncome > 500000) {
            tax += (taxableIncome - 500000) * 0.20
            taxableIncome = 500000
        }
        if (taxableIncome > 250000) {
            tax += (taxableIncome - 250000) * 0.05
        }

        // Rebate u/s 87A (if taxable income <= 5L)
        if (annualIncome <= 500000 && tax <= 12500) {
            tax = 0
            breakdown.push('Rebate u/s 87A applied')
        }

        // Add cess 4%
        const cess = tax * 0.04
        const totalTax = tax + cess

        breakdown.push(`Tax: INR ${tax.toLocaleString('en-IN')}`)
        breakdown.push(`Cess (4%): INR ${cess.toLocaleString('en-IN')}`)

        return {
            taxableIncome: annualIncome,
            annualTax: parseFloat(totalTax.toFixed(2)),
            monthlyTDS: parseFloat((totalTax / 12).toFixed(2)),
            breakdown
        }
    } else {
        // New Regime (FY 2024-25)
        const standardDeduction = 75000 // Updated for FY 2024-25
        taxableIncome -= standardDeduction
        breakdown.push(`Standard Deduction (New Regime): INR ${standardDeduction.toLocaleString('en-IN')}`)

        taxableIncome = Math.max(0, taxableIncome)
        breakdown.push(`Taxable Income (New Regime): INR ${taxableIncome.toLocaleString('en-IN')}`)

        // New regime slabs (FY 2024-25)
        let tax = 0
        let remainingIncome = taxableIncome

        // 0-3L: 0%
        // 3-7L: 5%
        // 7-10L: 10%
        // 10-12L: 15%
        // 12-15L: 20%
        // 15L+: 30%

        if (remainingIncome > 1500000) {
            tax += (remainingIncome - 1500000) * 0.30
            remainingIncome = 1500000
        }
        if (remainingIncome > 1200000) {
            tax += (remainingIncome - 1200000) * 0.20
            remainingIncome = 1200000
        }
        if (remainingIncome > 1000000) {
            tax += (remainingIncome - 1000000) * 0.15
            remainingIncome = 1000000
        }
        if (remainingIncome > 700000) {
            tax += (remainingIncome - 700000) * 0.10
            remainingIncome = 700000
        }
        if (remainingIncome > 300000) {
            tax += (remainingIncome - 300000) * 0.05
        }

        // Rebate u/s 87A (if taxable income <= 7L under new regime)
        if (taxableIncome <= 700000) {
            const rebate = Math.min(tax, 25000)
            tax -= rebate
            breakdown.push(`Rebate u/s 87A: INR ${rebate.toLocaleString('en-IN')}`)
        }

        // Add cess 4%
        const cess = tax * 0.04
        const totalTax = tax + cess

        breakdown.push(`Tax: INR ${tax.toLocaleString('en-IN')}`)
        breakdown.push(`Cess (4%): INR ${cess.toLocaleString('en-IN')}`)

        return {
            taxableIncome: annualIncome - standardDeduction,
            annualTax: parseFloat(totalTax.toFixed(2)),
            monthlyTDS: parseFloat((totalTax / 12).toFixed(2)),
            breakdown
        }
    }
}

/**
 * India Leave Entitlements (varies by state - using typical values)
 */
export const INDIA_LEAVE_ENTITLEMENTS = {
    EARNED_LEAVE: {
        name: 'Earned Leave / Privilege Leave',
        daysPerYear: 15,  // Typically 15-21 days
        isPaid: true,
        carryForward: true,
        maxCarryDays: 30,
        accumulationLimit: 60
    },
    CASUAL_LEAVE: {
        name: 'Casual Leave',
        daysPerYear: 12,
        isPaid: true,
        carryForward: false
    },
    SICK_LEAVE: {
        name: 'Sick Leave',
        daysPerYear: 12,
        isPaid: true,
        carryForward: false,
        requiresMedicalCertificate: true,
        certificateRequiredAfterDays: 2
    },
    MATERNITY: {
        name: 'Maternity Leave',
        totalDays: 182,  // 26 weeks as per Maternity Benefit Act
        isPaid: true,
        eligibility: 'Worked for 80 days in preceding 12 months'
    },
    PATERNITY: {
        name: 'Paternity Leave',
        totalDays: 15,  // For central govt; private sector varies
        isPaid: true
    },
    BEREAVEMENT: {
        name: 'Bereavement Leave',
        totalDays: 5,
        isPaid: true
    },
    MARRIAGE: {
        name: 'Marriage Leave',
        totalDays: 3,
        isPaid: true
    },
    COMPENSATORY_OFF: {
        name: 'Compensatory Off',
        description: 'For working on holidays/weekends',
        isPaid: true
    }
}

/**
 * Calculate Leave Encashment (India)
 * Typically encashed on resignation/retirement
 */
export function calculateIndiaLeaveEncashment(params: {
    basicSalary: number
    da?: number
    pendingLeaveDays: number
}): number {
    const { basicSalary, da = 0, pendingLeaveDays } = params
    const lastDrawnSalary = basicSalary + da
    const dailySalary = lastDrawnSalary / 26  // India uses 26 days
    return parseFloat((dailySalary * pendingLeaveDays).toFixed(2))
}

/**
 * India Salary Components breakdown
 */
export interface IndiaSalaryStructure {
    basic: number          // 40-50% of CTC
    hra: number           // 40-50% of basic
    conveyance: number    // Fixed (usually 1600)
    medical: number       // Fixed (usually 1250)
    special: number       // Balancing component
    lta: number           // Leave Travel Allowance
    pf: number            // 12% of basic (employer)
    gratuity: number      // 4.81% of basic
    insurance: number     // Group insurance
}

/**
 * Calculate CTC breakdown
 */
export function calculateCTCBreakdown(annualCTC: number): IndiaSalaryStructure {
    const monthlyCTC = annualCTC / 12

    // Standard breakdown
    const basic = monthlyCTC * 0.40          // 40% of CTC
    const hra = basic * 0.50                 // 50% of basic
    const conveyance = 1600
    const medical = 1250
    const lta = basic * 0.0833               // ~1 month basic per year / 12
    const pf = Math.min(basic, 15000) * 0.12 // Employer PF
    const gratuityProvision = basic * 0.0481 // 4.81% of basic
    const insurance = 500
    const special = monthlyCTC - basic - hra - conveyance - medical - lta - pf - gratuityProvision - insurance

    return {
        basic: parseFloat(basic.toFixed(2)),
        hra: parseFloat(hra.toFixed(2)),
        conveyance,
        medical,
        special: parseFloat(Math.max(0, special).toFixed(2)),
        lta: parseFloat(lta.toFixed(2)),
        pf: parseFloat(pf.toFixed(2)),
        gratuity: parseFloat(gratuityProvision.toFixed(2)),
        insurance
    }
}
