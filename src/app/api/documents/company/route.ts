import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const documents = await prisma.companyDocument.findMany({
            orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(documents)
    } catch (error: any) {
        console.error("GET Company Documents Error:", error.message)
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
        const { title, description, category, content, fileUrl } = body

        if (!title || !category) {
            return NextResponse.json({ error: "Title and category are required" }, { status: 400 })
        }

        const document = await prisma.companyDocument.create({
            data: { title, description, category, content, fileUrl }
        })

        return NextResponse.json(document, { status: 201 })
    } catch (error: any) {
        console.error("POST Company Document Error:", error.message)
        return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
    }
}
