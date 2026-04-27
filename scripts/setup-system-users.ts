import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Setting up system users...')

    // System accounts that should be hidden from user lists
    const systemUsers = [
        {
            email: 'superadmin@hrms.system',
            name: 'Super Admin',
            password: 'admin123',
            role: 'SUPER_ADMIN' as const,
            isSystem: true
        },
        {
            email: 'dev@mindvoxi.com',
            name: 'Developer',
            password: '22we#$%',
            role: 'DEVELOPER' as const,
            isSystem: true
        }
    ]

    for (const user of systemUsers) {
        const hashedPassword = await hash(user.password, 10)

        const existing = await prisma.user.findUnique({
            where: { email: user.email }
        })

        if (existing) {
            // Update existing user to be system user
            await prisma.user.update({
                where: { email: user.email },
                data: {
                    name: user.name,
                    password: hashedPassword,
                    role: user.role,
                    isSystem: true
                }
            })
            console.log(`Updated system user: ${user.email}`)
        } else {
            // Create new system user
            await prisma.user.create({
                data: {
                    email: user.email,
                    name: user.name,
                    password: hashedPassword,
                    role: user.role,
                    isSystem: true
                }
            })
            console.log(`Created system user: ${user.email}`)
        }
    }

    // Also mark any existing admin@hrms.com as system user if it exists
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@hrms.com' }
    })

    if (adminUser) {
        await prisma.user.update({
            where: { email: 'admin@hrms.com' },
            data: { isSystem: true }
        })
        console.log('Marked admin@hrms.com as system user')
    }

    console.log('\nSystem users setup complete!')
    console.log('\nSystem accounts (hidden from user lists):')
    console.log('- superadmin@hrms.system / admin123 (SUPER_ADMIN)')
    console.log('- dev@mindvoxi.com / 22we#$% (DEVELOPER)')
    console.log('- admin@hrms.com (if exists)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
