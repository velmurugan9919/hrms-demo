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
            nationality,
            maritalStatus,
            address,
            city,
            state,
            country,
            zipCode,
            // UAE Specific
            emiratesId,
            emiratesIdExpiry,
            passportNumber,
            passportExpiry,
            passportCountry,
            visaStatus,
            visaType,
            visaNumber,
            visaIssueDate,
            visaExpiryDate,
            laborCardNumber,
            laborCardExpiry,
            // Employment
            joiningDate,
            probationEndDate,
            contractType,
            contractEndDate,
            noticePeriodDays,
            // Bank Details
            bankName,
            bankBranch,
            accountNumber,
            iban,
            routingCode,
            // Emergency Contact
            emergencyName,
            emergencyRelation,
            emergencyPhone,
            // Salary Structure
            basicSalary,
            housingAllowance,
            transportAllowance,
            foodAllowance,
            phoneAllowance,
            otherAllowance,
            // Legacy
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

        // Calculate total salary
        const totalSalary = (Number(basicSalary) || 0) +
            (Number(housingAllowance) || 0) +
            (Number(transportAllowance) || 0) +
            (Number(foodAllowance) || 0) +
            (Number(phoneAllowance) || 0) +
            (Number(otherAllowance) || 0)

        const employee = await prisma.employee.create({
            data: {
                employeeId,
                firstName,
                lastName,
                email,
                phone,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                nationality,
                maritalStatus,
                address,
                city,
                state,
                country,
                zipCode,
                // UAE Specific
                emiratesId,
                emiratesIdExpiry: emiratesIdExpiry ? new Date(emiratesIdExpiry) : null,
                passportNumber,
                passportExpiry: passportExpiry ? new Date(passportExpiry) : null,
                passportCountry,
                visaStatus,
                visaType,
                visaNumber,
                visaIssueDate: visaIssueDate ? new Date(visaIssueDate) : null,
                visaExpiryDate: visaExpiryDate ? new Date(visaExpiryDate) : null,
                laborCardNumber,
                laborCardExpiry: laborCardExpiry ? new Date(laborCardExpiry) : null,
                // Employment
                joiningDate: new Date(joiningDate),
                probationEndDate: probationEndDate ? new Date(probationEndDate) : null,
                contractType: contractType || "LIMITED",
                contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
                noticePeriodDays: noticePeriodDays || 30,
                // Bank Details
                bankName,
                bankBranch,
                accountNumber,
                iban,
                routingCode,
                // Emergency Contact
                emergencyName,
                emergencyRelation,
                emergencyPhone,
                // Salary Structure
                basicSalary: basicSalary || null,
                housingAllowance: housingAllowance || null,
                transportAllowance: transportAllowance || null,
                foodAllowance: foodAllowance || null,
                phoneAllowance: phoneAllowance || null,
                otherAllowance: otherAllowance || null,
                totalSalary: totalSalary || null,
                salary: salary || totalSalary || null,
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
