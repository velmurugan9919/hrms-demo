'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2, Phone, Mail, Globe, User, Save, MapPin, FileText, Hash } from 'lucide-react'
import { toast } from 'sonner'

export default function CompanyPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        companyName: '',
        companyNameAr: '',
        tradeLicense: '',
        address: '',
        addressAr: '',
        poBox: '',
        landline: '',
        mobile: '',
        email: '',
        website: '',
        contactPerson: '',
        trn: '',
        laborOfficeCode: '',
        molEstablishmentId: ''
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings')
            const data = await res.json()
            if (data && !data.error) {
                setFormData({
                    companyName: data.companyName || '',
                    companyNameAr: data.companyNameAr || '',
                    tradeLicense: data.tradeLicense || '',
                    address: data.address || '',
                    addressAr: data.addressAr || '',
                    poBox: data.poBox || '',
                    landline: data.landline || '',
                    mobile: data.mobile || '',
                    email: data.email || '',
                    website: data.website || '',
                    contactPerson: data.contactPerson || '',
                    trn: data.trn || '',
                    laborOfficeCode: data.laborOfficeCode || '',
                    molEstablishmentId: data.molEstablishmentId || ''
                })
            }
        } catch (error) {
            toast.error('Failed to load company settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            toast.success('Company information saved successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to save company information')
        } finally {
            setSaving(false)
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
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Building2 className="h-8 w-8" />
                    Company Information
                </h1>
                <p className="text-muted-foreground">Manage company profile, contact details, and legal information</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>Company name and branding</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name (English) *</Label>
                                <Input
                                    id="companyName"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    placeholder="Enter company name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyNameAr">Company Name (Arabic)</Label>
                                <Input
                                    id="companyNameAr"
                                    value={formData.companyNameAr}
                                    onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                                    placeholder="اسم الشركة بالعربية"
                                    dir="rtl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tradeLicense">Trade License Number</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="tradeLicense"
                                        value={formData.tradeLicense}
                                        onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                                        placeholder="Enter trade license number"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contact Details
                            </CardTitle>
                            <CardDescription>Phone numbers and email</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactPerson">Contact Person</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        placeholder="Enter contact person name"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="landline">Landline</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="landline"
                                            value={formData.landline}
                                            onChange={(e) => setFormData({ ...formData, landline: e.target.value })}
                                            placeholder="+971 4 XXX XXXX"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile">Mobile</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="mobile"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="+971 50 XXX XXXX"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="info@company.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="website"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        placeholder="https://www.company.com"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Address
                            </CardTitle>
                            <CardDescription>Company location details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="address">Address (English)</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter company address"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressAr">Address (Arabic)</Label>
                                <Textarea
                                    id="addressAr"
                                    value={formData.addressAr}
                                    onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                                    placeholder="العنوان بالعربية"
                                    rows={3}
                                    dir="rtl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="poBox">P.O. Box</Label>
                                <Input
                                    id="poBox"
                                    value={formData.poBox}
                                    onChange={(e) => setFormData({ ...formData, poBox: e.target.value })}
                                    placeholder="P.O. Box number"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* UAE Legal Information */}
                    <Card className="border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-700">
                                <Hash className="h-5 w-5" />
                                UAE Legal Information
                            </CardTitle>
                            <CardDescription>Government registration details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="trn">TRN (Tax Registration Number)</Label>
                                <Input
                                    id="trn"
                                    value={formData.trn}
                                    onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                                    placeholder="100XXXXXXXXX"
                                    maxLength={15}
                                />
                                <p className="text-xs text-muted-foreground">15-digit VAT registration number</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="laborOfficeCode">Labor Office Code</Label>
                                <Input
                                    id="laborOfficeCode"
                                    value={formData.laborOfficeCode}
                                    onChange={(e) => setFormData({ ...formData, laborOfficeCode: e.target.value })}
                                    placeholder="Enter labor office code"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="molEstablishmentId">MOL Establishment ID</Label>
                                <Input
                                    id="molEstablishmentId"
                                    value={formData.molEstablishmentId}
                                    onChange={(e) => setFormData({ ...formData, molEstablishmentId: e.target.value })}
                                    placeholder="Ministry of Labor establishment ID"
                                />
                                <p className="text-xs text-muted-foreground">Required for WPS compliance</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={saving} size="lg">
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Company Information'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
