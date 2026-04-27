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
        const document = await prisma.employeeDocument.findUnique({
            where: { id },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                }
            }
        })

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 })
        }

        return NextResponse.json(document)
    } catch (error: any) {
        console.error("GET Employee Document Error:", error.message)
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
        const { title, docType, fileUrl, expiryDate, notes } = body

        const document = await prisma.employeeDocument.update({
            where: { id },
            data: {
                title,
                docType,
                fileUrl,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                notes
            },
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                }
            }
        })

        return NextResponse.json(document)
    } catch (error: any) {
        console.error("PUT Employee Document Error:", error.message)
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
        await prisma.employeeDocument.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE Employee Document Error:", error.message)
        return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
    }
}
