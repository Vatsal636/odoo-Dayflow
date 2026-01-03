"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Loader2, RefreshCw } from "lucide-react"

export default function ChatInterface({ currentUserRole }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const scrollRef = useRef(null)

    useEffect(() => {
        fetchMessages()
        const interval = setInterval(fetchMessages, 3000) // Poll every 3 seconds
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/chat')
            if (res.ok) {
                const data = await res.json()
                // Simple deduping or just replace if simple polling
                setMessages(data.messages || [])
                setLoading(false)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        setSending(true)
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            })
            if (res.ok) {
                setNewMessage("")
                fetchMessages() // Instant refresh
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        Collaboration Platform
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </h2>
                </div>
                <button onClick={fetchMessages} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 relative">
                {loading && messages.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = (currentUserRole === 'ADMIN' && msg.senderRole === 'ADMIN') ||
                            (currentUserRole === 'EMPLOYEE' && msg.senderRole === 'EMPLOYEE' && msg.senderName !== 'Admin' && msg.senderName === 'You')
                        // "Me" logic is tricky without user ID in props. 
                        // Actually, standard approach: BE returns isMe? Or compare IDs.
                        // For now, let's treat "Admin" as Me for Admin. 
                        // Improving Logic: We don't have current User ID easily here unless passed.
                        // Let's rely on alignment: Admins see Admin msgs on right? No, standard is "My User ID".
                        // Simplified: All messages left aligned except explicitly "mine".
                        // Since I don't have my ID prop easily without lifting state, let's just show clean list style like Slack.

                        return (
                            <div key={msg.id} className={`flex gap-3 ${msg.senderRole === 'ADMIN' ? 'bg-blue-50/50' : ''} p-2 rounded-lg transition-colors hover:bg-slate-100/50`}>
                                <div className="shrink-0 mt-1">
                                    {msg.avatar ? (
                                        <img src={msg.avatar} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${msg.senderRole === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                                            {msg.senderName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-sm font-bold ${msg.senderRole === 'ADMIN' ? 'text-blue-700' : 'text-slate-900'}`}>
                                            {msg.senderName}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-700 mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex gap-2 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-700 placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    )
}
