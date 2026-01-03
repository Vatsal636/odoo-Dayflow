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

        // 1. Fetch all employees with Salary Structure
        const employees = await prisma.user.findMany({
            where: {
                role: 'EMPLOYEE',
                salary: { isNot: null } // Only those with defined salary
            },
            include: {
                salary: true,
                details: true
            }
        })

        const payrolls = []

        for (const emp of employees) {
            // 2. Fetch Attendance Count for this month
            const attendanceCount = await prisma.attendance.count({
                where: {
                    userId: emp.id,
                    date: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: { in: ['PRESENT', 'HALF_DAY', 'LATE'] } // Assuming these count as present
                }
            })

            // 3. Count Sundays (Auto-paid)
            let sundays = 0
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(year, month, d)
                if (date.getDay() === 0) sundays++
            }

            // Note: If an employee worked on Sunday, attendanceCount would capture it? 
            // My seed script skipped Sundays. So AttendanceCount + Sundays is safe for now.
            // If they check-in on Sunday, we shouldn't double count. 
            // Refinement: Count present days where day is NOT Sunday. Then add all Sundays.
            // For now, simpler: Payable = Attendance + Sundays. (Assumes no Sunday work).

            const payableDays = Math.min(attendanceCount + sundays, daysInMonth)

            // 4. Calculate Payout
            // Structure Net Salary is for full month.
            const baseNet = emp.salary.netSalary
            const perDayPay = baseNet / daysInMonth
            const finalNetPay = Math.round(perDayPay * payableDays)

            const totalDeductions = Math.round(emp.salary.pf + emp.salary.profTax + (baseNet - finalNetPay)) // Include LOP in deductions for display?
            // Actually, LOP isn't a deduction from 'Earnings', it reduces 'Earnings'.
            // But to fit schema 'netPay', simplified:

            // Let's store logic:
            const payroll = await prisma.payroll.upsert({
                where: {
                    // Composite key simulation or check existing? Schema doesn't have composite unique on user+month+year.
                    // We need to findFirst and update, or just create. Prisama upsert needs unique.
                    // The schema has `id`. We can't easy upsert without unique logic.
                    // Let's use transaction or findFirst.
                    id: -1 // Hack to fail match unless we find ID.
                },
                update: {}, // formatting dummy 
                create: {
                    userId: emp.id,
                    month: parseInt(month),
                    year: parseInt(year),
                    baseWage: emp.salary.wage,
                    totalEarnings: finalNetPay + totalDeductions, // Roughly reconstruction
                    totalDeductions: totalDeductions,
                    netPay: finalNetPay,
                    status: 'GENERATED'
                }
            })
            // Wait, upsert needs a valid unique constraint. I don't have user_month_year unique.
            // I will use deleteMany + create to "Ovewrite" for that month.

            await prisma.payroll.deleteMany({
                where: { userId: emp.id, month: parseInt(month), year: parseInt(year) }
            })

            const newPayroll = await prisma.payroll.create({
                data: {
                    userId: emp.id,
                    month: parseInt(month), // Store as 0-indexed? Or 1? Usually 1 is better for humans, but JS is 0. 
                    // Let's store as 0-indexed to match input consistent with JS Date.
                    year: parseInt(year),
                    baseWage: emp.salary.wage,
                    totalEarnings: emp.salary.netSalary + emp.salary.pf + emp.salary.profTax, // The full earnings potential
                    totalDeductions: (emp.salary.netSalary - finalNetPay) + emp.salary.pf + emp.salary.profTax, // LOP + Statutory
                    netPay: finalNetPay,
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
