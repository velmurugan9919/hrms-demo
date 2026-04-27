'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface LeaveRequest {
    id: string
    startDate: string
    endDate: string
    totalDays: number
    reason?: string
    status: string
    leaveType: { id: string; name: string }
    teamLeaderStatus: string
    managerStatus: string
    hrStatus: string
    createdAt: string
}

interface LeaveType {
    id: string
    name: string
    daysPerYear: number
}

interface LeaveBalance {
    id: string
    totalDays: number
    usedDays: number
    leaveType: { id: string; name: string }
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    TL_APPROVED: 'bg-blue-100 text-blue-800',
    MANAGER_APPROVED: 'bg-indigo-100 text-indigo-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800'
}

export default function MyLeavesPage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const [formData, setFormData] = useState({
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: ''
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [requestsRes, typesRes, balancesRes] = await Promise.all([
                fetch('/api/portal/leaves'),
                fetch('/api/leave-types'),
                fetch('/api/portal/leave-balance')
            ])

            const requests = await requestsRes.json()
            const types = await typesRes.json()
            const balances = await balancesRes.json()

            if (Array.isArray(requests)) setLeaveRequests(requests)
            if (Array.isArray(types)) setLeaveTypes(types)
            if (Array.isArray(balances)) setLeaveBalances(balances)
        } catch (error) {
            toast.error('Failed to fetch data')
        } finally {
            setLoading(false)
        }
    }

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0
        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        return diff > 0 ? diff : 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const totalDays = calculateDays()

            if (totalDays <= 0) {
                toast.error('Invalid date range')
                return
            }

            const res = await fetch('/api/portal/leaves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, totalDays })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error)
            }

            toast.success('Leave request submitted successfully')
            setDialogOpen(false)
            resetForm()
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit leave request')
        } finally {
            setSubmitting(false)
        }
    }

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this leave request?')) return

        try {
            const res = await fetch(`/api/portal/leaves/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'CANCEL' })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success('Leave request cancelled')
            fetchData()
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel leave request')
        }
    }

    const resetForm = () => {
        setFormData({
            leaveTypeId: '',
            startDate: '',
            endDate: '',
            reason: ''
        })
    }

    const getBalance = (leaveTypeId: string) => {
        const balance = leaveBalances.find(b => b.leaveType.id === leaveTypeId)
        if (!balance) return null
        return balance.totalDays - balance.usedDays
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Leaves</h1>
                    <p className="text-muted-foreground">Apply for leave and track your requests</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Apply Leave
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apply for Leave</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Leave Type *</Label>
                                <Select
                                    value={formData.leaveTypeId}
                                    onValueChange={(v) => setFormData({ ...formData, leaveTypeId: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name} ({getBalance(type.id) ?? type.daysPerYear} days available)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date *</Label>
                                    <Input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>
                            {formData.startDate && formData.endDate && (
                                <div className="p-3 bg-muted rounded-lg text-center">
                                    <span className="font-medium">Total Days: {calculateDays()}</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Reason</Label>
                                <Textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Enter reason for leave..."
                                    rows={3}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Leave Balances */}
            <div className="grid gap-4 md:grid-cols-4">
                {leaveBalances.map((balance) => (
                    <Card key={balance.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">{balance.leaveType.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{balance.totalDays - balance.usedDays}</div>
                            <p className="text-xs text-muted-foreground">
                                of {balance.totalDays} days ({balance.usedDays} used)
                            </p>
                            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${((balance.totalDays - balance.usedDays) / balance.totalDays) * 100}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Leave Requests */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Leave Requests
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approval Status</TableHead>
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
                            ) : leaveRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        No leave requests found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leaveRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">{request.leaveType.name}</TableCell>
                                        <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{request.totalDays}</TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[request.status]}>
                                                {request.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span title="Team Leader" className={`w-2 h-2 rounded-full ${
                                                    request.teamLeaderStatus === 'APPROVED' ? 'bg-green-500' :
                                                    request.teamLeaderStatus === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                                <span title="Manager" className={`w-2 h-2 rounded-full ${
                                                    request.managerStatus === 'APPROVED' ? 'bg-green-500' :
                                                    request.managerStatus === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                                <span title="HR" className={`w-2 h-2 rounded-full ${
                                                    request.hrStatus === 'APPROVED' ? 'bg-green-500' :
                                                    request.hrStatus === 'REJECTED' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {request.status === 'PENDING' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => handleCancel(request.id)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            )}
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
