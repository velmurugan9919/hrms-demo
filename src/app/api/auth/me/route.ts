import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                employeeId: true
            }
        })

        if (!user) {
            // Check if this email belongs to an employee (for employee login)
            const employee = await prisma.employee.findUnique({
                where: { email: session.user.email }
            })

            if (employee) {
                return NextResponse.json({
                    id: employee.id,
                    name: `${employee.firstName} ${employee.lastName}`,
                    email: employee.email,
                    role: "USER",
                    isEmployee: true
                })
            }

            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error: any) {
        console.error("GET Auth Me Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }
}
