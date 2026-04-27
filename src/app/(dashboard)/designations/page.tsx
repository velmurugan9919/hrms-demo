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
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Designation {
    id: string
    name: string
    description?: string
    _count: { employees: number }
}

export default function DesignationsPage() {
    const [designations, setDesignations] = useState<Designation[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null)
    const [formData, setFormData] = useState({ name: '', description: '' })

    useEffect(() => {
        fetchDesignations()
    }, [])

    const fetchDesignations = async () => {
        try {
            const res = await fetch('/api/designations')
            const data = await res.json()
            setDesignations(data)
        } catch (error) {
            toast.error('Failed to fetch designations')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = selectedDesignation
            ? `/api/designations/${selectedDesignation.id}`
            : '/api/designations'
        const method = selectedDesignation ? 'PUT' : 'POST'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(selectedDesignation ? 'Designation updated' : 'Designation created')
            setIsDialogOpen(false)
            resetForm()
            fetchDesignations()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save designation')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this designation?')) return

        try {
            const res = await fetch(`/api/designations/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }
            toast.success('Designation deleted')
            fetchDesignations()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete designation')
        }
    }

    const handleEdit = (designation: Designation) => {
        setSelectedDesignation(designation)
        setFormData({
            name: designation.name,
            description: designation.description || ''
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setSelectedDesignation(null)
        setFormData({ name: '', description: '' })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Designations</h1>
                    <p className="text-muted-foreground">Manage job designations</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Designation
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedDesignation ? 'Edit Designation' : 'Add New Designation'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {selectedDesignation ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Employees</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : designations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10">
                                        No designations found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                designations.map((designation) => (
                                    <TableRow key={designation.id}>
                                        <TableCell className="font-medium">{designation.name}</TableCell>
                                        <TableCell>{designation.description || '-'}</TableCell>
                                        <TableCell className="text-center">{designation._count.employees}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(designation)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(designation.id)}
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
