import { NextResponse } from "next/server"
import { prisma } from "@/lib/db.server"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        let profile = await prisma.companyProfile.findFirst()

        if (!profile) {
            profile = await prisma.companyProfile.create({
                data: {
                    companyName: "My Company"
                }
            })
        }

        return NextResponse.json(profile)
    } catch (error: any) {
        console.error("GET Settings Error:", error.message)
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const {
            companyName,
            companyNameAr,
            tradeLicense,
            address,
            addressAr,
            poBox,
            landline,
            mobile,
            email,
            website,
            logo,
            contactPerson,
            trn,
            laborOfficeCode,
            molEstablishmentId
        } = body

        if (!companyName) {
            return NextResponse.json({ error: "Company name is required" }, { status: 400 })
        }

        let profile = await prisma.companyProfile.findFirst()

        const data = {
            companyName,
            companyNameAr,
            tradeLicense,
            address,
            addressAr,
            poBox,
            landline,
            mobile,
            email,
            website,
            logo,
            contactPerson,
            trn,
            laborOfficeCode,
            molEstablishmentId
        }

        if (!profile) {
            profile = await prisma.companyProfile.create({ data })
        } else {
            profile = await prisma.companyProfile.update({
                where: { id: profile.id },
                data
            })
        }

        return NextResponse.json(profile)
    } catch (error: any) {
        console.error("PUT Settings Error:", error.message)
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }
}
