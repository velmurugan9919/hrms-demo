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
        const search = searchParams.get("search") || ""
        const departmentId = searchParams.get("departmentId")
        const status = searchParams.get("status")

        const where: any = {}

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { employeeId: { contains: search, mode: "insensitive" } }
            ]
        }

        if (departmentId) {
            where.departmentId = departmentId
        }

        if (status) {
            where.status = status
        }

        const employees = await prisma.employee.findMany({
            where,
            include: {
                department: true,
                designation: true
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(employees)
    } catch (error: any) {
        console.error("GET Employees Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            city,
            state,
            country,
            zipCode,
            joiningDate,
            salary,
            departmentId,
            designationId
        } = body

        if (!employeeId || !firstName || !lastName || !email || !joiningDate) {
            return NextResponse.json(
                { error: "Employee ID, first name, last name, email, and joining date are required" },
                { status: 400 }
            )
        }

        const employee = await prisma.employee.create({
            data: {
                employeeId,
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                address,
                city,
                state,
                country,
                zipCode,
                joiningDate: new Date(joiningDate),
                salary: salary || null,
                departmentId: departmentId || null,
                designationId: designationId || null
            },
            include: {
                department: true,
                designation: true
            }
        })

        return NextResponse.json(employee, { status: 201 })
    } catch (error: any) {
        console.error("POST Employee Error:", error.message)
        if (error.code === "P2002") {
            return NextResponse.json({ error: "Employee ID or email already exists" }, { status: 400 })
        }
        return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
    }
}
