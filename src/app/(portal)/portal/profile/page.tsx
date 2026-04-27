'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Building2, Phone, Mail, Calendar, CreditCard, FileText } from 'lucide-react'

interface Employee {
    id: string
    employeeId: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    nationality?: string
    maritalStatus?: string
    address?: string
    city?: string
    country?: string
    emiratesId?: string
    emiratesIdExpiry?: string
    passportNumber?: string
    passportExpiry?: string
    visaStatus?: string
    visaExpiryDate?: string
    joiningDate: string
    status: string
    contractType?: string
    basicSalary?: number
    totalSalary?: number
    bankName?: string
    accountNumber?: string
    iban?: string
    department?: { name: string }
    designation?: { name: string }
}

export default function MyProfilePage() {
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/portal/profile')
            const data = await res.json()
            if (!data.error) {
                setEmployee(data)
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
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

    if (!employee) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Profile not found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">View your personal and employment details</p>
            </div>

            {/* Header Card */}
            <Card className="bg-gradient-to-r from-[#1e3a5f] to-[#0d2137] text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 text-3xl font-bold">
                            {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{employee.firstName} {employee.lastName}</h2>
                            <p className="text-white/80">{employee.designation?.name || 'Employee'}</p>
                            <p className="text-white/60">{employee.department?.name || 'Department'}</p>
                            <div className="mt-2 flex gap-2">
                                <Badge variant="secondary">{employee.employeeId}</Badge>
                                <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                    {employee.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Full Name</p>
                                <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{employee.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{employee.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date of Birth</p>
                                <p className="font-medium">
                                    {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Gender</p>
                                <p className="font-medium">{employee.gender || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Nationality</p>
                                <p className="font-medium">{employee.nationality || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Marital Status</p>
                                <p className="font-medium">{employee.maritalStatus || '-'}</p>
                            </div>
                        </div>
                        {employee.address && (
                            <div>
                                <p className="text-sm text-muted-foreground">Address</p>
                                <p className="font-medium">
                                    {employee.address}
                                    {employee.city && `, ${employee.city}`}
                                    {employee.country && `, ${employee.country}`}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Employment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Employment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Employee ID</p>
                                <p className="font-medium">{employee.employeeId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {employee.status}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Department</p>
                                <p className="font-medium">{employee.department?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Designation</p>
                                <p className="font-medium">{employee.designation?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Joining Date</p>
                                <p className="font-medium">{new Date(employee.joiningDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Contract Type</p>
                                <p className="font-medium">{employee.contractType || 'LIMITED'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Emirates ID</p>
                                <p className="font-medium">{employee.emiratesId || '-'}</p>
                                {employee.emiratesIdExpiry && (
                                    <p className="text-xs text-muted-foreground">
                                        Expires: {new Date(employee.emiratesIdExpiry).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Passport</p>
                                <p className="font-medium">{employee.passportNumber || '-'}</p>
                                {employee.passportExpiry && (
                                    <p className="text-xs text-muted-foreground">
                                        Expires: {new Date(employee.passportExpiry).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visa Status</p>
                                <p className="font-medium">{employee.visaStatus || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Visa Expiry</p>
                                <p className="font-medium">
                                    {employee.visaExpiryDate ? new Date(employee.visaExpiryDate).toLocaleDateString() : '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Bank Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Bank Name</p>
                                <p className="font-medium">{employee.bankName || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Account Number</p>
                                <p className="font-medium">
                                    {employee.accountNumber ? `****${employee.accountNumber.slice(-4)}` : '-'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-muted-foreground">IBAN</p>
                                <p className="font-medium">{employee.iban || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
