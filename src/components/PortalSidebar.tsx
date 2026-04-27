'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    LogOut,
    CalendarDays,
    FileText,
    User,
    Clock
} from 'lucide-react'

const navigation = [
    { name: 'My Dashboard', href: '/portal', icon: LayoutDashboard },
    { name: 'My Attendance', href: '/portal/attendance', icon: Clock },
    { name: 'My Leaves', href: '/portal/leaves', icon: CalendarDays },
    { name: 'My Payslips', href: '/portal/payslips', icon: FileText },
    { name: 'My Profile', href: '/portal/profile', icon: User },
]

export function PortalSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full w-64 bg-gradient-to-b from-[#1e3a5f] to-[#0d2137] text-white">
            {/* Logo Section */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Employee</h1>
                        <p className="text-xs text-slate-400">Self Service Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/portal' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-200",
                                isActive && "scale-110"
                            )} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* Sign Out Section */}
            <div className="p-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                </Button>
            </div>

            {/* Footer Branding */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Powered by</p>
                    <a
                        href="https://mindvoxi.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all"
                    >
                        mindvoxi.com
                    </a>
                </div>
            </div>
        </div>
    )
}
