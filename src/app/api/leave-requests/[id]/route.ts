import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        department: { select: { name: true } }
                    }
                },
                leaveType: true
            }
        })

        if (!leaveRequest) {
            return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
        }

        return NextResponse.json(leaveRequest)
    } catch (error: any) {
        console.error("GET Leave Request Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch leave request" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()
        const { approvalLevel, action, remarks } = body

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id },
            include: { leaveType: true }
        })

        if (!leaveRequest) {
            return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
        }

        const currentStatus = leaveRequest.status as string
        if (currentStatus === "APPROVED" || currentStatus === "REJECTED" || currentStatus === "CANCELLED") {
            return NextResponse.json(
                { error: "This request has already been processed" },
                { status: 400 }
            )
        }

        const approverName = session.user?.name || "Admin"
        const now = new Date()
        const updateData: any = {}

        if (approvalLevel === "TEAM_LEADER") {
            // Team Leader can only approve if status is PENDING
            if (currentStatus !== "PENDING") {
                return NextResponse.json(
                    { error: "Team Leader approval is not applicable at this stage" },
                    { status: 400 }
                )
            }

            if (action === "APPROVED") {
                updateData.teamLeaderStatus = "APPROVED"
                updateData.teamLeaderApprovedBy = approverName
                updateData.teamLeaderApprovedAt = now
                updateData.teamLeaderRemarks = remarks
                updateData.status = "TL_APPROVED"
            } else {
                updateData.teamLeaderStatus = "REJECTED"
                updateData.teamLeaderApprovedBy = approverName
                updateData.teamLeaderApprovedAt = now
                updateData.teamLeaderRemarks = remarks
                updateData.status = "REJECTED"
                updateData.rejectedReason = `Rejected by Team Leader: ${remarks || "No reason provided"}`
            }
        } else if (approvalLevel === "MANAGER") {
            // Manager can only approve if TL has approved
            if (currentStatus !== "TL_APPROVED") {
                return NextResponse.json(
                    { error: "Manager approval requires Team Leader approval first" },
                    { status: 400 }
                )
            }

            if (action === "APPROVED") {
                updateData.managerStatus = "APPROVED"
                updateData.managerApprovedBy = approverName
                updateData.managerApprovedAt = now
                updateData.managerRemarks = remarks
                updateData.status = "MANAGER_APPROVED"
            } else {
                updateData.managerStatus = "REJECTED"
                updateData.managerApprovedBy = approverName
                updateData.managerApprovedAt = now
                updateData.managerRemarks = remarks
                updateData.status = "REJECTED"
                updateData.rejectedReason = `Rejected by Manager: ${remarks || "No reason provided"}`
            }
        } else if (approvalLevel === "HR") {
            // HR can only approve if Manager has approved
            if (currentStatus !== "MANAGER_APPROVED") {
                return NextResponse.json(
                    { error: "HR approval requires Manager approval first" },
                    { status: 400 }
                )
            }

            if (action === "APPROVED") {
                updateData.hrStatus = "APPROVED"
                updateData.hrApprovedBy = approverName
                updateData.hrApprovedAt = now
                updateData.hrRemarks = remarks
                updateData.status = "APPROVED"

                // Update leave balance when fully approved
                const currentYear = new Date().getFullYear()
                await prisma.leaveBalance.upsert({
                    where: {
                        employeeId_leaveTypeId_year: {
                            employeeId: leaveRequest.employeeId,
                            leaveTypeId: leaveRequest.leaveTypeId,
                            year: currentYear
                        }
                    },
                    update: {
                        usedDays: { increment: leaveRequest.totalDays }
                    },
                    create: {
                        employeeId: leaveRequest.employeeId,
                        leaveTypeId: leaveRequest.leaveTypeId,
                        year: currentYear,
                        totalDays: leaveRequest.leaveType.daysPerYear,
                        usedDays: leaveRequest.totalDays
                    }
                })

                // Mark attendance as ON_LEAVE
                const currentDate = new Date(leaveRequest.startDate)
                while (currentDate <= leaveRequest.endDate) {
                    const dayOfWeek = currentDate.getDay()
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        await prisma.attendance.upsert({
                            where: {
                                employeeId_date: {
                                    employeeId: leaveRequest.employeeId,
                                    date: new Date(currentDate)
                                }
                            },
                            update: { status: "ON_LEAVE" },
                            create: {
                                employeeId: leaveRequest.employeeId,
                                date: new Date(currentDate),
                                status: "ON_LEAVE"
                            }
                        })
                    }
                    currentDate.setDate(currentDate.getDate() + 1)
                }
            } else {
                updateData.hrStatus = "REJECTED"
                updateData.hrApprovedBy = approverName
                updateData.hrApprovedAt = now
                updateData.hrRemarks = remarks
                updateData.status = "REJECTED"
                updateData.rejectedReason = `Rejected by HR: ${remarks || "No reason provided"}`
            }
        } else {
            return NextResponse.json({ error: "Invalid approval level" }, { status: 400 })
        }

        const updated = await prisma.leaveRequest.update({
            where: { id },
            data: updateData,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                leaveType: true
            }
        })

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error("PUT Leave Request Error:", error.message)
        return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        })

        if (!leaveRequest) {
            return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
        }

        if (leaveRequest.status !== "PENDING") {
            return NextResponse.json(
                { error: "Only pending requests can be cancelled" },
                { status: 400 }
            )
        }

        await prisma.leaveRequest.update({
            where: { id },
            data: { status: "CANCELLED" }
        })

        return NextResponse.json({ message: "Leave request cancelled" })
    } catch (error: any) {
        console.error("DELETE Leave Request Error:", error.message)
        return NextResponse.json({ error: "Failed to cancel leave request" }, { status: 500 })
    }
}
