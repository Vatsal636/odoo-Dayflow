import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { firstName, lastName, phone, address, jobTitle, department } = body

        // Update details (and User if needed, though mostly details here)
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                details: {
                    update: {
                        firstName,
                        lastName,
                        phone,
                        address,
                        jobTitle,
                        department
                    }
                }
            },
            include: {
                details: true
            }
        })

        return NextResponse.json({ success: true, user: updatedUser })
    } catch (error) {
        console.error('Update employee error:', error)
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params

        // Transactional delete (Cascade should handle relations if configured, but explicit is safer for logic)
        // Prisma `onDelete: Cascade` in schema handles relations mostly.

        // We Soft Delete usually, but prompt implies "deleting". 
        // Let's do Soft Delete (isActive = false) or Hard Delete? 
        // Defaulting to Hard Delete for simple CRUD unless "Archive" requested.
        // Actually, context says "Admin... delete". Hard delete is risky. Let's start with Hard Delete as per standard CRUD request.

        await prisma.employeeDetails.delete({ where: { userId: parseInt(id) } })
        await prisma.user.delete({ where: { id: parseInt(id) } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete employee error:', error)
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
    }
}
