import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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
