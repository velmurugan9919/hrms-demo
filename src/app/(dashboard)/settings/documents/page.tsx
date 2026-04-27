'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, File, Pencil, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

const DOC_CATEGORIES = [
    { value: 'POLICY', label: 'Policy' },
    { value: 'HANDBOOK', label: 'Handbook' },
    { value: 'GUIDELINE', label: 'Guideline' },
    { value: 'FORM', label: 'Form' },
    { value: 'OTHER', label: 'Other' }
]

const EMPLOYEE_DOC_TYPES = [
    { value: 'ID_PROOF', label: 'ID Proof' },
    { value: 'ADDRESS_PROOF', label: 'Address Proof' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'OFFER_LETTER', label: 'Offer Letter' },
    { value: 'EXPERIENCE_LETTER', label: 'Experience Letter' },
    { value: 'RESUME', label: 'Resume' },
    { value: 'PHOTO', label: 'Photo' },
    { value: 'OTHER', label: 'Other' }
]

interface CompanyDocument {
    id: string
    title: string
    description?: string
    category: string
    content?: string
    fileUrl?: string
    isActive: boolean
    createdAt: string
}

interface LetterTemplate {
    id: string
    name: string
    description?: string
    content: string
    variables?: string
    isActive: boolean
    createdAt: string
}

interface EmployeeDocument {
    id: string
    employeeId: string
    title: string
    docType: string
    fileUrl?: string
    expiryDate?: string
    notes?: string
    employee: {
        id: string
        firstName: string
        lastName: string
        employeeId: string
    }
    createdAt: string
}

interface Employee {
    id: string
    firstName: string
    lastName: string
    employeeId: string
}

export default function DocumentsPage() {
    const [companyDocs, setCompanyDocs] = useState<CompanyDocument[]>([])
    const [templates, setTemplates] = useState<LetterTemplate[]>([])
    const [employeeDocs, setEmployeeDocs] = useState<EmployeeDocument[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    // Company Document Form
    const [companyDocForm, setCompanyDocForm] = useState({
        title: '',
        description: '',
        category: 'POLICY',
        content: '',
        fileUrl: ''
    })
    const [editingCompanyDoc, setEditingCompanyDoc] = useState<CompanyDocument | null>(null)
    const [companyDocDialogOpen, setCompanyDocDialogOpen] = useState(false)

    // Template Form
    const [templateForm, setTemplateForm] = useState({
        name: '',
        description: '',
        content: '',
        variables: ''
    })
    const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null)
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
    const [viewingTemplate, setViewingTemplate] = useState<LetterTemplate | null>(null)

    // Employee Document Form
    const [empDocForm, setEmpDocForm] = useState({
        employeeId: '',
        title: '',
        docType: 'ID_PROOF',
        fileUrl: '',
        expiryDate: '',
        notes: ''
    })
    const [editingEmpDoc, setEditingEmpDoc] = useState<EmployeeDocument | null>(null)
    const [empDocDialogOpen, setEmpDocDialogOpen] = useState(false)

    useEffect(() => {
        fetchAll()
    }, [])

    const fetchAll = async () => {
        setLoading(true)
        await Promise.all([
            fetchCompanyDocs(),
            fetchTemplates(),
            fetchEmployeeDocs(),
            fetchEmployees()
        ])
        setLoading(false)
    }

    const fetchCompanyDocs = async () => {
        try {
            const res = await fetch('/api/documents/company')
            const data = await res.json()
            if (Array.isArray(data)) setCompanyDocs(data)
        } catch (error) {
            console.error('Error fetching company documents:', error)
        }
    }

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/documents/templates')
            const data = await res.json()
            if (Array.isArray(data)) setTemplates(data)
        } catch (error) {
            console.error('Error fetching templates:', error)
        }
    }

    const fetchEmployeeDocs = async () => {
        try {
            const res = await fetch('/api/documents/employee')
            const data = await res.json()
            if (Array.isArray(data)) setEmployeeDocs(data)
        } catch (error) {
            console.error('Error fetching employee documents:', error)
        }
    }

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees')
            const data = await res.json()
            if (Array.isArray(data)) setEmployees(data)
        } catch (error) {
            console.error('Error fetching employees:', error)
        }
    }

    // Company Document handlers
    const handleCompanyDocSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingCompanyDoc
                ? `/api/documents/company/${editingCompanyDoc.id}`
                : '/api/documents/company'
            const method = editingCompanyDoc ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(companyDocForm)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(editingCompanyDoc ? 'Document updated' : 'Document created')
            setCompanyDocDialogOpen(false)
            resetCompanyDocForm()
            fetchCompanyDocs()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save document')
        }
    }

    const deleteCompanyDoc = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return
        try {
            await fetch(`/api/documents/company/${id}`, { method: 'DELETE' })
            toast.success('Document deleted')
            fetchCompanyDocs()
        } catch (error) {
            toast.error('Failed to delete document')
        }
    }

    const resetCompanyDocForm = () => {
        setCompanyDocForm({ title: '', description: '', category: 'POLICY', content: '', fileUrl: '' })
        setEditingCompanyDoc(null)
    }

    const editCompanyDoc = (doc: CompanyDocument) => {
        setEditingCompanyDoc(doc)
        setCompanyDocForm({
            title: doc.title,
            description: doc.description || '',
            category: doc.category,
            content: doc.content || '',
            fileUrl: doc.fileUrl || ''
        })
        setCompanyDocDialogOpen(true)
    }

    // Template handlers
    const handleTemplateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingTemplate
                ? `/api/documents/templates/${editingTemplate.id}`
                : '/api/documents/templates'
            const method = editingTemplate ? 'PUT' : 'POST'

            const variables = templateForm.variables
                ? templateForm.variables.split(',').map(v => v.trim())
                : []

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...templateForm, variables })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(editingTemplate ? 'Template updated' : 'Template created')
            setTemplateDialogOpen(false)
            resetTemplateForm()
            fetchTemplates()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save template')
        }
    }

    const deleteTemplate = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return
        try {
            await fetch(`/api/documents/templates/${id}`, { method: 'DELETE' })
            toast.success('Template deleted')
            fetchTemplates()
        } catch (error) {
            toast.error('Failed to delete template')
        }
    }

    const resetTemplateForm = () => {
        setTemplateForm({ name: '', description: '', content: '', variables: '' })
        setEditingTemplate(null)
    }

    const editTemplate = (template: LetterTemplate) => {
        setEditingTemplate(template)
        const variables = template.variables ? JSON.parse(template.variables).join(', ') : ''
        setTemplateForm({
            name: template.name,
            description: template.description || '',
            content: template.content,
            variables
        })
        setTemplateDialogOpen(true)
    }

    // Employee Document handlers
    const handleEmpDocSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingEmpDoc
                ? `/api/documents/employee/${editingEmpDoc.id}`
                : '/api/documents/employee'
            const method = editingEmpDoc ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empDocForm)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success(editingEmpDoc ? 'Document updated' : 'Document created')
            setEmpDocDialogOpen(false)
            resetEmpDocForm()
            fetchEmployeeDocs()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save document')
        }
    }

    const deleteEmpDoc = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return
        try {
            await fetch(`/api/documents/employee/${id}`, { method: 'DELETE' })
            toast.success('Document deleted')
            fetchEmployeeDocs()
        } catch (error) {
            toast.error('Failed to delete document')
        }
    }

    const resetEmpDocForm = () => {
        setEmpDocForm({ employeeId: '', title: '', docType: 'ID_PROOF', fileUrl: '', expiryDate: '', notes: '' })
        setEditingEmpDoc(null)
    }

    const editEmpDoc = (doc: EmployeeDocument) => {
        setEditingEmpDoc(doc)
        setEmpDocForm({
            employeeId: doc.employeeId,
            title: doc.title,
            docType: doc.docType,
            fileUrl: doc.fileUrl || '',
            expiryDate: doc.expiryDate ? doc.expiryDate.split('T')[0] : '',
            notes: doc.notes || ''
        })
        setEmpDocDialogOpen(true)
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
                <h1 className="text-3xl font-bold">Documents</h1>
                <p className="text-muted-foreground">Manage company policies, letter templates, and employee documents</p>
            </div>

            <Tabs defaultValue="company" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="company">Company Policies</TabsTrigger>
                    <TabsTrigger value="templates">Letter Templates</TabsTrigger>
                    <TabsTrigger value="employee">Employee Documents</TabsTrigger>
                </TabsList>

                {/* Company Policies Tab */}
                <TabsContent value="company" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={companyDocDialogOpen} onOpenChange={(open) => {
                            setCompanyDocDialogOpen(open)
                            if (!open) resetCompanyDocForm()
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Document
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingCompanyDoc ? 'Edit Document' : 'Add Company Document'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCompanyDocSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title *</Label>
                                            <Input
                                                id="title"
                                                value={companyDocForm.title}
                                                onChange={(e) => setCompanyDocForm({ ...companyDocForm, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={companyDocForm.category}
                                                onValueChange={(value) => setCompanyDocForm({ ...companyDocForm, category: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DOC_CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            id="description"
                                            value={companyDocForm.description}
                                            onChange={(e) => setCompanyDocForm({ ...companyDocForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Content</Label>
                                        <Textarea
                                            id="content"
                                            value={companyDocForm.content}
                                            onChange={(e) => setCompanyDocForm({ ...companyDocForm, content: e.target.value })}
                                            rows={6}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fileUrl">File URL</Label>
                                        <Input
                                            id="fileUrl"
                                            value={companyDocForm.fileUrl}
                                            onChange={(e) => setCompanyDocForm({ ...companyDocForm, fileUrl: e.target.value })}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">
                                            {editingCompanyDoc ? 'Update' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companyDocs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No company documents found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    companyDocs.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    {doc.title}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{doc.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {doc.description || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => editCompanyDoc(doc)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteCompanyDoc(doc.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Letter Templates Tab */}
                <TabsContent value="templates" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={templateDialogOpen} onOpenChange={(open) => {
                            setTemplateDialogOpen(open)
                            if (!open) resetTemplateForm()
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Template
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingTemplate ? 'Edit Template' : 'Add Letter Template'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleTemplateSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Template Name *</Label>
                                            <Input
                                                id="name"
                                                value={templateForm.name}
                                                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                                                placeholder="e.g., Offer Letter"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="variables">Variables (comma-separated)</Label>
                                            <Input
                                                id="variables"
                                                value={templateForm.variables}
                                                onChange={(e) => setTemplateForm({ ...templateForm, variables: e.target.value })}
                                                placeholder="employeeName, designation, salary"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="templateDesc">Description</Label>
                                        <Input
                                            id="templateDesc"
                                            value={templateForm.description}
                                            onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="templateContent">Content *</Label>
                                        <Textarea
                                            id="templateContent"
                                            value={templateForm.content}
                                            onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                                            rows={10}
                                            placeholder="Use {{variableName}} for placeholders"
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">
                                            {editingTemplate ? 'Update' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* View Template Dialog */}
                    <Dialog open={!!viewingTemplate} onOpenChange={(open) => !open && setViewingTemplate(null)}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{viewingTemplate?.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {viewingTemplate?.description && (
                                    <p className="text-muted-foreground">{viewingTemplate.description}</p>
                                )}
                                {viewingTemplate?.variables && (
                                    <div>
                                        <Label>Variables:</Label>
                                        <div className="flex gap-2 mt-1">
                                            {JSON.parse(viewingTemplate.variables).map((v: string) => (
                                                <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                                    {viewingTemplate?.content}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Template Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Variables</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            No templates found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    templates.map((template) => (
                                        <TableRow key={template.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <File className="h-4 w-4 text-muted-foreground" />
                                                    {template.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {template.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {template.variables ? (
                                                    <div className="flex gap-1 flex-wrap">
                                                        {JSON.parse(template.variables).slice(0, 3).map((v: string) => (
                                                            <Badge key={v} variant="secondary" className="text-xs">
                                                                {v}
                                                            </Badge>
                                                        ))}
                                                        {JSON.parse(template.variables).length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{JSON.parse(template.variables).length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => setViewingTemplate(template)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => editTemplate(template)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Employee Documents Tab */}
                <TabsContent value="employee" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={empDocDialogOpen} onOpenChange={(open) => {
                            setEmpDocDialogOpen(open)
                            if (!open) resetEmpDocForm()
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Document
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingEmpDoc ? 'Edit Document' : 'Add Employee Document'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleEmpDocSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="employee">Employee *</Label>
                                        <Select
                                            value={empDocForm.employeeId}
                                            onValueChange={(value) => setEmpDocForm({ ...empDocForm, employeeId: value })}
                                            disabled={!!editingEmpDoc}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="empDocTitle">Title *</Label>
                                            <Input
                                                id="empDocTitle"
                                                value={empDocForm.title}
                                                onChange={(e) => setEmpDocForm({ ...empDocForm, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="docType">Document Type *</Label>
                                            <Select
                                                value={empDocForm.docType}
                                                onValueChange={(value) => setEmpDocForm({ ...empDocForm, docType: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EMPLOYEE_DOC_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="empDocFileUrl">File URL</Label>
                                            <Input
                                                id="empDocFileUrl"
                                                value={empDocForm.fileUrl}
                                                onChange={(e) => setEmpDocForm({ ...empDocForm, fileUrl: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expiryDate">Expiry Date</Label>
                                            <Input
                                                id="expiryDate"
                                                type="date"
                                                value={empDocForm.expiryDate}
                                                onChange={(e) => setEmpDocForm({ ...empDocForm, expiryDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={empDocForm.notes}
                                            onChange={(e) => setEmpDocForm({ ...empDocForm, notes: e.target.value })}
                                            rows={3}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">
                                            {editingEmpDoc ? 'Update' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employeeDocs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No employee documents found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employeeDocs.map((doc) => (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                {doc.employee.firstName} {doc.employee.lastName}
                                                <span className="text-muted-foreground text-xs ml-1">
                                                    ({doc.employee.employeeId})
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">{doc.title}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {EMPLOYEE_DOC_TYPES.find(t => t.value === doc.docType)?.label || doc.docType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {doc.expiryDate
                                                    ? new Date(doc.expiryDate).toLocaleDateString()
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => editEmpDoc(doc)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteEmpDoc(doc.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
