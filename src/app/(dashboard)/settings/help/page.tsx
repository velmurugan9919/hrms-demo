'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    BookOpen,
    Users,
    LogIn,
    Building2,
    Calendar,
    Wallet,
    FileText,
    Bell,
    Globe,
    Shield,
    HelpCircle,
    CheckCircle,
    ArrowRight
} from 'lucide-react'

export default function HelpPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <BookOpen className="h-8 w-8" />
                    Help & Documentation
                </h1>
                <p className="text-muted-foreground">
                    Learn how to use the HRMS application
                </p>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-6 pr-4">

                    {/* Employee Login */}
                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <LogIn className="h-5 w-5" />
                                Employee Login
                            </CardTitle>
                            <CardDescription>How employees can access the system</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">First Time Login</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Employees can login using their credentials. The system automatically creates
                                    their account on first login.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">Email</Badge>
                                        <span className="text-sm">Employee's email address</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">Password</Badge>
                                        <span className="text-sm">Employee ID (e.g., EMP001)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    After Login
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                                    <li>Admin/HR/Manager users are redirected to Dashboard</li>
                                    <li>Regular employees are redirected to Employee Portal</li>
                                    <li>Account is automatically created on first successful login</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Admin Accounts */}
                    <Card className="border-purple-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-purple-700">
                                <Shield className="h-5 w-5" />
                                Admin Accounts
                            </CardTitle>
                            <CardDescription>System administrator access</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Email</th>
                                            <th className="text-left py-2">Password</th>
                                            <th className="text-left py-2">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-2"><code>admin@hrms.com</code></td>
                                            <td className="py-2"><code>admin123</code></td>
                                            <td className="py-2"><Badge>ADMIN</Badge></td>
                                        </tr>
                                        <tr>
                                            <td className="py-2"><code>superadmin@hrms.system</code></td>
                                            <td className="py-2"><code>admin123</code></td>
                                            <td className="py-2"><Badge variant="destructive">SUPER_ADMIN</Badge></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Roles */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Roles & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Badge variant="destructive">SUPER_ADMIN</Badge>
                                    <span className="text-sm">Full system access, can manage all settings and users</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Badge className="bg-red-100 text-red-800">ADMIN</Badge>
                                    <span className="text-sm">Full access to all modules, user management</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Badge className="bg-purple-100 text-purple-800">HR</Badge>
                                    <span className="text-sm">Employee management, payroll, leave approvals</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Badge className="bg-blue-100 text-blue-800">MANAGER</Badge>
                                    <span className="text-sm">Team management, leave approvals for team</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Badge className="bg-green-100 text-green-800">TEAM_LEADER</Badge>
                                    <span className="text-sm">First-level leave approval for team members</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Badge className="bg-gray-100 text-gray-800">USER</Badge>
                                    <span className="text-sm">Employee self-service portal access only</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Branches */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5" />
                                Multi-Country Branches
                            </CardTitle>
                            <CardDescription>UAE and India office support</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The system supports multiple branches in different countries with country-specific payroll calculations.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <span>🇦🇪</span> UAE Branch
                                    </h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Currency: AED</li>
                                        <li>• No income tax</li>
                                        <li>• WPS compliant payroll</li>
                                        <li>• Gratuity after 1 year</li>
                                        <li>• 30 days annual leave</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                                        <span>🇮🇳</span> India Branch
                                    </h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Currency: INR</li>
                                        <li>• PF (12% + 12%)</li>
                                        <li>• ESI, TDS, Professional Tax</li>
                                        <li>• Gratuity after 5 years</li>
                                        <li>• State-wise leave policies</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employee Portal */}
                    <Card className="border-green-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                                <Users className="h-5 w-5" />
                                Employee Self-Service Portal
                            </CardTitle>
                            <CardDescription>Features available to employees</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Portal Features:</h4>
                                    <ul className="text-sm space-y-2">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            View personal dashboard
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Check attendance records
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Apply for leave
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            View leave balance
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Download payslips
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            View profile details
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Portal URL</h4>
                                    <code className="text-sm bg-white px-2 py-1 rounded">/portal</code>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Employees are automatically redirected here after login
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Expiry Alerts */}
                    <Card className="border-orange-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <Bell className="h-5 w-5" />
                                Document Expiry Alerts
                            </CardTitle>
                            <CardDescription>Automatic notifications for expiring documents</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                The dashboard shows alerts for documents expiring soon:
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="text-center p-3 bg-muted rounded-lg">
                                    <span className="text-2xl">🛂</span>
                                    <p className="text-sm font-medium mt-1">Visa</p>
                                </div>
                                <div className="text-center p-3 bg-muted rounded-lg">
                                    <span className="text-2xl">🪪</span>
                                    <p className="text-sm font-medium mt-1">Emirates ID</p>
                                </div>
                                <div className="text-center p-3 bg-muted rounded-lg">
                                    <span className="text-2xl">📋</span>
                                    <p className="text-sm font-medium mt-1">Labor Card</p>
                                </div>
                                <div className="text-center p-3 bg-muted rounded-lg">
                                    <span className="text-2xl">📕</span>
                                    <p className="text-sm font-medium mt-1">Passport</p>
                                </div>
                            </div>
                            <div className="bg-orange-50 p-3 rounded-lg">
                                <p className="text-sm">
                                    <strong>Configure Alert Days:</strong> Click the gear icon on the alerts
                                    card to change the number of days before expiry (default: 30 days)
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Approval Workflow */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Leave Approval Workflow
                            </CardTitle>
                            <CardDescription>Multi-level approval process</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium">Employee</p>
                                    <p className="text-xs text-muted-foreground">Applies</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium">Team Leader</p>
                                    <p className="text-xs text-muted-foreground">1st Approval</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <p className="text-sm font-medium">Manager</p>
                                    <p className="text-xs text-muted-foreground">2nd Approval</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                                        <Users className="h-6 w-6 text-red-600" />
                                    </div>
                                    <p className="text-sm font-medium">HR</p>
                                    <p className="text-xs text-muted-foreground">Final Approval</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payroll & Settlement */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                Payroll & Final Settlement
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-2">Monthly Payroll</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Generate payslips for all employees</li>
                                        <li>• Country-specific deductions (PF, TDS for India)</li>
                                        <li>• WPS export for UAE</li>
                                        <li>• Overtime and bonus calculations</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <h4 className="font-semibold mb-2">Final Settlement</h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        <li>• Gratuity calculation (UAE/India rules)</li>
                                        <li>• Leave encashment</li>
                                        <li>• Notice period calculation</li>
                                        <li>• Loan/advance deductions</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Tips */}
                    <Card className="border-yellow-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-700">
                                <HelpCircle className="h-5 w-5" />
                                Quick Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-500">💡</span>
                                    <span>Create branches first, then assign employees to branches for correct payroll calculations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-500">💡</span>
                                    <span>Employee passwords can be reset by editing the user in Settings → Users</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-500">💡</span>
                                    <span>Document expiry alerts are shown 30 days before by default - customize in dashboard</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-500">💡</span>
                                    <span>Generate payroll monthly before the 25th for WPS compliance</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                </div>
            </ScrollArea>
        </div>
    )
}
