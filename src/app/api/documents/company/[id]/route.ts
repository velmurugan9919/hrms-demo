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
        const document = await prisma.companyDocument.findUnique({
            where: { id }
        })

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 })
        }

        return NextResponse.json(document)
    } catch (error: any) {
        console.error("GET Company Document Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
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
        const { title, description, category, content, fileUrl, isActive } = body

        const document = await prisma.companyDocument.update({
            where: { id },
            data: { title, description, category, content, fileUrl, isActive }
        })

        return NextResponse.json(document)
    } catch (error: any) {
        console.error("PUT Company Document Error:", error.message)
        return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
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
        await prisma.companyDocument.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE Company Document Error:", error.message)
        return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    }
}
