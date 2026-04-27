'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Check, X, Calendar, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface LeaveRequest {
    id: string
    startDate: string
    endDate: string
    totalDays: number
    reason?: string
    status: string
    teamLeaderStatus: string
    teamLeaderApprovedBy?: string
    teamLeaderApprovedAt?: string
    teamLeaderRemarks?: string
    managerStatus: string
    managerApprovedBy?: string
    managerApprovedAt?: string
    managerRemarks?: string
    hrStatus: string
    hrApprovedBy?: string
    hrApprovedAt?: string
    hrRemarks?: string
    rejectedReason?: string
    employee: {
        id: string
        employeeId: string
        firstName: string
        lastName: string
        department?: { name: string }
    }
    leaveType: {
        id: string
        name: string
    }
}

interface LeaveType {
    id: string
    name: string
    description?: string
    daysPerYear: number
    isPaid: boolean
}

interface Employee {
    id: string
    employeeId: string
    firstName: string
    lastName: string
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    TL_APPROVED: 'bg-blue-100 text-blue-800',
    MANAGER_APPROVED: 'bg-purple-100 text-purple-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
}

const approvalStatusColors: Record<string, string> = {
    PENDING: 'text-yellow-600',
    APPROVED: 'text-green-600',
    REJECTED: 'text-red-600',
}

const ApprovalIcon = ({ status }: { status: string }) => {
    if (status === 'APPROVED') return <CheckCircle2 className="h-4 w-4 text-green-600" />
    if (status === 'REJECTED') return <XCircle className="h-4 w-4 text-red-600" />
    return <Clock className="h-4 w-4 text-yellow-600" />
}

export default function LeavePage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
    const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [approvalLevel, setApprovalLevel] = useState<string>('')
    const [approvalAction, setApprovalAction] = useState<string>('')
    const [approvalRemarks, setApprovalRemarks] = useState('')
    const [formData, setFormData] = useState({
        employeeId: '',
        leaveTypeId: '',
        startDate: '',
        endDate: '',
        reason: ''
    })
    const [typeFormData, setTypeFormData] = useState({
        name: '',
        description: '',
        daysPerYear: '',
        isPaid: true
    })

    useEffect(() => {
        fetchLeaveRequests()
        fetchLeaveTypes()
        fetchEmployees()
    }, [statusFilter])

    const fetchLeaveRequests = async () => {
        try {
            const url = statusFilter === 'all'
                ? '/api/leave-requests'
                : `/api/leave-requests?status=${statusFilter}`
            const res = await fetch(url)
            const data = await res.json()
            if (Array.isArray(data)) {
                setLeaveRequests(data)
            } else {
                setLeaveRequests([])
            }
        } catch (error) {
            toast.error('Failed to fetch leave requests')
            setLeaveRequests([])
        } finally {
            setLoading(false)
        }
    }

    const fetchLeaveTypes = async () => {
        try {
            const res = await fetch('/api/leave-types')
            const data = await res.json()
            if (Array.isArray(data)) {
                setLeaveTypes(data)
            } else {
                setLeaveTypes([])
            }
        } catch (error) {
            console.error('Failed to fetch leave types')
        }
    }

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees')
            const data = await res.json()
            if (Array.isArray(data)) {
                setEmployees(data.filter((e: any) => e.status === 'ACTIVE'))
            } else {
                setEmployees([])
            }
        } catch (error) {
            console.error('Failed to fetch employees')
            setEmployees([])
        }
    }

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/leave-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success('Leave request submitted')
            setIsRequestDialogOpen(false)
            resetForm()
            fetchLeaveRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit leave request')
        }
    }

    const handleSubmitType = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/leave-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...typeFormData,
                    daysPerYear: parseInt(typeFormData.daysPerYear) || 0
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success('Leave type created')
            setIsTypeDialogOpen(false)
            setTypeFormData({ name: '', description: '', daysPerYear: '', isPaid: true })
            fetchLeaveTypes()
        } catch (error: any) {
            toast.error(error.message || 'Failed to create leave type')
        }
    }

    const handleApprovalSubmit = async () => {
        if (!selectedRequest || !approvalLevel || !approvalAction) return

        try {
            const res = await fetch(`/api/leave-requests/${selectedRequest.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    approvalLevel,
                    action: approvalAction,
                    remarks: approvalRemarks
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(`Leave request ${approvalAction.toLowerCase()} by ${approvalLevel.replace('_', ' ')}`)
            setIsApprovalDialogOpen(false)
            setApprovalLevel('')
            setApprovalAction('')
            setApprovalRemarks('')
            fetchLeaveRequests()
        } catch (error: any) {
            toast.error(error.message || 'Failed to process approval')
        }
    }

    const openApprovalDialog = (request: LeaveRequest, level: string, action: string) => {
        setSelectedRequest(request)
        setApprovalLevel(level)
        setApprovalAction(action)
        setApprovalRemarks('')
        setIsApprovalDialogOpen(true)
    }

    const getNextApprovalLevel = (request: LeaveRequest): string | null => {
        if (request.status === 'PENDING') return 'TEAM_LEADER'
        if (request.status === 'TL_APPROVED') return 'MANAGER'
        if (request.status === 'MANAGER_APPROVED') return 'HR'
        return null
    }

    const resetForm = () => {
        setFormData({
            employeeId: '',
            leaveTypeId: '',
            startDate: '',
            endDate: '',
            reason: ''
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Leave Management</h1>
                    <p className="text-muted-foreground">Multi-level approval: Team Leader → Manager → HR</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Leave Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Leave Type</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmitType} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Name *</Label>
                                    <Input
                                        value={typeFormData.name}
                                        onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                                        placeholder="e.g., Annual Leave"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={typeFormData.description}
                                        onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Days Per Year</Label>
                                    <Input
                                        type="number"
                                        value={typeFormData.daysPerYear}
                                        onChange={(e) => setTypeFormData({ ...typeFormData, daysPerYear: e.target.value })}
                                        placeholder="e.g., 21"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPaid"
                                        checked={typeFormData.isPaid}
                                        onChange={(e) => setTypeFormData({ ...typeFormData, isPaid: e.target.checked })}
                                        className="rounded"
                                    />
                                    <Label htmlFor="isPaid">Paid Leave</Label>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsTypeDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Create</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Calendar className="h-4 w-4 mr-2" />
                                New Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Submit Leave Request</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmitRequest} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Employee *</Label>
                                    <Select
                                        value={formData.employeeId}
                                        onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
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
                                    <Label>Leave Type *</Label>
                                    <Select
                                        value={formData.leaveTypeId}
                                        onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leaveTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name} ({type.daysPerYear} days/year)
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
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date *</Label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason</Label>
                                    <Textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Submit</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="requests" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="requests">Leave Requests</TabsTrigger>
                    <TabsTrigger value="types">Leave Types</TabsTrigger>
                </TabsList>

                <TabsContent value="requests">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Label>Filter by Status:</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="PENDING">Pending (TL)</SelectItem>
                                        <SelectItem value="TL_APPROVED">TL Approved (Manager)</SelectItem>
                                        <SelectItem value="MANAGER_APPROVED">Manager Approved (HR)</SelectItem>
                                        <SelectItem value="APPROVED">Fully Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead className="text-center">TL</TableHead>
                                        <TableHead className="text-center">Manager</TableHead>
                                        <TableHead className="text-center">HR</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-10">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : leaveRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-10">
                                                No leave requests found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaveRequests.map((request) => {
                                            const nextLevel = getNextApprovalLevel(request)
                                            return (
                                                <TableRow key={request.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {request.employee.firstName} {request.employee.lastName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {request.employee.employeeId}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{request.leaveType.name}</TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <p>{format(new Date(request.startDate), 'dd MMM')}</p>
                                                            <p className="text-muted-foreground">to {format(new Date(request.endDate), 'dd MMM')}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{request.totalDays}</TableCell>
                                                    <TableCell className="text-center">
                                                        <ApprovalIcon status={request.teamLeaderStatus} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <ApprovalIcon status={request.managerStatus} />
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <ApprovalIcon status={request.hrStatus} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[request.status]}>
                                                            {request.status === 'TL_APPROVED' ? 'TL Approved' :
                                                             request.status === 'MANAGER_APPROVED' ? 'Mgr Approved' :
                                                             request.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setSelectedRequest(request)
                                                                    setIsViewDialogOpen(true)
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            {nextLevel && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-green-600"
                                                                        onClick={() => openApprovalDialog(request, nextLevel, 'APPROVED')}
                                                                        title={`Approve as ${nextLevel.replace('_', ' ')}`}
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-red-600"
                                                                        onClick={() => openApprovalDialog(request, nextLevel, 'REJECTED')}
                                                                        title={`Reject as ${nextLevel.replace('_', ' ')}`}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="types">
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-center">Days/Year</TableHead>
                                        <TableHead className="text-center">Paid</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaveTypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10">
                                                No leave types defined. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaveTypes.map((type) => (
                                            <TableRow key={type.id}>
                                                <TableCell className="font-medium">{type.name}</TableCell>
                                                <TableCell>{type.description || '-'}</TableCell>
                                                <TableCell className="text-center">{type.daysPerYear}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={type.isPaid ? "default" : "secondary"}>
                                                        {type.isPaid ? 'Yes' : 'No'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* View Request Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Leave Request Details</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Employee</Label>
                                    <p className="font-medium">{selectedRequest.employee.firstName} {selectedRequest.employee.lastName}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Leave Type</Label>
                                    <p className="font-medium">{selectedRequest.leaveType.name}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Duration</Label>
                                    <p className="font-medium">
                                        {format(new Date(selectedRequest.startDate), 'dd MMM yyyy')} - {format(new Date(selectedRequest.endDate), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Total Days</Label>
                                    <p className="font-medium">{selectedRequest.totalDays}</p>
                                </div>
                            </div>

                            {selectedRequest.reason && (
                                <div>
                                    <Label className="text-muted-foreground">Reason</Label>
                                    <p className="font-medium">{selectedRequest.reason}</p>
                                </div>
                            )}

                            <div className="border rounded-lg p-4 space-y-3">
                                <h4 className="font-semibold">Approval Workflow</h4>

                                {/* Team Leader */}
                                <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                                    <ApprovalIcon status={selectedRequest.teamLeaderStatus} />
                                    <div className="flex-1">
                                        <p className="font-medium">Team Leader</p>
                                        {selectedRequest.teamLeaderApprovedBy && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedRequest.teamLeaderStatus} by {selectedRequest.teamLeaderApprovedBy}
                                                {selectedRequest.teamLeaderApprovedAt && ` on ${format(new Date(selectedRequest.teamLeaderApprovedAt), 'dd MMM yyyy')}`}
                                            </p>
                                        )}
                                        {selectedRequest.teamLeaderRemarks && (
                                            <p className="text-sm italic">"{selectedRequest.teamLeaderRemarks}"</p>
                                        )}
                                    </div>
                                    <Badge className={approvalStatusColors[selectedRequest.teamLeaderStatus]}>
                                        {selectedRequest.teamLeaderStatus}
                                    </Badge>
                                </div>

                                {/* Manager */}
                                <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                                    <ApprovalIcon status={selectedRequest.managerStatus} />
                                    <div className="flex-1">
                                        <p className="font-medium">Manager</p>
                                        {selectedRequest.managerApprovedBy && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedRequest.managerStatus} by {selectedRequest.managerApprovedBy}
                                                {selectedRequest.managerApprovedAt && ` on ${format(new Date(selectedRequest.managerApprovedAt), 'dd MMM yyyy')}`}
                                            </p>
                                        )}
                                        {selectedRequest.managerRemarks && (
                                            <p className="text-sm italic">"{selectedRequest.managerRemarks}"</p>
                                        )}
                                    </div>
                                    <Badge className={approvalStatusColors[selectedRequest.managerStatus]}>
                                        {selectedRequest.managerStatus}
                                    </Badge>
                                </div>

                                {/* HR */}
                                <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                                    <ApprovalIcon status={selectedRequest.hrStatus} />
                                    <div className="flex-1">
                                        <p className="font-medium">HR (Final)</p>
                                        {selectedRequest.hrApprovedBy && (
                                            <p className="text-sm text-muted-foreground">
                                                {selectedRequest.hrStatus} by {selectedRequest.hrApprovedBy}
                                                {selectedRequest.hrApprovedAt && ` on ${format(new Date(selectedRequest.hrApprovedAt), 'dd MMM yyyy')}`}
                                            </p>
                                        )}
                                        {selectedRequest.hrRemarks && (
                                            <p className="text-sm italic">"{selectedRequest.hrRemarks}"</p>
                                        )}
                                    </div>
                                    <Badge className={approvalStatusColors[selectedRequest.hrStatus]}>
                                        {selectedRequest.hrStatus}
                                    </Badge>
                                </div>
                            </div>

                            {selectedRequest.rejectedReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded">
                                    <Label className="text-red-800">Rejection Reason</Label>
                                    <p className="text-red-700">{selectedRequest.rejectedReason}</p>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2">
                                <Badge className={statusColors[selectedRequest.status]} >
                                    {selectedRequest.status === 'APPROVED' ? 'FULLY APPROVED' : selectedRequest.status}
                                </Badge>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approval Dialog */}
            <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {approvalAction === 'APPROVED' ? 'Approve' : 'Reject'} as {approvalLevel?.replace('_', ' ')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Remarks (Optional)</Label>
                            <Textarea
                                value={approvalRemarks}
                                onChange={(e) => setApprovalRemarks(e.target.value)}
                                placeholder="Add any comments..."
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApprovalSubmit}
                                variant={approvalAction === 'APPROVED' ? 'default' : 'destructive'}
                            >
                                {approvalAction === 'APPROVED' ? 'Approve' : 'Reject'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
