'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react'

interface Attendance {
    id: string
    date: string
    clockIn?: string
    clockOut?: string
    status: string
    workHours?: number
    notes?: string
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

const STATUS_COLORS: Record<string, string> = {
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    LATE: 'bg-yellow-100 text-yellow-800',
    HALF_DAY: 'bg-orange-100 text-orange-800',
    ON_LEAVE: 'bg-blue-100 text-blue-800',
    HOLIDAY: 'bg-purple-100 text-purple-800',
    WEEKEND: 'bg-gray-100 text-gray-800'
}

export default function MyAttendancePage() {
    const [attendance, setAttendance] = useState<Attendance[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [summary, setSummary] = useState({
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        totalHours: 0
    })

    useEffect(() => {
        fetchAttendance()
    }, [selectedMonth, selectedYear])

    const fetchAttendance = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/portal/attendance?month=${selectedMonth}&year=${selectedYear}`)
            const data = await res.json()
            if (data.attendance) {
                setAttendance(data.attendance)
                setSummary(data.summary || {
                    present: 0,
                    absent: 0,
                    late: 0,
                    leave: 0,
                    totalHours: 0
                })
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Attendance</h1>
                <p className="text-muted-foreground">View your attendance records</p>
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
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Present
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{summary.present}</div>
                        <p className="text-xs text-muted-foreground">days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Absent
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summary.absent}</div>
                        <p className="text-xs text-muted-foreground">days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Late
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{summary.late}</div>
                        <p className="text-xs text-muted-foreground">days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            On Leave
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{summary.leave}</div>
                        <p className="text-xs text-muted-foreground">days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Total Hours
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalHours.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">hours</p>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Attendance Records - {MONTHS[selectedMonth - 1]} {selectedYear}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Work Hours</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
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
                                        No attendance records found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attendance.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {new Date(record.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </TableCell>
                                        <TableCell>{formatTime(record.clockIn)}</TableCell>
                                        <TableCell>{formatTime(record.clockOut)}</TableCell>
                                        <TableCell>
                                            {record.workHours ? `${Number(record.workHours).toFixed(1)} hrs` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_COLORS[record.status]}>
                                                {record.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {record.notes || '-'}
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
