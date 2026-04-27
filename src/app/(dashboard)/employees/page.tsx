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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
    id: string
    employeeId: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    dateOfBirth?: string
    gender?: string
    address?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
    joiningDate: string
    status: string
    salary?: number
    department?: { id: string; name: string }
    designation?: { id: string; name: string }
}

interface Department {
    id: string
    name: string
}

interface Designation {
    id: string
    name: string
}

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    TERMINATED: 'bg-red-100 text-red-800',
    ON_LEAVE: 'bg-yellow-100 text-yellow-800',
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [designations, setDesignations] = useState<Designation[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [formData, setFormData] = useState({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        joiningDate: '',
        status: 'ACTIVE',
        salary: '',
        departmentId: '',
        designationId: ''
    })

    useEffect(() => {
        fetchEmployees()
        fetchDepartments()
        fetchDesignations()
    }, [])

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees')
            const data = await res.json()
            if (Array.isArray(data)) {
                setEmployees(data)
            } else {
                setEmployees([])
            }
        } catch (error) {
            toast.error('Failed to fetch employees')
            setEmployees([])
        } finally {
            setLoading(false)
        }
    }

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments')
            const data = await res.json()
            if (Array.isArray(data)) {
                setDepartments(data)
            } else {
                setDepartments([])
            }
        } catch (error) {
            console.error('Failed to fetch departments')
            setDepartments([])
        }
    }

    const fetchDesignations = async () => {
        try {
            const res = await fetch('/api/designations')
            const data = await res.json()
            if (Array.isArray(data)) {
                setDesignations(data)
            } else {
                setDesignations([])
            }
        } catch (error) {
            console.error('Failed to fetch designations')
            setDesignations([])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = selectedEmployee
            ? `/api/employees/${selectedEmployee.id}`
            : '/api/employees'
        const method = selectedEmployee ? 'PUT' : 'POST'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    salary: formData.salary ? parseFloat(formData.salary) : null,
                    departmentId: formData.departmentId || null,
                    designationId: formData.designationId || null
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(selectedEmployee ? 'Employee updated' : 'Employee created')
            setIsDialogOpen(false)
            resetForm()
            fetchEmployees()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save employee')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return

        try {
            const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Employee deleted')
            fetchEmployees()
        } catch (error) {
            toast.error('Failed to delete employee')
        }
    }

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee)
        setFormData({
            employeeId: employee.employeeId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone || '',
            dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split('T')[0] : '',
            gender: employee.gender || '',
            address: employee.address || '',
            city: employee.city || '',
            state: employee.state || '',
            country: employee.country || '',
            zipCode: employee.zipCode || '',
            joiningDate: employee.joiningDate.split('T')[0],
            status: employee.status,
            salary: employee.salary?.toString() || '',
            departmentId: employee.department?.id || '',
            designationId: employee.designation?.id || ''
        })
        setIsDialogOpen(true)
    }

    const handleView = (employee: Employee) => {
        setSelectedEmployee(employee)
        setIsViewDialogOpen(true)
    }

    const resetForm = () => {
        setSelectedEmployee(null)
        setFormData({
            employeeId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            gender: '',
            address: '',
            city: '',
            state: '',
            country: '',
            zipCode: '',
            joiningDate: '',
            status: 'ACTIVE',
            salary: '',
            departmentId: '',
            designationId: ''
        })
    }

    const filteredEmployees = employees.filter(emp =>
        emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-muted-foreground">Manage your employees</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[70vh] pr-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employeeId">Employee ID *</Label>
                                        <Input
                                            id="employeeId"
                                            value={formData.employeeId}
                                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name *</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name *</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => setFormData({ ...formData, gender: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="joiningDate">Joining Date *</Label>
                                        <Input
                                            id="joiningDate"
                                            type="date"
                                            value={formData.joiningDate}
                                            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Select
                                            value={formData.departmentId}
                                            onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="designation">Designation</Label>
                                        <Select
                                            value={formData.designationId}
                                            onValueChange={(value) => setFormData({ ...formData, designationId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select designation" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {designations.map((desig) => (
                                                    <SelectItem key={desig.id} value={desig.id}>
                                                        {desig.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="salary">Salary</Label>
                                        <Input
                                            id="salary"
                                            type="number"
                                            value={formData.salary}
                                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                        />
                                    </div>
                                    {selectedEmployee && (
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                                                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="zipCode">Zip Code</Label>
                                        <Input
                                            id="zipCode"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {selectedEmployee ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Designation</TableHead>
                                <TableHead>Status</TableHead>
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
                            ) : filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        No employees found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.employeeId}</TableCell>
                                        <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.department?.name || '-'}</TableCell>
                                        <TableCell>{employee.designation?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[employee.status]}>
                                                {employee.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleView(employee)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(employee)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(employee.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Employee Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Employee Details</DialogTitle>
                    </DialogHeader>
                    {selectedEmployee && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Employee ID</Label>
                                    <p className="font-medium">{selectedEmployee.employeeId}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <Badge className={statusColors[selectedEmployee.status]}>
                                        {selectedEmployee.status}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Name</Label>
                                    <p className="font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium">{selectedEmployee.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Phone</Label>
                                    <p className="font-medium">{selectedEmployee.phone || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Gender</Label>
                                    <p className="font-medium">{selectedEmployee.gender || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Department</Label>
                                    <p className="font-medium">{selectedEmployee.department?.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Designation</Label>
                                    <p className="font-medium">{selectedEmployee.designation?.name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Joining Date</Label>
                                    <p className="font-medium">{new Date(selectedEmployee.joiningDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Salary</Label>
                                    <p className="font-medium">{selectedEmployee.salary ? `AED ${Number(selectedEmployee.salary).toFixed(2)}` : '-'}</p>
                                </div>
                            </div>
                            {selectedEmployee.address && (
                                <div>
                                    <Label className="text-muted-foreground">Address</Label>
                                    <p className="font-medium">
                                        {selectedEmployee.address}
                                        {selectedEmployee.city && `, ${selectedEmployee.city}`}
                                        {selectedEmployee.state && `, ${selectedEmployee.state}`}
                                        {selectedEmployee.country && `, ${selectedEmployee.country}`}
                                        {selectedEmployee.zipCode && ` - ${selectedEmployee.zipCode}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
