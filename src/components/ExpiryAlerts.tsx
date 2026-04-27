'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    AlertTriangle,
    Bell,
    Calendar,
    ChevronRight,
    Settings2,
    XCircle,
    AlertCircle,
    Clock
} from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover'

interface Alert {
    id: string
    employeeId: string
    employeeCode: string
    employeeName: string
    department?: string
    type: string
    label: string
    expiryDate: string
    daysLeft: number
    status: 'EXPIRED' | 'CRITICAL' | 'WARNING' | 'ALERT'
    icon: string
}

interface Summary {
    total: number
    expired: number
    critical: number
    warning: number
    alert: number
    byType: {
        visa: number
        emiratesId: number
        laborCard: number
        passport: number
    }
}

const STATUS_STYLES = {
    EXPIRED: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        badge: 'bg-red-500',
        icon: XCircle
    },
    CRITICAL: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        badge: 'bg-red-400',
        icon: AlertTriangle
    },
    WARNING: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        badge: 'bg-yellow-500',
        icon: AlertCircle
    },
    ALERT: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-400',
        icon: Clock
    }
}

export function ExpiryAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [summary, setSummary] = useState<Summary | null>(null)
    const [loading, setLoading] = useState(true)
    const [alertDays, setAlertDays] = useState(30)
    const [tempDays, setTempDays] = useState(30)

    useEffect(() => {
        // Load saved alert days from localStorage
        const savedDays = localStorage.getItem('hrms-alert-days')
        if (savedDays) {
            const days = parseInt(savedDays)
            setAlertDays(days)
            setTempDays(days)
        }
        fetchAlerts(savedDays ? parseInt(savedDays) : 30)
    }, [])

    const fetchAlerts = async (days: number) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/alerts/expiry?days=${days}`)
            const data = await res.json()
            if (data.alerts) {
                setAlerts(data.alerts)
                setSummary(data.summary)
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDays = () => {
        setAlertDays(tempDays)
        localStorage.setItem('hrms-alert-days', tempDays.toString())
        fetchAlerts(tempDays)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getDaysText = (days: number) => {
        if (days < 0) return `${Math.abs(days)} days ago`
        if (days === 0) return 'Today'
        if (days === 1) return '1 day left'
        return `${days} days left`
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Document Expiry Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        Loading alerts...
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={summary && summary.expired > 0 ? 'border-red-300 shadow-red-100' : ''}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className={`h-5 w-5 ${summary && summary.total > 0 ? 'text-orange-500 animate-pulse' : ''}`} />
                        <CardTitle>Document Expiry Alerts</CardTitle>
                        {summary && summary.total > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {summary.total}
                            </Badge>
                        )}
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72" align="end">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Alert Settings</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Configure when to receive expiry alerts
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alert-days">Alert Days Before Expiry</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="alert-days"
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={tempDays}
                                            onChange={(e) => setTempDays(parseInt(e.target.value) || 30)}
                                            className="w-20"
                                        />
                                        <span className="flex items-center text-sm text-muted-foreground">days</span>
                                    </div>
                                </div>
                                <Button onClick={handleSaveDays} className="w-full">
                                    Save & Refresh
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Current setting: Alert {alertDays} days before expiry
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <CardDescription>
                    Documents expiring within {alertDays} days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                {summary && summary.total > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className={`p-2 rounded-lg text-center ${summary.expired > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                            <div className={`text-lg font-bold ${summary.expired > 0 ? 'text-red-600' : ''}`}>
                                {summary.expired}
                            </div>
                            <div className="text-xs text-muted-foreground">Expired</div>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${summary.critical > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-muted'}`}>
                            <div className={`text-lg font-bold ${summary.critical > 0 ? 'text-red-500' : ''}`}>
                                {summary.critical}
                            </div>
                            <div className="text-xs text-muted-foreground">{"< 7 days"}</div>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${summary.warning > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-muted'}`}>
                            <div className={`text-lg font-bold ${summary.warning > 0 ? 'text-yellow-600' : ''}`}>
                                {summary.warning}
                            </div>
                            <div className="text-xs text-muted-foreground">{"< 14 days"}</div>
                        </div>
                        <div className={`p-2 rounded-lg text-center ${summary.alert > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-muted'}`}>
                            <div className={`text-lg font-bold ${summary.alert > 0 ? 'text-blue-600' : ''}`}>
                                {summary.alert}
                            </div>
                            <div className="text-xs text-muted-foreground">{"< " + alertDays + " days"}</div>
                        </div>
                    </div>
                )}

                {/* Alert List */}
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                            <span className="text-2xl">✅</span>
                        </div>
                        <p className="font-medium text-green-600">All Clear!</p>
                        <p className="text-sm text-muted-foreground">
                            No documents expiring within {alertDays} days
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                            {alerts.map((alert) => {
                                const style = STATUS_STYLES[alert.status]
                                const StatusIcon = style.icon
                                return (
                                    <Link
                                        key={alert.id}
                                        href={`/employees/${alert.employeeId}`}
                                        className={`block p-3 rounded-lg ${style.bg} hover:opacity-80 transition-opacity`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3">
                                                <div className="text-2xl">{alert.icon}</div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{alert.employeeName}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {alert.employeeCode}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {alert.department || 'No Department'}
                                                    </div>
                                                    <div className={`text-sm font-medium ${style.text} mt-1`}>
                                                        {alert.label} - {formatDate(alert.expiryDate)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge className={`${style.badge} text-white`}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {getDaysText(alert.daysLeft)}
                                                </Badge>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* Type Summary */}
                {summary && summary.total > 0 && (
                    <div className="flex gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span>🛂</span>
                            <span>Visa: {summary.byType.visa}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🪪</span>
                            <span>EID: {summary.byType.emiratesId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>📋</span>
                            <span>Labor: {summary.byType.laborCard}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>📕</span>
                            <span>Passport: {summary.byType.passport}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
