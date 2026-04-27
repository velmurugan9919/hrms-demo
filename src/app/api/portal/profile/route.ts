import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const employee = await prisma.employee.findUnique({
            where: { email: session.user.email },
            include: {
                department: true,
                designation: true
            }
        })

        if (!employee) {
            return NextResponse.json({ error: "Employee not found" }, { status: 404 })
        }

        return NextResponse.json(employee)
    } catch (error: any) {
        console.error("GET Portal Profile Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}
