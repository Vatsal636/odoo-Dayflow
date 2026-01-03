import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        await verifyToken(token)

        const messages = await prisma.message.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    include: {
                        details: true
                    }
                }
            }
        })

        // Reverse to show oldest first in chat UI (though flex-col-reverse handles this too, usually API sends chrono)
        // Let's send desc (newest first) and let UI handle it, or ascend. 
        // Standard chat is usually ascending (old -> new).

        const sortedMessages = messages.reverse().map(msg => ({
            id: msg.id,
            content: msg.content,
            userId: msg.userId,
            senderName: msg.user.role === 'ADMIN'
                ? 'Admin'
                : (msg.user.details ? `${msg.user.details.firstName} ${msg.user.details.lastName}` : 'Unknown'),
            senderRole: msg.user.role,
            avatar: msg.user.details?.profilePic,
            createdAt: msg.createdAt
        }))

        return NextResponse.json({ messages: sortedMessages })

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const payload = await verifyToken(token)
        const body = await request.json()
        const { content } = body

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content required' }, { status: 400 })
        }

        const message = await prisma.message.create({
            data: {
                content: content.trim(),
                userId: payload.id
            },
            include: {
                user: {
                    include: { details: true }
                }
            }
        })

        const formattedMessage = {
            id: message.id,
            content: message.content,
            userId: message.userId,
            senderName: message.user.role === 'ADMIN'
                ? 'Admin'
                : (message.user.details ? `${message.user.details.firstName} ${message.user.details.lastName}` : 'Unknown'),
            senderRole: message.user.role,
            avatar: message.user.details?.profilePic,
            createdAt: message.createdAt
        }

        return NextResponse.json({ success: true, message: formattedMessage })

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
