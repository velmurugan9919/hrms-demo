'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Calculator, FileText, Eye, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Settlement {
    id: string
    settlementNumber: string
    joiningDate: string
    lastWorkingDate: string
    totalServiceYears: number
    basicSalary: number
    totalSalary: number
    gratuityDays: number
    gratuityAmount: number
    leaveEncashment: number
    totalEarnings: number
    totalDeductions: number
    netSettlement: number
    status: string
    employee: {
        id: string
        employeeId: string
        firstName: string
        lastName: string
        department?: { name: string }
        designation?: { name: string }
        terminationType?: string
    }
}

interface Employee {
    id: string
    employeeId: string
    firstName: string
    lastName: string
    status: string
    terminationType?: string
}

interface CalculationResult {
    employee: any
    serviceDetails: any
    gratuity: any
    leaveEncashment: any
    noticePeriod: any
    earnings: any
    deductions: any
    summary: any
}

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    PAID: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
}

const TERMINATION_TYPES = [
    { value: 'RESIGNATION', label: 'Resignation' },
    { value: 'TERMINATION', label: 'Termination by Employer' },
    { value: 'END_OF_CONTRACT', label: 'End of Contract' },
    { value: 'MUTUAL_AGREEMENT', label: 'Mutual Agreement' },
    { value: 'ABSCONDING', label: 'Absconding' },
    { value: 'RETIREMENT', label: 'Retirement' }
]

export default function SettlementsPage() {
    const [settlements, setSettlements] = useState<Settlement[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [calculating, setCalculating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null)
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)

    const [formData, setFormData] = useState({
        employeeId: '',
        terminationType: '',
        lastWorkingDate: '',
        pendingLeaveDays: 0,
        noticePeriodServed: 0,
        airfareAllowance: 0,
        bonusOrIncentive: 0,
        otherPayments: 0,
        loanBalance: 0,
        advanceBalance: 0,
        otherDeductions: 0,
        remarks: ''
    })

    useEffect(() => {
        fetchSettlements()
        fetchEmployees()
    }, [])

    const fetchSettlements = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/settlements')
            const data = await res.json()
            if (Array.isArray(data)) {
                setSettlements(data)
            } else {
                setSettlements([])
            }
        } catch (error) {
            toast.error('Failed to fetch settlements')
            setSettlements([])
        } finally {
            setLoading(false)
        }
    }

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees')
            const data = await res.json()
            if (Array.isArray(data)) {
                // Filter terminated/resigned employees or all for settlement
                setEmployees(data)
            }
        } catch (error) {
            console.error('Failed to fetch employees')
        }
    }

    const handleCalculate = async () => {
        if (!formData.employeeId || !formData.lastWorkingDate) {
            toast.error('Please select employee and last working date')
            return
        }

        setCalculating(true)
        try {
            const res = await fetch('/api/settlements/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            setCalculationResult(data)
        } catch (error: any) {
            toast.error(error.message || 'Failed to calculate settlement')
        } finally {
            setCalculating(false)
        }
    }

    const handleSaveSettlement = async () => {
        if (!calculationResult) {
            toast.error('Please calculate settlement first')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/settlements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            toast.success('Settlement created successfully')
            setDialogOpen(false)
            resetForm()
            fetchSettlements()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save settlement')
        } finally {
            setSaving(false)
        }
    }

    const handleAction = async (id: string, action: string) => {
        try {
            const res = await fetch(`/api/settlements/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(`Settlement ${action.toLowerCase()}ed successfully`)
            fetchSettlements()
        } catch (error: any) {
            toast.error(error.message || 'Action failed')
        }
    }

    const resetForm = () => {
        setFormData({
            employeeId: '',
            terminationType: '',
            lastWorkingDate: '',
            pendingLeaveDays: 0,
            noticePeriodServed: 0,
            airfareAllowance: 0,
            bonusOrIncentive: 0,
            otherPayments: 0,
            loanBalance: 0,
            advanceBalance: 0,
            otherDeductions: 0,
            remarks: ''
        })
        setCalculationResult(null)
    }

    const formatCurrency = (amount: number) => {
        return `AED ${Number(amount).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Final Settlement</h1>
                    <p className="text-muted-foreground">UAE compliant employee final settlement calculator</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            New Settlement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>Calculate Final Settlement</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] pr-4">
                            <div className="space-y-6">
                                {/* Employee Selection */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Employee *</Label>
                                        <Select
                                            value={formData.employeeId}
                                            onValueChange={(v) => setFormData({ ...formData, employeeId: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {employees.map((emp) => (
                                                    <SelectItem key={emp.id} value={emp.id}>
                                                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Termination Type *</Label>
                                        <Select
                                            value={formData.terminationType}
                                            onValueChange={(v) => setFormData({ ...formData, terminationType: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TERMINATION_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Working Date *</Label>
                                        <Input
                                            type="date"
                                            value={formData.lastWorkingDate}
                                            onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Pending Leave Days</Label>
                                        <Input
                                            type="number"
                                            value={formData.pendingLeaveDays}
                                            onChange={(e) => setFormData({ ...formData, pendingLeaveDays: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Notice Period Served (Days)</Label>
                                        <Input
                                            type="number"
                                            value={formData.noticePeriodServed}
                                            onChange={(e) => setFormData({ ...formData, noticePeriodServed: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Airfare Allowance</Label>
                                        <Input
                                            type="number"
                                            value={formData.airfareAllowance}
                                            onChange={(e) => setFormData({ ...formData, airfareAllowance: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bonus/Incentive</Label>
                                        <Input
                                            type="number"
                                            value={formData.bonusOrIncentive}
                                            onChange={(e) => setFormData({ ...formData, bonusOrIncentive: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Other Payments</Label>
                                        <Input
                                            type="number"
                                            value={formData.otherPayments}
                                            onChange={(e) => setFormData({ ...formData, otherPayments: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Loan Balance</Label>
                                        <Input
                                            type="number"
                                            value={formData.loanBalance}
                                            onChange={(e) => setFormData({ ...formData, loanBalance: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Advance Balance</Label>
                                        <Input
                                            type="number"
                                            value={formData.advanceBalance}
                                            onChange={(e) => setFormData({ ...formData, advanceBalance: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Other Deductions</Label>
                                        <Input
                                            type="number"
                                            value={formData.otherDeductions}
                                            onChange={(e) => setFormData({ ...formData, otherDeductions: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <Button onClick={handleCalculate} disabled={calculating}>
                                        <Calculator className="h-4 w-4 mr-2" />
                                        {calculating ? 'Calculating...' : 'Calculate Settlement'}
                                    </Button>
                                </div>

                                {/* Calculation Result */}
                                {calculationResult && (
                                    <>
                                        <Separator />
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg">Settlement Calculation</h3>

                                            {/* Employee & Service Details */}
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Employee Details</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-muted-foreground">Name:</span>
                                                            <p className="font-medium">{calculationResult.employee.name}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Service:</span>
                                                            <p className="font-medium">
                                                                {calculationResult.serviceDetails.totalYears} years
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Basic Salary:</span>
                                                            <p className="font-medium">{formatCurrency(calculationResult.employee.basicSalary)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Total Salary:</span>
                                                            <p className="font-medium">{formatCurrency(calculationResult.employee.totalSalary)}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Gratuity Breakdown */}
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Gratuity Calculation (UAE Labor Law)</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        {calculationResult.gratuity.breakdown.map((line: string, idx: number) => (
                                                            <p key={idx} className="text-sm">{line}</p>
                                                        ))}
                                                    </div>
                                                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium">Total Gratuity:</span>
                                                            <span className="text-xl font-bold text-green-700">
                                                                {formatCurrency(calculationResult.gratuity.amount)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Summary */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm text-green-700">Earnings</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Gratuity</span>
                                                            <span>{formatCurrency(calculationResult.earnings.gratuity)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Leave Encashment ({calculationResult.leaveEncashment.days} days)</span>
                                                            <span>{formatCurrency(calculationResult.earnings.leaveEncashment)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Notice Period Payable</span>
                                                            <span>{formatCurrency(calculationResult.earnings.noticePeriodPayable)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Airfare</span>
                                                            <span>{formatCurrency(calculationResult.earnings.airfareAllowance)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Bonus/Incentive</span>
                                                            <span>{formatCurrency(calculationResult.earnings.bonusOrIncentive)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Other Payments</span>
                                                            <span>{formatCurrency(calculationResult.earnings.otherPayments)}</span>
                                                        </div>
                                                        <Separator />
                                                        <div className="flex justify-between font-bold">
                                                            <span>Total Earnings</span>
                                                            <span className="text-green-700">
                                                                {formatCurrency(calculationResult.summary.totalEarnings)}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm text-red-700">Deductions</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Notice Period Shortfall</span>
                                                            <span>{formatCurrency(calculationResult.deductions.noticePeriodDeduction)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Loan Balance</span>
                                                            <span>{formatCurrency(calculationResult.deductions.loanBalance)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Advance Balance</span>
                                                            <span>{formatCurrency(calculationResult.deductions.advanceBalance)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Other Deductions</span>
                                                            <span>{formatCurrency(calculationResult.deductions.otherDeductions)}</span>
                                                        </div>
                                                        <Separator />
                                                        <div className="flex justify-between font-bold">
                                                            <span>Total Deductions</span>
                                                            <span className="text-red-700">
                                                                {formatCurrency(calculationResult.summary.totalDeductions)}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Net Settlement */}
                                            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                                <CardContent className="py-6">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xl font-medium">Net Settlement Amount</span>
                                                        <span className="text-3xl font-bold">
                                                            {formatCurrency(calculationResult.summary.netSettlement)}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                        {calculationResult && (
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleSaveSettlement} disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Settlement'}
                                </Button>
                            </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Settlements Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Settlement Records
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Settlement #</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Last Working Day</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead className="text-right">Gratuity</TableHead>
                                <TableHead className="text-right">Net Settlement</TableHead>
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
                            ) : settlements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10">
                                        No settlements found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                settlements.map((settlement) => (
                                    <TableRow key={settlement.id}>
                                        <TableCell className="font-medium">{settlement.settlementNumber}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {settlement.employee.firstName} {settlement.employee.lastName}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {settlement.employee.employeeId}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(settlement.lastWorkingDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {settlement.totalServiceYears} years
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(settlement.gratuityAmount)}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(settlement.netSettlement)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[settlement.status]}>
                                                {settlement.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedSettlement(settlement)
                                                        setViewDialogOpen(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {settlement.status === 'DRAFT' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleAction(settlement.id, 'SUBMIT')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                )}
                                                {settlement.status === 'PENDING_APPROVAL' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleAction(settlement.id, 'APPROVE')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                )}
                                            </div>
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
