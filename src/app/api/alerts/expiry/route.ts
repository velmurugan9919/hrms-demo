import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const alertDays = parseInt(searchParams.get("days") || "30")

        const today = new Date()
        const alertDate = new Date()
        alertDate.setDate(today.getDate() + alertDays)

        // Find employees with expiring documents
        const employees = await prisma.employee.findMany({
            where: {
                status: { in: ["ACTIVE", "PROBATION"] },
                OR: [
                    // Visa expiring
                    {
                        visaExpiryDate: {
                            lte: alertDate,
                            gte: today
                        }
                    },
                    // Emirates ID expiring
                    {
                        emiratesIdExpiry: {
                            lte: alertDate,
                            gte: today
                        }
                    },
                    // Labor Card expiring
                    {
                        laborCardExpiry: {
                            lte: alertDate,
                            gte: today
                        }
                    },
                    // Passport expiring
                    {
                        passportExpiry: {
                            lte: alertDate,
                            gte: today
                        }
                    },
                    // Already expired documents
                    {
                        visaExpiryDate: {
                            lt: today
                        }
                    },
                    {
                        emiratesIdExpiry: {
                            lt: today
                        }
                    },
                    {
                        laborCardExpiry: {
                            lt: today
                        }
                    },
                    {
                        passportExpiry: {
                            lt: today
                        }
                    }
                ]
            },
            select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                email: true,
                visaExpiryDate: true,
                emiratesIdExpiry: true,
                laborCardExpiry: true,
                passportExpiry: true,
                department: { select: { name: true } },
                designation: { select: { name: true } }
            },
            orderBy: [
                { visaExpiryDate: 'asc' }
            ]
        })

        // Process and categorize alerts
        const alerts: any[] = []

        employees.forEach(emp => {
            const name = `${emp.firstName} ${emp.lastName}`

            // Check Visa
            if (emp.visaExpiryDate) {
                const daysLeft = Math.floor((new Date(emp.visaExpiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                if (daysLeft <= alertDays) {
                    alerts.push({
                        id: `${emp.id}-visa`,
                        employeeId: emp.id,
                        employeeCode: emp.employeeId,
                        employeeName: name,
                        department: emp.department?.name,
                        type: 'VISA',
                        label: 'Visa',
                        expiryDate: emp.visaExpiryDate,
                        daysLeft,
                        status: daysLeft < 0 ? 'EXPIRED' : daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 14 ? 'WARNING' : 'ALERT',
                        icon: '🛂'
                    })
                }
            }

            // Check Emirates ID
            if (emp.emiratesIdExpiry) {
                const daysLeft = Math.floor((new Date(emp.emiratesIdExpiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                if (daysLeft <= alertDays) {
                    alerts.push({
                        id: `${emp.id}-eid`,
                        employeeId: emp.id,
                        employeeCode: emp.employeeId,
                        employeeName: name,
                        department: emp.department?.name,
                        type: 'EMIRATES_ID',
                        label: 'Emirates ID',
                        expiryDate: emp.emiratesIdExpiry,
                        daysLeft,
                        status: daysLeft < 0 ? 'EXPIRED' : daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 14 ? 'WARNING' : 'ALERT',
                        icon: '🪪'
                    })
                }
            }

            // Check Labor Card
            if (emp.laborCardExpiry) {
                const daysLeft = Math.floor((new Date(emp.laborCardExpiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                if (daysLeft <= alertDays) {
                    alerts.push({
                        id: `${emp.id}-labor`,
                        employeeId: emp.id,
                        employeeCode: emp.employeeId,
                        employeeName: name,
                        department: emp.department?.name,
                        type: 'LABOR_CARD',
                        label: 'Labor Card',
                        expiryDate: emp.laborCardExpiry,
                        daysLeft,
                        status: daysLeft < 0 ? 'EXPIRED' : daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 14 ? 'WARNING' : 'ALERT',
                        icon: '📋'
                    })
                }
            }

            // Check Passport
            if (emp.passportExpiry) {
                const daysLeft = Math.floor((new Date(emp.passportExpiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                if (daysLeft <= alertDays) {
                    alerts.push({
                        id: `${emp.id}-passport`,
                        employeeId: emp.id,
                        employeeCode: emp.employeeId,
                        employeeName: name,
                        department: emp.department?.name,
                        type: 'PASSPORT',
                        label: 'Passport',
                        expiryDate: emp.passportExpiry,
                        daysLeft,
                        status: daysLeft < 0 ? 'EXPIRED' : daysLeft <= 7 ? 'CRITICAL' : daysLeft <= 14 ? 'WARNING' : 'ALERT',
                        icon: '📕'
                    })
                }
            }
        })

        // Sort by days left (expired first, then by urgency)
        alerts.sort((a, b) => a.daysLeft - b.daysLeft)

        // Summary counts
        const summary = {
            total: alerts.length,
            expired: alerts.filter(a => a.status === 'EXPIRED').length,
            critical: alerts.filter(a => a.status === 'CRITICAL').length,
            warning: alerts.filter(a => a.status === 'WARNING').length,
            alert: alerts.filter(a => a.status === 'ALERT').length,
            byType: {
                visa: alerts.filter(a => a.type === 'VISA').length,
                emiratesId: alerts.filter(a => a.type === 'EMIRATES_ID').length,
                laborCard: alerts.filter(a => a.type === 'LABOR_CARD').length,
                passport: alerts.filter(a => a.type === 'PASSPORT').length
            }
        }

        return NextResponse.json({ alerts, summary, alertDays })
    } catch (error: any) {
        console.error("GET Expiry Alerts Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch expiry alerts" }, { status: 500 })
    }
}
