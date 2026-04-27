import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(req.url)
        const employeeId = searchParams.get("employeeId")

        const where = employeeId ? { employeeId } : {}

        const documents = await prisma.employeeDocument.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(documents)
    } catch (error: any) {
        console.error("GET Employee Documents Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { employeeId, title, docType, fileUrl, expiryDate, notes } = body

        if (!employeeId || !title || !docType) {
            return NextResponse.json({ error: "Employee, title, and document type are required" }, { status: 400 })
        }

        const document = await prisma.employeeDocument.create({
            data: {
                employeeId,
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

        return NextResponse.json(document, { status: 201 })
    } catch (error: any) {
        console.error("POST Employee Document Error:", error.message)
        return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
    }
}
