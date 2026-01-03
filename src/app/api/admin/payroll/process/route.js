import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = await verifyToken(token)
        if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const body = await request.json()
        const { month, year } = body // month is 0-indexed (0=Jan)

        if (month === undefined || !year) {
            return NextResponse.json({ error: 'Month and Year required' }, { status: 400 })
        }

        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)
        const daysInMonth = endDate.getDate()

        // 1. Fetch all employees (even those without defined salary)
        const employees = await prisma.user.findMany({
            where: { role: 'EMPLOYEE' },
            include: {
                salary: true,
                details: true
            }
        })

        const payrolls = []

        for (const emp of employees) {
            // Default salary if not defined
            let salary = emp.salary
            if (!salary) {
                const wage = 50000
                salary = {
                    wage: wage,
                    netSalary: wage - (wage * 0.5 * 0.12) - 200, // Approx fallback
                    pf: wage * 0.5 * 0.12,
                    profTax: 200
                }
            }

            // 2. Fetch Attendance Count
            const attendanceCount = await prisma.attendance.count({
                where: {
                    userId: emp.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: { in: ['PRESENT', 'HALF_DAY'] }
                }
            })

            // 3. Count Sundays (Auto-paid)
            let sundays = 0
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d)
                if (date.getDay() === 0) sundays++
            }

            const payableDays = Math.min(attendanceCount + sundays, daysInMonth)

            // 4. Calculate Payout
            const baseNet = salary.netSalary
            const perDayPay = baseNet / daysInMonth
            const finalNetPay = Math.round(perDayPay * payableDays)

            // Validating numbers to avoid NaN
            const safeBaseNet = baseNet || 0
            const safeFinalNet = finalNetPay || 0
            const safePF = salary.pf || 0
            const safeProfTax = salary.profTax || 0

            const totalDeductions = Math.round(safePF + safeProfTax + (safeBaseNet - safeFinalNet))

            // Delete old record for this month
            await prisma.payroll.deleteMany({
                where: { userId: emp.id, month: parseInt(month), year: parseInt(year) }
            })

            const newPayroll = await prisma.payroll.create({
                data: {
                    userId: emp.id,
                    month: parseInt(month),
                    year: parseInt(year),
                    baseWage: salary.wage,
                    totalEarnings: safeBaseNet + safePF + safeProfTax, // Gross estimation
                    totalDeductions: totalDeductions,
                    netPay: safeFinalNet,
                    status: 'GENERATED'
                }
            })

            payrolls.push({
                ...newPayroll,
                name: emp.details?.firstName + ' ' + emp.details?.lastName,
                employeeId: emp.employeeId,
                payableDays,
                daysInMonth
            })
        }

        return NextResponse.json({ success: true, payrolls })

    } catch (e) {
        console.error("Payroll processing error:", e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
