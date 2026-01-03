import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    try {
        const today = new Date()
        // 1. Backdate Joining Date by 1 month
        const oneMonthAgo = new Date(today)
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

        // Update all employees' joining date
        await prisma.employeeDetails.updateMany({
            data: {
                joiningDate: oneMonthAgo
            }
        })

        // Fetch all employees
        const employees = await prisma.user.findMany({
            where: { role: 'EMPLOYEE' }
        })

        const createdRecords = []

        // 2. Generate Attendance History
        // Loop from 1 month ago to yesterday
        for (const emp of employees) {
            let loopDate = new Date(oneMonthAgo)

            while (loopDate < today) {
                // Skip Sundays
                if (loopDate.getDay() !== 0) {

                    // Random Check In: 8:45 AM to 9:45 AM
                    // 9:30 is late cutoff. Provide mix.
                    const checkIn = new Date(loopDate)
                    const randomMin = Math.floor(Math.random() * 60) // 0-59
                    checkIn.setHours(8, 45 + Math.floor(Math.random() * 60), 0)
                    // To handle hours correctly: start 8:45. Add 0-60 mins.
                    // Actually simpler: 
                    // Random hour 9, Random min 0-50 -> 9:00 - 9:50
                    // Or 8:50 - 9:50

                    const isLate = Math.random() > 0.7 // 30% chance of being late
                    if (isLate) {
                        checkIn.setHours(9, 35 + Math.floor(Math.random() * 20)) // 9:35 - 9:55
                    } else {
                        checkIn.setHours(8, 50 + Math.floor(Math.random() * 35)) // 8:50 - 9:25
                    }

                    // Random Check Out: 17:00 to 18:30
                    const checkOut = new Date(loopDate)
                    checkOut.setHours(17, Math.floor(Math.random() * 90)) // 17:00 + 0-90mins

                    // Upsert to avoid duplicates if running multiple times
                    // We need a unique constraint or just check first. 
                    // For seed, let's just create if not exists or ignore given it's dummy.
                    // But Prisma upsert needs unique field.

                    // Just check first
                    const exists = await prisma.attendance.findFirst({
                        where: { userId: emp.id, date: loopDate }
                    })

                    if (!exists) {
                        await prisma.attendance.create({
                            data: {
                                userId: emp.id,
                                date: new Date(loopDate), // Ensure cleaned date? Prisma stores DateTime with time. 
                                // The schema says @db.Date?? No, schema says DateTime @db.Date. 
                                // If @db.Date, it stores only date part usually but Prisma client treats as Date object.
                                // Best to keep time 00:00 for the 'date' field query.
                                checkIn: checkIn,
                                checkOut: checkOut,
                                status: 'PRESENT'
                            }
                        })
                        createdRecords.push({ user: emp.id, date: loopDate.toISOString() })
                    }
                }

                // Next day
                loopDate.setDate(loopDate.getDate() + 1)
                loopDate.setHours(0, 0, 0, 0) // Reset time part for loop stability
            }
        }

        return NextResponse.json({
            success: true,
            updatedJoiningDate: oneMonthAgo,
            recordsCreated: createdRecords.length
        })

    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
