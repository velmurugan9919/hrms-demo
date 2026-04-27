import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const leaveTypes = await prisma.leaveType.findMany({
            orderBy: { name: "asc" }
        })

        return NextResponse.json(leaveTypes)
    } catch (error: any) {
        console.error("GET Leave Types Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch leave types" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, description, daysPerYear, isPaid } = body

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        const leaveType = await prisma.leaveType.create({
            data: {
                name,
                description,
                daysPerYear: daysPerYear || 0,
                isPaid: isPaid ?? true
            }
        })

        return NextResponse.json(leaveType, { status: 201 })
    } catch (error: any) {
        console.error("POST Leave Type Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Leave type already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create leave type" }, { status: 500 })
    }
}
