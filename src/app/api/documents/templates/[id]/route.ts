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
        const template = await prisma.letterTemplate.findUnique({
            where: { id }
        })

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 })
        }

        return NextResponse.json(template)
    } catch (error: any) {
        console.error("GET Template Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch template" }, { status: 500 })
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
        const { name, description, content, variables, isActive } = body

        const template = await prisma.letterTemplate.update({
            where: { id },
            data: {
                name,
                description,
                content,
                variables: variables ? JSON.stringify(variables) : null,
                isActive
            }
        })

        return NextResponse.json(template)
    } catch (error: any) {
        console.error("PUT Template Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Template name already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to update template" }, { status: 500 })
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
        await prisma.letterTemplate.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE Template Error:", error.message)
        return NextResponse.json({ error: "Failed to delete template" }, { status: 500 })
    }
}
