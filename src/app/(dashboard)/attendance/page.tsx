'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Clock, LogIn, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Attendance {
    id: string
    date: string
    clockIn?: string
    clockOut?: string
    status: string
    workHours?: number
    employee: {
        id: string
        employeeId: string
        firstName: string
        lastName: string
        department?: { name: string }
    }
}

interface Employee {
    id: string
    employeeId: string
    firstName: string
    lastName: string
}

const statusColors: Record<string, string> = {
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    LATE: 'bg-yellow-100 text-yellow-800',
    HALF_DAY: 'bg-orange-100 text-orange-800',
    ON_LEAVE: 'bg-blue-100 text-blue-800',
}

export default function AttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [formData, setFormData] = useState({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        clockIn: '',
        clockOut: '',
        status: 'PRESENT'
    })

    useEffect(() => {
        fetchAttendance()
        fetchEmployees()
    }, [selectedDate])

    const fetchAttendance = async () => {
        try {
            const res = await fetch(`/api/attendance?date=${selectedDate}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setAttendance(data)
            } else {
                setAttendance([])
            }
        } catch (error) {
            toast.error('Failed to fetch attendance')
            setAttendance([])
        } finally {
            setLoading(false)
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

    const handleClockAction = async (employeeId: string, action: 'in' | 'out') => {
        try {
            const res = await fetch('/api/attendance/clock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, action })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(`Clocked ${action} successfully`)
            fetchAttendance()
        } catch (error: any) {
            toast.error(error.message || `Failed to clock ${action}`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success('Attendance recorded')
            setIsDialogOpen(false)
            resetForm()
            fetchAttendance()
        } catch (error: any) {
            toast.error(error.message || 'Failed to record attendance')
        }
    }

    const resetForm = () => {
        setFormData({
            employeeId: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            clockIn: '',
            clockOut: '',
            status: 'PRESENT'
        })
    }

    const getEmployeeAttendance = (empId: string) => {
        return attendance.find(a => a.employee.id === empId)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Attendance</h1>
                    <p className="text-muted-foreground">Track employee attendance</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Manual Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Attendance</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <Label>Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Clock In</Label>
                                    <Input
                                        type="time"
                                        value={formData.clockIn}
                                        onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Clock Out</Label>
                                    <Input
                                        type="time"
                                        value={formData.clockOut}
                                        onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRESENT">Present</SelectItem>
                                        <SelectItem value="ABSENT">Absent</SelectItem>
                                        <SelectItem value="LATE">Late</SelectItem>
                                        <SelectItem value="HALF_DAY">Half Day</SelectItem>
                                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="daily" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="daily">Daily View</TabsTrigger>
                    <TabsTrigger value="quick">Quick Clock</TabsTrigger>
                </TabsList>

                <TabsContent value="daily">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Label>Date:</Label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-auto"
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : attendance.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10">
                                                No attendance records for this date
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        attendance.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">
                                                    {record.employee.employeeId}
                                                </TableCell>
                                                <TableCell>
                                                    {record.employee.firstName} {record.employee.lastName}
                                                </TableCell>
                                                <TableCell>
                                                    {record.employee.department?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.clockIn
                                                        ? format(new Date(record.clockIn), 'hh:mm a')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.clockOut
                                                        ? format(new Date(record.clockOut), 'hh:mm a')
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.workHours
                                                        ? `${Number(record.workHours).toFixed(1)}h`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusColors[record.status]}>
                                                        {record.status.replace('_', ' ')}
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

                <TabsContent value="quick">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Quick Clock In/Out
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {employees.map((emp) => {
                                    const empAttendance = getEmployeeAttendance(emp.id)
                                    const hasClockedIn = !!empAttendance?.clockIn
                                    const hasClockedOut = !!empAttendance?.clockOut

                                    return (
                                        <Card key={emp.id} className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {emp.firstName} {emp.lastName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {emp.employeeId}
                                                    </p>
                                                </div>
                                                {empAttendance && (
                                                    <Badge className={statusColors[empAttendance.status]}>
                                                        {empAttendance.status.replace('_', ' ')}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={hasClockedIn ? "secondary" : "default"}
                                                    disabled={hasClockedIn}
                                                    onClick={() => handleClockAction(emp.id, 'in')}
                                                    className="flex-1"
                                                >
                                                    <LogIn className="h-4 w-4 mr-1" />
                                                    {hasClockedIn
                                                        ? format(new Date(empAttendance!.clockIn!), 'hh:mm a')
                                                        : 'Clock In'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={hasClockedOut ? "secondary" : "outline"}
                                                    disabled={!hasClockedIn || hasClockedOut}
                                                    onClick={() => handleClockAction(emp.id, 'out')}
                                                    className="flex-1"
                                                >
                                                    <LogOut className="h-4 w-4 mr-1" />
                                                    {hasClockedOut
                                                        ? format(new Date(empAttendance!.clockOut!), 'hh:mm a')
                                                        : 'Clock Out'}
                                                </Button>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
