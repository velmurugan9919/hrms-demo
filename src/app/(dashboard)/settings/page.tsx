'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Users, FileText, ChevronRight, Settings, BookOpen } from 'lucide-react'

const settingsMenu = [
    {
        title: 'Company Information',
        description: 'Company profile, contact details, and legal information',
        href: '/settings/company',
        icon: Building2,
        color: 'text-orange-500'
    },
    {
        title: 'User Management',
        description: 'Manage system users, roles and permissions',
        href: '/settings/users',
        icon: Users,
        color: 'text-blue-500'
    },
    {
        title: 'Documents & Templates',
        description: 'Letter templates, policies and company documents',
        href: '/settings/documents',
        icon: FileText,
        color: 'text-purple-500'
    },
    {
        title: 'Help & Documentation',
        description: 'How to use the application, login info, features guide',
        href: '/settings/help',
        icon: BookOpen,
        color: 'text-green-500'
    }
]

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="h-8 w-8" />
                    Settings
                </h1>
                <p className="text-muted-foreground">Manage company profile, users, and system settings</p>
            </div>

            {/* Settings Menu */}
            <div className="grid gap-4 md:grid-cols-2">
                {settingsMenu.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
                            <CardContent className="flex items-center gap-4 py-6">
                                <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
