'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Eye, Printer } from 'lucide-react'
import { toast } from 'sonner'

interface Payslip {
    id: string
    month: number
    year: number
    basicSalary: number
    housingAllowance: number
    transportAllowance: number
    foodAllowance: number
    phoneAllowance: number
    otherAllowance: number
    overtimePay: number
    bonus: number
    grossEarnings: number
    leaveDeduction: number
    loanDeduction: number
    advanceDeduction: number
    otherDeduction: number
    totalDeductions: number
    netSalary: number
    status: string
    paidAt?: string
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800'
}

export default function MyPayslipsPage() {
    const [payslips, setPayslips] = useState<Payslip[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [employee, setEmployee] = useState<any>(null)

    useEffect(() => {
        fetchPayslips()
    }, [])

    const fetchPayslips = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/portal/payslips')
            const data = await res.json()
            if (data.payslips) {
                setPayslips(data.payslips)
                setEmployee(data.employee)
            }
        } catch (error) {
            toast.error('Failed to fetch payslips')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return `AED ${Number(amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = (payslip: Payslip) => {
        // Create downloadable content
        const content = `
PAYSLIP
=======
${MONTHS[payslip.month - 1]} ${payslip.year}

Employee: ${employee?.firstName} ${employee?.lastName}
Employee ID: ${employee?.employeeId}
Department: ${employee?.department?.name || '-'}
Designation: ${employee?.designation?.name || '-'}

EARNINGS
--------
Basic Salary: ${formatCurrency(payslip.basicSalary)}
Housing Allowance: ${formatCurrency(payslip.housingAllowance)}
Transport Allowance: ${formatCurrency(payslip.transportAllowance)}
Food Allowance: ${formatCurrency(payslip.foodAllowance)}
Phone Allowance: ${formatCurrency(payslip.phoneAllowance)}
Other Allowance: ${formatCurrency(payslip.otherAllowance)}
Overtime Pay: ${formatCurrency(payslip.overtimePay)}
Bonus: ${formatCurrency(payslip.bonus)}
--------
Gross Earnings: ${formatCurrency(payslip.grossEarnings)}

DEDUCTIONS
----------
Leave Deduction: ${formatCurrency(payslip.leaveDeduction)}
Loan Deduction: ${formatCurrency(payslip.loanDeduction)}
Advance Deduction: ${formatCurrency(payslip.advanceDeduction)}
Other Deduction: ${formatCurrency(payslip.otherDeduction)}
----------
Total Deductions: ${formatCurrency(payslip.totalDeductions)}

========
NET SALARY: ${formatCurrency(payslip.netSalary)}
========
        `

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Payslip_${MONTHS[payslip.month - 1]}_${payslip.year}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Payslip downloaded')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Payslips</h1>
                <p className="text-muted-foreground">View and download your salary slips</p>
            </div>

            {/* Payslips Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Payslip History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead className="text-right">Basic Salary</TableHead>
                                <TableHead className="text-right">Gross Earnings</TableHead>
                                <TableHead className="text-right">Deductions</TableHead>
                                <TableHead className="text-right">Net Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : payslips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        No payslips found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payslips.map((payslip) => (
                                    <TableRow key={payslip.id}>
                                        <TableCell className="font-medium">
                                            {MONTHS[payslip.month - 1]} {payslip.year}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(payslip.basicSalary)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(payslip.grossEarnings)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {formatCurrency(payslip.totalDeductions)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(payslip.netSalary)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[payslip.status]}>
                                                {payslip.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedPayslip(payslip)
                                                        setViewDialogOpen(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(payslip)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Payslip Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Payslip - {selectedPayslip && `${MONTHS[selectedPayslip.month - 1]} ${selectedPayslip.year}`}</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <Printer className="h-4 w-4 mr-1" />
                                    Print
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => selectedPayslip && handleDownload(selectedPayslip)}>
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedPayslip && employee && (
                        <div className="space-y-6 print:p-8" id="payslip-content">
                            {/* Company Header */}
                            <div className="text-center border-b pb-4">
                                <h2 className="text-2xl font-bold">PAYSLIP</h2>
                                <p className="text-muted-foreground">{MONTHS[selectedPayslip.month - 1]} {selectedPayslip.year}</p>
                            </div>

                            {/* Employee Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Employee Name</p>
                                    <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Employee ID</p>
                                    <p className="font-medium">{employee.employeeId}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Department</p>
                                    <p className="font-medium">{employee.department?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Designation</p>
                                    <p className="font-medium">{employee.designation?.name || '-'}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Earnings & Deductions */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Earnings */}
                                <div>
                                    <h3 className="font-semibold text-green-700 mb-3">Earnings</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Basic Salary</span>
                                            <span>{formatCurrency(selectedPayslip.basicSalary)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Housing Allowance</span>
                                            <span>{formatCurrency(selectedPayslip.housingAllowance)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Transport Allowance</span>
                                            <span>{formatCurrency(selectedPayslip.transportAllowance)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Food Allowance</span>
                                            <span>{formatCurrency(selectedPayslip.foodAllowance)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phone Allowance</span>
                                            <span>{formatCurrency(selectedPayslip.phoneAllowance)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Other Allowance</span>
                                            <span>{formatCurrency(selectedPayslip.otherAllowance)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Overtime Pay</span>
                                            <span>{formatCurrency(selectedPayslip.overtimePay)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Bonus</span>
                                            <span>{formatCurrency(selectedPayslip.bonus)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold">
                                            <span>Gross Earnings</span>
                                            <span className="text-green-700">{formatCurrency(selectedPayslip.grossEarnings)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div>
                                    <h3 className="font-semibold text-red-700 mb-3">Deductions</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Leave Deduction</span>
                                            <span>{formatCurrency(selectedPayslip.leaveDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Loan Deduction</span>
                                            <span>{formatCurrency(selectedPayslip.loanDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Advance Deduction</span>
                                            <span>{formatCurrency(selectedPayslip.advanceDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Other Deduction</span>
                                            <span>{formatCurrency(selectedPayslip.otherDeduction)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between font-bold">
                                            <span>Total Deductions</span>
                                            <span className="text-red-700">{formatCurrency(selectedPayslip.totalDeductions)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Net Salary */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-medium">Net Salary</span>
                                    <span className="text-2xl font-bold">{formatCurrency(selectedPayslip.netSalary)}</span>
                                </div>
                            </div>

                            {selectedPayslip.paidAt && (
                                <p className="text-center text-sm text-muted-foreground">
                                    Paid on: {new Date(selectedPayslip.paidAt).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
