import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    try {
        const employees = await prisma.user.findMany({
            where: { role: 'EMPLOYEE' }
        })

        const months = [
            { month: 9, year: 2024, name: 'October' },  // 0-indexed? No, JS date month 9 is Oct. Wait. JS Date: 0=Jan, 9=Oct. 
            // My previous logic used 0-indexed. let's stick to that. 
            // Oct = 9, Nov = 10, Dec = 11.
            { month: 10, year: 2024 },
            { month: 11, year: 2024 }
        ]

        for (const emp of employees) {
            const wage = 50000
            const basic = wage * 0.5
            const pf = basic * 0.12
            const profTax = 200
            const deductions = pf + profTax
            const net = wage - deductions

            for (const { month, year } of months) {
                // Randomize slightly
                const daysInMonth = new Date(year, month + 1, 0).getDate()
                const payableDays = daysInMonth - Math.floor(Math.random() * 2) // 0 or 1 random leave

                const perDay = net / daysInMonth
                const finalNet = Math.round(perDay * payableDays)
                const totalDeductions = Math.round(deductions + (net - finalNet))

                await prisma.payroll.upsert({
                    where: {
                        id: -1 // Force create mostly, but actually I need to clear old first or just create
                    },
                    update: {},
                    create: {
                        userId: emp.id,
                        month,
                        year,
                        baseWage: wage,
                        totalEarnings: Math.round(finalNet + totalDeductions),
                        totalDeductions: totalDeductions,
                        netPay: finalNet,
                        status: 'PAID'
                    }
                }).catch(async (e) => {
                    // Fallback since unique constraint missing
                    await prisma.payroll.create({
                        data: {
                            userId: emp.id,
                            month,
                            year,
                            baseWage: wage,
                            totalEarnings: Math.round(finalNet + totalDeductions),
                            totalDeductions: totalDeductions,
                            netPay: finalNet,
                            status: 'PAID'
                        }
                    })
                })
            }
        }

        return NextResponse.json({ success: true, message: `Seeded payroll for ${employees.length} employees` })

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
