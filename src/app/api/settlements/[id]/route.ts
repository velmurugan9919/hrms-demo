import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const settlement = await prisma.finalSettlement.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        department: { select: { name: true } },
                        designation: { select: { name: true } },
                        contractType: true,
                        terminationType: true,
                        terminationReason: true,
                        bankName: true,
                        accountNumber: true,
                        iban: true
                    }
                }
            }
        })

        if (!settlement) {
            return NextResponse.json({ error: "Settlement not found" }, { status: 404 })
        }

        return NextResponse.json(settlement)
    } catch (error: any) {
        console.error("GET Settlement Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch settlement" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()

        const settlement = await prisma.finalSettlement.findUnique({
            where: { id }
        })

        if (!settlement) {
            return NextResponse.json({ error: "Settlement not found" }, { status: 404 })
        }

        // Handle status changes
        if (body.action) {
            const updateData: any = {}

            switch (body.action) {
                case "APPROVE":
                    if (settlement.status !== "PENDING_APPROVAL") {
                        return NextResponse.json({ error: "Settlement must be pending approval" }, { status: 400 })
                    }
                    updateData.status = "APPROVED"
                    updateData.approvedBy = session.user?.name || "System"
                    updateData.approvedAt = new Date()
                    break

                case "SUBMIT":
                    if (settlement.status !== "DRAFT") {
                        return NextResponse.json({ error: "Only draft settlements can be submitted" }, { status: 400 })
                    }
                    updateData.status = "PENDING_APPROVAL"
                    updateData.preparedBy = session.user?.name || "System"
                    updateData.preparedAt = new Date()
                    break

                case "PAY":
                    if (settlement.status !== "APPROVED") {
                        return NextResponse.json({ error: "Settlement must be approved before payment" }, { status: 400 })
                    }
                    updateData.status = "PAID"
                    updateData.paidAt = new Date()
                    break

                case "CANCEL":
                    if (settlement.status === "PAID") {
                        return NextResponse.json({ error: "Paid settlements cannot be cancelled" }, { status: 400 })
                    }
                    updateData.status = "CANCELLED"
                    break

                default:
                    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
            }

            const updated = await prisma.finalSettlement.update({
                where: { id },
                data: updateData,
                include: {
                    employee: {
                        select: {
                            id: true,
                            employeeId: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })

            return NextResponse.json(updated)
        }

        // Regular update for draft settlements
        if (settlement.status !== "DRAFT") {
            return NextResponse.json({ error: "Only draft settlements can be edited" }, { status: 400 })
        }

        // Recalculate totals
        const totalEarnings = (Number(body.gratuityAmount) || Number(settlement.gratuityAmount)) +
            (Number(body.leaveEncashment) || Number(settlement.leaveEncashment)) +
            (Number(body.noticePeriodPayable) || Number(settlement.noticePeriodPayable)) +
            (Number(body.airfareAllowance) || Number(settlement.airfareAllowance)) +
            (Number(body.bonusOrIncentive) || Number(settlement.bonusOrIncentive)) +
            (Number(body.otherPayments) || Number(settlement.otherPayments))

        const totalDeductions = (Number(body.noticePeriodDeduction) || Number(settlement.noticePeriodDeduction)) +
            (Number(body.loanBalance) || Number(settlement.loanBalance)) +
            (Number(body.advanceBalance) || Number(settlement.advanceBalance)) +
            (Number(body.otherDeductions) || Number(settlement.otherDeductions))

        const netSettlement = totalEarnings - totalDeductions

        const updated = await prisma.finalSettlement.update({
            where: { id },
            data: {
                ...body,
                totalEarnings,
                totalDeductions,
                netSettlement
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error("PUT Settlement Error:", error.message)
        return NextResponse.json({ error: "Failed to update settlement" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const settlement = await prisma.finalSettlement.findUnique({
            where: { id }
        })

        if (!settlement) {
            return NextResponse.json({ error: "Settlement not found" }, { status: 404 })
        }

        if (settlement.status !== "DRAFT" && settlement.status !== "CANCELLED") {
            return NextResponse.json({ error: "Only draft or cancelled settlements can be deleted" }, { status: 400 })
        }

        await prisma.finalSettlement.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE Settlement Error:", error.message)
        return NextResponse.json({ error: "Failed to delete settlement" }, { status: 500 })
    }
}
