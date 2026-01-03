"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Calendar, ArrowRight, Sun } from "lucide-react"

function formatTime(ms) {
    if (ms < 0) ms = 0
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / 1000 / 60) % 60)
    const hours = Math.floor((ms / 1000 / 60 / 60))
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function EmployeeDashboard() {
    const [date, setDate] = useState(new Date())
    const [attendance, setAttendance] = useState({
        checkedIn: false,
        checkedOut: false,
        checkInTime: null,
        checkOutTime: null
    })
    const [elapsed, setElapsed] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Fetch Status & Timer Logic
    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await fetch('/api/attendance')
                if (res.ok) {
                    const data = await res.json()
                    setAttendance(data)
                }
            } finally {
                setIsLoading(false)
            }
        }
        fetchStatus()

        // Timer Interval
        const interval = setInterval(() => {
            setAttendance(prev => {
                if (prev.checkedIn && !prev.checkedOut && prev.checkInTime) {
                    const start = new Date(prev.checkInTime).getTime()
                    const now = new Date().getTime()
                    setElapsed(now - start)
                }
                return prev
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const handleCheckIn = async () => {
        try {
            const res = await fetch('/api/attendance', { method: 'POST' })
            if (res.ok) {
                const data = await res.json()
                setAttendance({
                    checkedIn: true,
                    checkedOut: false,
                    checkInTime: data.attendance.checkIn
                })
            }
        } catch (error) {
            alert('Check in failed')
        }
    }

    const handleCheckOut = async () => {
        try {
            const res = await fetch('/api/attendance', { method: 'PUT' })
            if (res.ok) {
                const data = await res.json()
                setAttendance(prev => ({
                    ...prev,
                    checkedOut: true,
                    checkOutTime: data.attendance.checkOut
                }))
            }
        } catch (error) {
            alert('Check out failed')
        }
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    // Calculate leave balance mockup for now
    const leaveBalance = 12.5

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-2 font-medium">
                        <Sun className="w-5 h-5" />
                        <span>Good Morning</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Ready to make today count?
                    </h1>
                </div>
                <div className="text-right hidden md:block">
                    <div className="text-3xl font-light text-slate-700 font-mono">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-slate-400 font-medium">
                        {date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats / Attendance Card */}
            <motion.div variants={item} className="grid md:grid-cols-3 gap-6">
                {/* Check In Action Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20 group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-32 h-32" />
                    </div>

                    {!attendance.checkedIn ? (
                        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                            <div>
                                <h2 className="text-2xl font-bold opacity-90">Start Your Day</h2>
                                <p className="text-blue-100">You haven't checked in yet.</p>
                            </div>
                            <button
                                onClick={handleCheckIn}
                                disabled={isLoading}
                                className="w-fit bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                                <ArrowRight className="w-5 h-5" />
                                Check In Now
                            </button>
                        </div>
                    ) : !attendance.checkedOut ? (
                        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold opacity-90">Today's Session</h2>
                                    <p className="text-blue-100">You are currently working.</p>
                                </div>
                                <div className="text-4xl font-mono font-bold bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                                    {formatTime(elapsed)}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleCheckOut}
                                    className="bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 border border-red-400"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                    Check Out
                                </button>
                                <span className="text-sm text-blue-200 font-medium">Started at {new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 flex flex-col h-full justify-center gap-4">
                            <h2 className="text-3xl font-bold opacity-90">Workday Complete!</h2>
                            <p className="text-blue-100">You checked out at {new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. See you tomorrow!</p>
                        </div>
                    )}
                </div>

                {/* Leave Balance Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Leave Balance</h2>
                            <p className="text-slate-500 text-sm">Available days</p>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-slate-900 mb-2">12.5 <span className="text-lg text-slate-400 font-medium">days</span></div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 w-[60%] h-full rounded-full" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Recent Activity / Widgets */}
            <div className="grid md:grid-cols-2 gap-8">
                <motion.div variants={item} className="bg-white rounded-3xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Recent Activity</h3>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-default">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    IN
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Checked In</p>
                                    <p className="text-xs text-slate-500">Yesterday, 09:28 AM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={item} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
                    <h3 className="font-bold text-lg mb-4">Upcoming Holidays</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 p-3 rounded-xl text-center min-w-[60px]">
                                <div className="text-xs opacity-60 uppercase font-bold">Jan</div>
                                <div className="text-xl font-bold">26</div>
                            </div>
                            <div>
                                <p className="font-semibold">Republic Day</p>
                                <p className="text-sm opacity-60">National Holiday</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

        </motion.div>
    )
}
