import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await verifyToken(token)

        // Mock Data
        const payrolls = [
            {
                id: 101,
                month: 11, // December
                year: 2024,
                baseWage: 50000,
                totalEarnings: 55000,
                totalDeductions: 5000,
                netPay: 50000,
                status: 'PAID',
                createdAt: new Date().toISOString()
            },
            {
                id: 102,
                month: 10, // November
                year: 2024,
                baseWage: 50000,
                totalEarnings: 55000,
                totalDeductions: 5000,
                netPay: 50000,
                status: 'PAID',
                createdAt: new Date().toISOString()
            },
            {
                id: 103,
                month: 9, // October
                year: 2024,
                baseWage: 50000,
                totalEarnings: 54000,
                totalDeductions: 4000,
                netPay: 50000,
                status: 'PAID',
                createdAt: new Date().toISOString()
            }
        ]

        return NextResponse.json({ payrolls })

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
