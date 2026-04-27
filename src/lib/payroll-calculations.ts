// Unified Payroll Calculations for UAE and India

import * as uaeCalc from './uae-calculations'
import * as indiaCalc from './india-calculations'

export type CountryCode = 'UAE' | 'IND'

/**
 * Calculate Gratuity based on country
 */
export function calculateGratuity(params: {
    country: CountryCode
    basicSalary: number
    totalSalary: number
    da?: number  // India only
    joiningDate: Date
    lastWorkingDate: Date
    terminationType: 'RESIGNATION' | 'TERMINATION' | 'END_OF_CONTRACT' | 'MUTUAL_AGREEMENT' | 'ABSCONDING' | 'DEATH' | 'RETIREMENT'
    contractType?: 'LIMITED' | 'UNLIMITED'  // UAE only
}) {
    const { country, basicSalary, totalSalary, da, joiningDate, lastWorkingDate, terminationType, contractType } = params

    if (country === 'UAE') {
        const uaeResult = uaeCalc.calculateGratuity({
            basicSalary,
            totalSalary,
            joiningDate,
            lastWorkingDate,
            terminationType,
            contractType: contractType || 'LIMITED'
        })
        return {
            country: 'UAE',
            currency: 'AED',
            ...uaeResult,
            gratuityEligible: uaeResult.gratuityAmount > 0
        }
    } else {
        const result = indiaCalc.calculateIndiaGratuity({
            basicSalary,
            da,
            joiningDate,
            lastWorkingDate,
            terminationType
        })
        return {
            country: 'IND',
            currency: 'INR',
            ...result,
            gratuityDays: 0  // India uses formula, not days
        }
    }
}

/**
 * Calculate Monthly Payroll based on country
 */
export function calculateMonthlyPayroll(params: {
    country: CountryCode
    employee: {
        // Common
        basicSalary: number
        // UAE specific
        housingAllowance?: number
        transportAllowance?: number
        foodAllowance?: number
        phoneAllowance?: number
        otherAllowance?: number
        // India specific
        da?: number
        hra?: number
        conveyanceAllowance?: number
        medicalAllowance?: number
        specialAllowance?: number
        lta?: number
        state?: string  // For professional tax
        taxRegime?: 'OLD' | 'NEW'
        deductions80C?: number
        deductions80D?: number
    }
    // Common
    overtimePay?: number
    bonus?: number
    leaveDeduction?: number
    loanDeduction?: number
    advanceDeduction?: number
    otherDeduction?: number
}) {
    const { country, employee, overtimePay = 0, bonus = 0, leaveDeduction = 0, loanDeduction = 0, advanceDeduction = 0, otherDeduction = 0 } = params

    if (country === 'UAE') {
        // UAE Payroll (No tax deductions)
        const grossEarnings =
            (employee.basicSalary || 0) +
            (employee.housingAllowance || 0) +
            (employee.transportAllowance || 0) +
            (employee.foodAllowance || 0) +
            (employee.phoneAllowance || 0) +
            (employee.otherAllowance || 0) +
            overtimePay +
            bonus

        const totalDeductions =
            leaveDeduction +
            loanDeduction +
            advanceDeduction +
            otherDeduction

        return {
            country: 'UAE',
            currency: 'AED',
            earnings: {
                basicSalary: employee.basicSalary || 0,
                housingAllowance: employee.housingAllowance || 0,
                transportAllowance: employee.transportAllowance || 0,
                foodAllowance: employee.foodAllowance || 0,
                phoneAllowance: employee.phoneAllowance || 0,
                otherAllowance: employee.otherAllowance || 0,
                overtimePay,
                bonus,
                grossEarnings
            },
            deductions: {
                leaveDeduction,
                loanDeduction,
                advanceDeduction,
                otherDeduction,
                totalDeductions
            },
            statutory: {
                pfEmployee: 0,
                pfEmployer: 0,
                esiEmployee: 0,
                esiEmployer: 0,
                professionalTax: 0,
                tds: 0
            },
            netSalary: grossEarnings - totalDeductions
        }
    } else {
        // India Payroll (With PF, ESI, TDS)
        const basic = employee.basicSalary || 0
        const da = employee.da || 0
        const hra = employee.hra || 0
        const conveyance = employee.conveyanceAllowance || 0
        const medical = employee.medicalAllowance || 0
        const special = employee.specialAllowance || 0
        const lta = employee.lta || 0

        const grossEarnings = basic + da + hra + conveyance + medical + special + lta + overtimePay + bonus

        // Calculate PF
        const pf = indiaCalc.calculatePF({ basicSalary: basic, da, useStatutoryLimit: true })

        // Calculate ESI
        const esi = indiaCalc.calculateESI(grossEarnings)

        // Calculate Professional Tax
        const professionalTax = indiaCalc.calculateProfessionalTax(grossEarnings, employee.state || 'KARNATAKA')

        // Calculate TDS (need annual income)
        const annualGross = grossEarnings * 12
        const tds = indiaCalc.calculateTDS({
            annualIncome: annualGross,
            regime: employee.taxRegime || 'NEW',
            deductions80C: employee.deductions80C,
            deductions80D: employee.deductions80D,
            hra
        })

        const statutoryDeductions = pf.employeeContribution + esi.employeeContribution + professionalTax + tds.monthlyTDS
        const otherDeductions = leaveDeduction + loanDeduction + advanceDeduction + otherDeduction
        const totalDeductions = statutoryDeductions + otherDeductions

        return {
            country: 'IND',
            currency: 'INR',
            earnings: {
                basicSalary: basic,
                da,
                hra,
                conveyanceAllowance: conveyance,
                medicalAllowance: medical,
                specialAllowance: special,
                lta,
                overtimePay,
                bonus,
                grossEarnings
            },
            deductions: {
                leaveDeduction,
                loanDeduction,
                advanceDeduction,
                otherDeduction,
                totalOtherDeductions: otherDeductions
            },
            statutory: {
                pfEmployee: pf.employeeContribution,
                pfEmployer: pf.employerContribution,
                esiEmployee: esi.employeeContribution,
                esiEmployer: esi.employerContribution,
                professionalTax,
                tds: tds.monthlyTDS,
                totalStatutory: statutoryDeductions
            },
            totalDeductions,
            netSalary: grossEarnings - totalDeductions
        }
    }
}

/**
 * Calculate Leave Encashment based on country
 */
export function calculateLeaveEncashment(params: {
    country: CountryCode
    basicSalary: number
    totalSalary: number
    da?: number
    pendingLeaveDays: number
}) {
    const { country, basicSalary, totalSalary, da, pendingLeaveDays } = params

    if (country === 'UAE') {
        // UAE: Based on total salary / 30
        return {
            currency: 'AED',
            amount: uaeCalc.calculateLeaveEncashment({ totalSalary, pendingLeaveDays })
        }
    } else {
        // India: Based on (basic + DA) / 26
        return {
            currency: 'INR',
            amount: indiaCalc.calculateIndiaLeaveEncashment({ basicSalary, da, pendingLeaveDays })
        }
    }
}

/**
 * Get Leave Entitlements based on country
 */
export function getLeaveEntitlements(country: CountryCode) {
    if (country === 'UAE') {
        return {
            country: 'UAE',
            entitlements: uaeCalc.UAE_LEAVE_ENTITLEMENTS
        }
    } else {
        return {
            country: 'IND',
            entitlements: indiaCalc.INDIA_LEAVE_ENTITLEMENTS
        }
    }
}

/**
 * Calculate Full & Final Settlement
 */
export function calculateSettlement(params: {
    country: CountryCode
    basicSalary: number
    totalSalary: number
    da?: number
    joiningDate: Date
    lastWorkingDate: Date
    terminationType: 'RESIGNATION' | 'TERMINATION' | 'END_OF_CONTRACT' | 'MUTUAL_AGREEMENT' | 'ABSCONDING' | 'DEATH' | 'RETIREMENT'
    contractType?: 'LIMITED' | 'UNLIMITED'
    pendingLeaveDays: number
    noticePeriodDays: number
    noticePeriodServed: number
    pendingSalary?: number
    bonus?: number
    loanBalance?: number
    advanceBalance?: number
    otherDeductions?: number
    // UAE specific
    airfareAllowance?: number
    // India specific
    pfBalance?: number
}) {
    const {
        country,
        basicSalary,
        totalSalary,
        da = 0,
        joiningDate,
        lastWorkingDate,
        terminationType,
        contractType,
        pendingLeaveDays,
        noticePeriodDays,
        noticePeriodServed,
        pendingSalary = 0,
        bonus = 0,
        loanBalance = 0,
        advanceBalance = 0,
        otherDeductions = 0,
        airfareAllowance = 0,
        pfBalance = 0
    } = params

    // Calculate gratuity
    const gratuity = calculateGratuity({
        country,
        basicSalary,
        totalSalary,
        da,
        joiningDate,
        lastWorkingDate,
        terminationType,
        contractType
    })

    // Calculate leave encashment
    const leaveEncashment = calculateLeaveEncashment({
        country,
        basicSalary,
        totalSalary,
        da,
        pendingLeaveDays
    })

    // Calculate notice period
    const noticePeriod = uaeCalc.calculateNoticePeriod({
        totalSalary,
        noticePeriodDays,
        noticePeriodServed
    })

    // Calculate totals
    let totalEarnings = 0
    let totalDeductionsAmount = 0

    if (country === 'UAE') {
        totalEarnings =
            gratuity.gratuityAmount +
            leaveEncashment.amount +
            noticePeriod.payable +
            pendingSalary +
            bonus +
            airfareAllowance

        totalDeductionsAmount =
            noticePeriod.deductible +
            loanBalance +
            advanceBalance +
            otherDeductions
    } else {
        totalEarnings =
            gratuity.gratuityAmount +
            leaveEncashment.amount +
            noticePeriod.payable +
            pendingSalary +
            bonus +
            pfBalance

        totalDeductionsAmount =
            noticePeriod.deductible +
            loanBalance +
            advanceBalance +
            otherDeductions
    }

    return {
        country,
        currency: country === 'UAE' ? 'AED' : 'INR',
        gratuity,
        leaveEncashment: {
            days: pendingLeaveDays,
            amount: leaveEncashment.amount
        },
        noticePeriod: {
            required: noticePeriodDays,
            served: noticePeriodServed,
            payable: noticePeriod.payable,
            deductible: noticePeriod.deductible
        },
        earnings: {
            gratuity: gratuity.gratuityAmount,
            leaveEncashment: leaveEncashment.amount,
            noticePeriodPay: noticePeriod.payable,
            pendingSalary,
            bonus,
            airfareAllowance: country === 'UAE' ? airfareAllowance : 0,
            pfBalance: country === 'IND' ? pfBalance : 0,
            total: totalEarnings
        },
        deductions: {
            noticePeriodDeduction: noticePeriod.deductible,
            loanBalance,
            advanceBalance,
            otherDeductions,
            total: totalDeductionsAmount
        },
        netSettlement: totalEarnings - totalDeductionsAmount
    }
}
