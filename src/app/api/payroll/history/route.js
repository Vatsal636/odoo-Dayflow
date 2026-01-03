import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = await verifyToken(token) // User ID is payload.id

        const payrolls = await prisma.payroll.findMany({
            where: {
                userId: payload.id,
                status: { not: 'DRAFT' } // Assuming we might have draft later, but current logic uses GENERATED
            },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        })

        return NextResponse.json({ payrolls })

    } catch (e) {
        console.error("Fetch payroll error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
