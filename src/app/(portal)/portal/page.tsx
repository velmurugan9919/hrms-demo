'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, FileText, TrendingUp } from 'lucide-react'

interface DashboardData {
    employee: any
    leaveBalance: any[]
    recentLeaves: any[]
    recentPayslips: any[]
    attendance: any
}

export default function PortalDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/portal/dashboard')
            const result = await res.json()
            if (!result.error) {
                setData(result)
            }
        } catch (error) {
            console.error('Failed to fetch dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome, {data?.employee?.firstName || 'Employee'}!
                </h1>
                <p className="text-muted-foreground">
                    {data?.employee?.designation?.name || 'Employee'} - {data?.employee?.department?.name || 'Department'}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Annual Leave</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data?.leaveBalance?.find((l: any) => l.leaveType?.name === 'Annual')?.totalDays -
                             (data?.leaveBalance?.find((l: any) => l.leaveType?.name === 'Annual')?.usedDays || 0) || 0} days
                        </div>
                        <p className="text-xs text-muted-foreground">Remaining balance</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data?.leaveBalance?.find((l: any) => l.leaveType?.name === 'Sick')?.totalDays -
                             (data?.leaveBalance?.find((l: any) => l.leaveType?.name === 'Sick')?.usedDays || 0) || 0} days
                        </div>
                        <p className="text-xs text-muted-foreground">Remaining balance</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data?.attendance?.presentDays || 0} days
                        </div>
                        <p className="text-xs text-muted-foreground">Present</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Payslips</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data?.recentPayslips?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Available</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Leave Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            Recent Leave Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data?.recentLeaves?.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No recent leave requests</p>
                        ) : (
                            <div className="space-y-3">
                                {data?.recentLeaves?.map((leave: any) => (
                                    <div key={leave.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{leave.leaveType?.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            leave.status === 'APPROVED' ? 'default' :
                                            leave.status === 'REJECTED' ? 'destructive' : 'secondary'
                                        }>
                                            {leave.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Payslips */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Recent Payslips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data?.recentPayslips?.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No payslips available</p>
                        ) : (
                            <div className="space-y-3">
                                {data?.recentPayslips?.map((payslip: any) => (
                                    <div key={payslip.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="font-medium">
                                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][payslip.month - 1]} {payslip.year}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Net: AED {Number(payslip.netSalary).toLocaleString()}
                                            </p>
                                        </div>
                                        <Badge variant={payslip.status === 'PAID' ? 'default' : 'secondary'}>
                                            {payslip.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
