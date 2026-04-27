import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: { employees: true }
                }
            },
            orderBy: { name: "asc" }
        })

        return NextResponse.json(departments)
    } catch (error: any) {
        console.error("GET Departments Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
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
            return NextResponse.json({ error: "Department name is required" }, { status: 400 })
        }

        const department = await prisma.department.create({
            data: { name, description }
        })

        return NextResponse.json(department, { status: 201 })
    } catch (error: any) {
        console.error("POST Department Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Department name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
    }
}
