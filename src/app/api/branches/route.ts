import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const branches = await prisma.branch.findMany({
            include: {
                _count: {
                    select: { employees: true }
                }
            },
            orderBy: { name: "asc" }
        })

        return NextResponse.json(branches)
    } catch (error: any) {
        console.error("GET Branches Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, code, country, currency, address, city, state, phone, email } = body

        if (!name || !code || !country || !currency) {
            return NextResponse.json(
                { error: "Name, code, country, and currency are required" },
                { status: 400 }
            )
        }

        const branch = await prisma.branch.create({
            data: {
                name,
                code,
                country,
                currency,
                address,
                city,
                state,
                phone,
                email
            }
        })

        return NextResponse.json(branch, { status: 201 })
    } catch (error: any) {
        console.error("POST Branch Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "Branch with this name or code already exists" },
                { status: 400 }
            )
        }
        return NextResponse.json({ error: "Failed to create branch" }, { status: 500 })
    }
}
