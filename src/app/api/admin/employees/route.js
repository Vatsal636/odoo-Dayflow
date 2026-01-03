import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Helper to generate Employee ID
async function generateEmployeeId(firstName, lastName, joiningDate) {
    const year = new Date(joiningDate).getFullYear().toString()

    // Name parts (First 2 chars of First/Last, uppercase)
    const namePart = (
        (firstName.substring(0, 2) || "XX") +
        (lastName.substring(0, 2) || "XX")
    ).toUpperCase()

    // Serial Number Logic: Count employees joining in that specific year
    const startOfYear = new Date(`${year}-01-01`)
    const endOfYear = new Date(`${year}-12-31`)

    const count = await prisma.employeeDetails.count({
        where: {
            joiningDate: {
                gte: startOfYear,
                lte: endOfYear
            }
        }
    })

    // Format serial: count + 1, padded to 4 digits (e.g., 0001)
    const serial = (count + 1).toString().padStart(4, '0')

    return `OI${namePart}${year}${serial}`
}

export async function GET(request) {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'EMPLOYEE' },
            include: {
                details: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        const employees = users.map(u => ({
            id: u.id,
            name: u.details ? `${u.details.firstName} ${u.details.lastName}` : 'No Name',
            role: u.details?.jobTitle || 'Employee',
            employeeId: u.employeeId,
            department: u.details?.department || 'Unassigned',
            avatar: u.details?.profilePic,
            email: u.email
        }))

        return NextResponse.json({ employees })
    } catch (error) {
        console.error('Fetch employees error:', error)
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { firstName, lastName, email, jobTitle, department, joiningDate, phone, address } = body

        // 1. Generate Employee ID
        const employeeId = await generateEmployeeId(firstName, lastName, joiningDate)

        // 2. Generate Random Password (or fixed for initial setup, per requirement "generated and sent")
        const rawPassword = Math.random().toString(36).slice(-8) // 8 char random string
        const hashedPassword = await bcrypt.hash(rawPassword, 10)

        // 3. Create User & Details Transaction
        const verifyEmail = await prisma.user.findUnique({ where: { email } })
        if (verifyEmail) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
        }

        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    employeeId,
                    email,
                    password: hashedPassword,
                    role: 'EMPLOYEE',
                    firstLogin: true, // Force password change
                    details: {
                        create: {
                            firstName,
                            lastName,
                            jobTitle,
                            department,
                            joiningDate: new Date(joiningDate),
                            phone,
                            address
                        }
                    },
                    // Initialize empty Salary Structure to avoid null checks later? 
                    // Requirement says salary is manually entered. We can leave it null or init 0.
                }
            })
            return user
        })

        // 4. Mock Email Sending
        console.log(`[EMAIL MOCK] To: ${email}, Subject: Welcome to Dayflow`, {
            message: `Your login ID: ${employeeId}, Password: ${rawPassword}`
        })

        return NextResponse.json({
            success: true,
            user: newUser,
            debugPassword: rawPassword // Returning for dev convenience in specific scenarios
        })

    } catch (error) {
        console.error('Create employee error:', error)
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
    }
}
