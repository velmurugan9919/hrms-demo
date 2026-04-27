'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Building2,
    Plus,
    Edit,
    Trash2,
    Users,
    MapPin,
    Globe
} from 'lucide-react'

interface Branch {
    id: string
    name: string
    code: string
    country: 'UAE' | 'IND'
    currency: 'AED' | 'INR'
    address?: string
    city?: string
    state?: string
    phone?: string
    email?: string
    isActive: boolean
    _count?: {
        employees: number
    }
}

const COUNTRY_INFO = {
    UAE: { name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED' },
    IND: { name: 'India', flag: '🇮🇳', currency: 'INR' }
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        country: 'UAE' as 'UAE' | 'IND',
        currency: 'AED' as 'AED' | 'INR',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: ''
    })

    useEffect(() => {
        fetchBranches()
    }, [])

    const fetchBranches = async () => {
        try {
            const res = await fetch('/api/branches')
            const data = await res.json()
            // Ensure we always set an array
            setBranches(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch branches:', error)
            setBranches([])
        } finally {
            setLoading(false)
        }
    }

    const handleCountryChange = (country: 'UAE' | 'IND') => {
        setFormData({
            ...formData,
            country,
            currency: COUNTRY_INFO[country].currency as 'AED' | 'INR'
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingBranch
                ? `/api/branches/${editingBranch.id}`
                : '/api/branches'
            const method = editingBranch ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                setDialogOpen(false)
                setEditingBranch(null)
                resetForm()
                fetchBranches()
            }
        } catch (error) {
            console.error('Failed to save branch:', error)
        }
    }

    const handleEdit = (branch: Branch) => {
        setEditingBranch(branch)
        setFormData({
            name: branch.name,
            code: branch.code,
            country: branch.country,
            currency: branch.currency,
            address: branch.address || '',
            city: branch.city || '',
            state: branch.state || '',
            phone: branch.phone || '',
            email: branch.email || ''
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this branch?')) return

        try {
            const res = await fetch(`/api/branches/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchBranches()
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to delete branch')
            }
        } catch (error) {
            console.error('Failed to delete branch:', error)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            country: 'UAE',
            currency: 'AED',
            address: '',
            city: '',
            state: '',
            phone: '',
            email: ''
        })
    }

    const openNewDialog = () => {
        setEditingBranch(null)
        resetForm()
        setDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Building2 className="h-8 w-8" />
                        Branches / Offices
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your offices in different countries with country-specific payroll settings
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openNewDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Branch
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                            </DialogTitle>
                            <DialogDescription>
                                Configure branch details and country-specific settings
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Branch Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            placeholder="e.g., Dubai Head Office"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Branch Code</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) =>
                                                setFormData({ ...formData, code: e.target.value.toUpperCase() })
                                            }
                                            placeholder="e.g., UAE-DXB"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Select
                                            value={formData.country}
                                            onValueChange={(v) => handleCountryChange(v as 'UAE' | 'IND')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="UAE">
                                                    {COUNTRY_INFO.UAE.flag} UAE - United Arab Emirates
                                                </SelectItem>
                                                <SelectItem value="IND">
                                                    {COUNTRY_INFO.IND.flag} IND - India
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Input
                                            value={formData.currency}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                </div>

                                {/* Country-specific info card */}
                                <Card className={formData.country === 'UAE' ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}>
                                    <CardContent className="pt-4">
                                        <p className="text-sm font-medium">
                                            {formData.country === 'UAE' ? (
                                                <>
                                                    <span className="text-blue-700">UAE Payroll:</span>{' '}
                                                    <span className="text-muted-foreground">
                                                        No income tax, WPS compliant, Gratuity after 1 year
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-orange-700">India Payroll:</span>{' '}
                                                    <span className="text-muted-foreground">
                                                        PF (12%), ESI, TDS, Professional Tax, Gratuity after 5 years
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </CardContent>
                                </Card>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address: e.target.value })
                                        }
                                        placeholder="Street address"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={formData.city}
                                            onChange={(e) =>
                                                setFormData({ ...formData, city: e.target.value })
                                            }
                                            placeholder={formData.country === 'UAE' ? 'Dubai' : 'Bangalore'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State / Emirate</Label>
                                        <Input
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) =>
                                                setFormData({ ...formData, state: e.target.value })
                                            }
                                            placeholder={formData.country === 'UAE' ? 'Dubai' : 'Karnataka'}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({ ...formData, phone: e.target.value })
                                            }
                                            placeholder={formData.country === 'UAE' ? '+971 4 XXX XXXX' : '+91 80 XXXX XXXX'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({ ...formData, email: e.target.value })
                                            }
                                            placeholder="branch@company.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingBranch ? 'Update' : 'Create'} Branch
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Total Branches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{branches.length}</div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span>🇦🇪</span>
                            UAE Branches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {branches.filter(b => b.country === 'UAE').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {branches.filter(b => b.country === 'UAE').reduce((sum, b) => sum + (b._count?.employees || 0), 0)} employees
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-orange-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <span>🇮🇳</span>
                            India Branches
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {branches.filter(b => b.country === 'IND').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {branches.filter(b => b.country === 'IND').reduce((sum, b) => sum + (b._count?.employees || 0), 0)} employees
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Branches Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Branches</CardTitle>
                    <CardDescription>
                        Manage offices across different countries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Employees</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        Loading branches...
                                    </TableCell>
                                </TableRow>
                            ) : branches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-10">
                                        No branches found. Add your first branch.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                branches.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {branch.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm bg-muted px-2 py-1 rounded">
                                                {branch.code}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span>{COUNTRY_INFO[branch.country].flag}</span>
                                                <span>{branch.country}</span>
                                                <Badge variant="outline" className="ml-1">
                                                    {branch.currency}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="h-3 w-3" />
                                                <span className="text-sm">
                                                    {branch.city || branch.state || '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>{branch._count?.employees || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                                                {branch.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(branch)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(branch.id)}
                                                    disabled={(branch._count?.employees || 0) > 0}
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
        </div>
    )
}
