import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create admin user
    const adminPassword = await hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@hrms.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@hrms.com',
            password: adminPassword,
            role: 'ADMIN'
        }
    })
    console.log('Admin user created:', admin.email)

    // Create departments
    const departments = [
        { name: 'Engineering', description: 'Software development and engineering' },
        { name: 'Human Resources', description: 'HR and people operations' },
        { name: 'Finance', description: 'Finance and accounting' },
        { name: 'Marketing', description: 'Marketing and communications' },
        { name: 'Sales', description: 'Sales and business development' },
    ]

    for (const dept of departments) {
        await prisma.department.upsert({
            where: { name: dept.name },
            update: {},
            create: dept
        })
    }
    console.log('Departments created')

    // Create designations
    const designations = [
        { name: 'Software Engineer', description: 'Develops software applications' },
        { name: 'Senior Software Engineer', description: 'Senior developer with leadership responsibilities' },
        { name: 'Project Manager', description: 'Manages project deliverables and timelines' },
        { name: 'HR Manager', description: 'Manages human resources operations' },
        { name: 'Accountant', description: 'Handles financial records and reporting' },
        { name: 'Sales Executive', description: 'Handles sales and client relations' },
    ]

    for (const desig of designations) {
        await prisma.designation.upsert({
            where: { name: desig.name },
            update: {},
            create: desig
        })
    }
    console.log('Designations created')

    // Create leave types
    const leaveTypes = [
        { name: 'Annual Leave', description: 'Yearly vacation leave', daysPerYear: 21, isPaid: true },
        { name: 'Sick Leave', description: 'Medical/health related leave', daysPerYear: 10, isPaid: true },
        { name: 'Casual Leave', description: 'Personal/emergency leave', daysPerYear: 5, isPaid: true },
        { name: 'Maternity Leave', description: 'Leave for new mothers', daysPerYear: 45, isPaid: true },
        { name: 'Paternity Leave', description: 'Leave for new fathers', daysPerYear: 5, isPaid: true },
        { name: 'Unpaid Leave', description: 'Leave without pay', daysPerYear: 30, isPaid: false },
    ]

    for (const lt of leaveTypes) {
        await prisma.leaveType.upsert({
            where: { name: lt.name },
            update: {},
            create: lt
        })
    }
    console.log('Leave types created')

    console.log('Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
