import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const designations = await prisma.designation.findMany({
            include: {
                _count: {
                    select: { employees: true }
                }
            },
            orderBy: { name: "asc" }
        })

        return NextResponse.json(designations)
    } catch (error: any) {
        console.error("GET Designations Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch designations" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, description } = body

        if (!name) {
            return NextResponse.json({ error: "Designation name is required" }, { status: 400 })
        }

        const designation = await prisma.designation.create({
            data: { name, description }
        })

        return NextResponse.json(designation, { status: 201 })
    } catch (error: any) {
        console.error("POST Designation Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Designation name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create designation" }, { status: 500 })
    }
}
