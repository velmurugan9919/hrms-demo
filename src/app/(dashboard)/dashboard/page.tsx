import { prisma } from '@/lib/db.server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Briefcase, UserCheck, Globe, Calendar } from 'lucide-react'
import { ExpiryAlerts } from '@/components/ExpiryAlerts'

export default async function DashboardPage() {
    const [
        employeeCount,
        departmentCount,
        designationCount,
        activeEmployees,
        branchCount,
        pendingLeaves
    ] = await Promise.all([
        prisma.employee.count(),
        prisma.department.count(),
        prisma.designation.count(),
        prisma.employee.count({ where: { status: 'ACTIVE' } }),
        prisma.branch.count(),
        prisma.leaveRequest.count({ where: { status: 'PENDING' } })
    ])

    const stats = [
        { title: 'Total Employees', value: employeeCount, icon: Users, color: 'text-blue-500' },
        { title: 'Active Employees', value: activeEmployees, icon: UserCheck, color: 'text-green-500' },
        { title: 'Branches', value: branchCount, icon: Globe, color: 'text-indigo-500' },
        { title: 'Departments', value: departmentCount, icon: Building2, color: 'text-purple-500' },
        { title: 'Designations', value: designationCount, icon: Briefcase, color: 'text-orange-500' },
        { title: 'Pending Leaves', value: pendingLeaves, icon: Calendar, color: 'text-yellow-500' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to HRMS Dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Expiry Alerts */}
                <ExpiryAlerts />

                {/* Recent Activity or Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href="/employees/new"
                                className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                <Users className="h-8 w-8 text-blue-500" />
                                <div>
                                    <div className="font-medium">Add Employee</div>
                                    <div className="text-sm text-muted-foreground">Onboard new staff</div>
                                </div>
                            </a>
                            <a
                                href="/attendance"
                                className="flex items-center gap-3 p-4 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 transition-colors"
                            >
                                <UserCheck className="h-8 w-8 text-green-500" />
                                <div>
                                    <div className="font-medium">Attendance</div>
                                    <div className="text-sm text-muted-foreground">Mark attendance</div>
                                </div>
                            </a>
                            <a
                                href="/leave"
                                className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 transition-colors"
                            >
                                <Calendar className="h-8 w-8 text-yellow-500" />
                                <div>
                                    <div className="font-medium">Leave Requests</div>
                                    <div className="text-sm text-muted-foreground">
                                        {pendingLeaves > 0 ? `${pendingLeaves} pending` : 'Manage leaves'}
                                    </div>
                                </div>
                            </a>
                            <a
                                href="/payroll"
                                className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-colors"
                            >
                                <Briefcase className="h-8 w-8 text-purple-500" />
                                <div>
                                    <div className="font-medium">Payroll</div>
                                    <div className="text-sm text-muted-foreground">Generate payslips</div>
                                </div>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
