import { prisma } from '@/lib/db.server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Briefcase, UserCheck } from 'lucide-react'

export default async function DashboardPage() {
    const [employeeCount, departmentCount, designationCount, activeEmployees] = await Promise.all([
        prisma.employee.count(),
        prisma.department.count(),
        prisma.designation.count(),
        prisma.employee.count({ where: { status: 'ACTIVE' } })
    ])

    const stats = [
        { title: 'Total Employees', value: employeeCount, icon: Users, color: 'text-blue-500' },
        { title: 'Active Employees', value: activeEmployees, icon: UserCheck, color: 'text-green-500' },
        { title: 'Departments', value: departmentCount, icon: Building2, color: 'text-purple-500' },
        { title: 'Designations', value: designationCount, icon: Briefcase, color: 'text-orange-500' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to HRMS Dashboard</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>
    )
}
