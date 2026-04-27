'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, FileSpreadsheet, Download, Eye, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Payslip {
    id: string
    month: number
    year: number
    basicSalary: number
    grossEarnings: number
    totalDeductions: number
    netSalary: number
    status: string
    employee: {
        id: string
        employeeId: string
        firstName: string
        lastName: string
        department?: { name: string }
        designation?: { name: string }
    }
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
}

export default function PayrollPage() {
    const [payslips, setPayslips] = useState<Payslip[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false)

    useEffect(() => {
        fetchPayslips()
    }, [selectedMonth, selectedYear])

    const fetchPayslips = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setPayslips(data)
            } else {
                setPayslips([])
            }
        } catch (error) {
            toast.error('Failed to fetch payslips')
            setPayslips([])
        } finally {
            setLoading(false)
        }
    }

    const handleGeneratePayroll = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/payroll/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month: selectedMonth, year: selectedYear })
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            toast.success(data.message)
            setGenerateDialogOpen(false)
            fetchPayslips()
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate payroll')
        } finally {
            setGenerating(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return `AED ${Number(amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
    }

    const totalNetSalary = payslips.reduce((sum, p) => sum + Number(p.netSalary), 0)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Payroll</h1>
                    <p className="text-muted-foreground">Manage employee salaries and payslips</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Generate Payroll
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Generate Payroll</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-muted-foreground mb-4">
                                    This will generate payslips for all active employees for the selected month.
                                    Existing payslips will be skipped.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Month</Label>
                                        <Select
                                            value={selectedMonth.toString()}
                                            onValueChange={(v) => setSelectedMonth(parseInt(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MONTHS.map((month, idx) => (
                                                    <SelectItem key={idx} value={(idx + 1).toString()}>
                                                        {month}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Year</Label>
                                        <Select
                                            value={selectedYear.toString()}
                                            onValueChange={(v) => setSelectedYear(parseInt(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[2024, 2025, 2026].map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleGeneratePayroll} disabled={generating}>
                                    {generating ? 'Generating...' : 'Generate'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Month</Label>
                            <Select
                                value={selectedMonth.toString()}
                                onValueChange={(v) => setSelectedMonth(parseInt(v))}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((month, idx) => (
                                        <SelectItem key={idx} value={(idx + 1).toString()}>
                                            {month}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Select
                                value={selectedYear.toString()}
                                onValueChange={(v) => setSelectedYear(parseInt(v))}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2024, 2025, 2026].map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" onClick={fetchPayslips}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Payslips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payslips.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Net Salary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalNetSalary)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Period
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {MONTHS[selectedMonth - 1]} {selectedYear}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Payslips Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Payslips - {MONTHS[selectedMonth - 1]} {selectedYear}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead className="text-right">Basic</TableHead>
                                <TableHead className="text-right">Gross</TableHead>
                                <TableHead className="text-right">Deductions</TableHead>
                                <TableHead className="text-right">Net Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : payslips.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        No payslips found for this period
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payslips.map((payslip) => (
                                    <TableRow key={payslip.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {payslip.employee.firstName} {payslip.employee.lastName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payslip.employee.employeeId}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{payslip.employee.department?.name || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(payslip.basicSalary)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(payslip.grossEarnings)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                            {formatCurrency(payslip.totalDeductions)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(payslip.netSalary)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[payslip.status]}>
                                                {payslip.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
