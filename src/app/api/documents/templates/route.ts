import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const templates = await prisma.letterTemplate.findMany({
            orderBy: { name: "asc" }
        })
        return NextResponse.json(templates)
    } catch (error: any) {
        console.error("GET Templates Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, description, content, variables } = body

        if (!name || !content) {
            return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
        }

        const template = await prisma.letterTemplate.create({
            data: {
                name,
                description,
                content,
                variables: variables ? JSON.stringify(variables) : null
            }
        })

        return NextResponse.json(template, { status: 201 })
    } catch (error: any) {
        console.error("POST Template Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Template name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
    }
}
