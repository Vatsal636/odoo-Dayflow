"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react"

export default function AttendancePage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [attendanceData, setAttendanceData] = useState([])
    const [joiningDate, setJoiningDate] = useState(null)
    const [loading, setLoading] = useState(true)

    // Derived values for calendar
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Handlers for navigation
    const handlePrevMonth = () => {
        const newDate = new Date(year, month - 1, 1)
        if (joiningDate && newDate < new Date(new Date(joiningDate).setDate(1))) return // Don't go before joining date (by month)
        setCurrentDate(newDate)
    }

    const handleNextMonth = () => {
        const newDate = new Date(year, month + 1, 1)
        const today = new Date()
        if (newDate > today) return // Don't go to future months
        setCurrentDate(newDate)
    }

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/attendance/history?month=${month}&year=${year}`)
            if (res.ok) {
                const data = await res.json()
                setAttendanceData(data.attendance || [])
                setJoiningDate(data.joiningDate)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [currentDate])

    // Generate Calendar Grid
    const generateCalendarDays = () => {
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startDayIndex = firstDay.getDay() // 0 = Sunday

        const days = []
        // Empty slots for previous month
        for (let i = 0; i < startDayIndex; i++) {
            days.push(null)
        }
        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i))
        }

        return days
    }

    const days = generateCalendarDays()

    // Color Logic
    const getDayStatus = (date) => {
        if (!date) return null

        // Find record
        // Note: API returns UTC dates, we need to match properly. 
        // Best usage is to normalize both to string YYYY-MM-DD for comparison or use timestamp logic.
        const dateStr = date.toDateString()
        const record = attendanceData.find(a => new Date(a.date).toDateString() === dateStr)

        if (record) {
            const checkIn = new Date(record.checkIn)
            // 9:30 AM logic
            // Create a 9:30 threshold for that day
            const threshold = new Date(record.checkIn)
            threshold.setHours(9, 30, 0, 0)

            if (checkIn > threshold) return { color: 'bg-orange-100 text-orange-700', status: 'Late', record }
            return { color: 'bg-green-100 text-green-700', status: 'Present', record }
        }

        // If no record:
        // 1. Future date -> Gray/White
        // 2. Weekend -> Gray (optional)
        // 3. Past date -> Red (Absent)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (date > today) return { color: 'bg-white', status: '', record: null }
        if (date.getDay() === 0) return { color: 'bg-slate-50 text-slate-400', status: 'Weekend', record: null } // Sunday

        // If before joining date -> N/A
        if (joiningDate && date < new Date(joiningDate)) return { color: 'bg-white text-slate-300', status: '-', record: null }

        return { color: 'bg-red-50 text-red-600', status: 'Absent', record: null }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Attendance History</h1>
                    <p className="text-slate-500">Track your monthly attendance</p>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="font-bold text-slate-900 w-32 text-center">
                        {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 disabled:opacity-30">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="grid grid-cols-7 gap-4 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {days.map((day, index) => {
                        if (!day) return <div key={`empty-${index}`} className="h-24" />

                        const { color, status, record } = getDayStatus(day)

                        return (
                            <motion.div
                                key={day.toISOString()}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className={`h-24 rounded-xl border border-slate-100 p-3 flex flex-col justify-between transition-colors ${color}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`font-bold ${status === 'Absent' ? 'text-red-400' : 'text-slate-700'}`}>{day.getDate()}</span>
                                    {status && <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{status}</span>}
                                </div>

                                {record && (
                                    <div className="text-xs font-medium opacity-80">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                    <span className="text-sm text-slate-600">On Time</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
                    <span className="text-sm text-slate-600">Late ( Arrived after 9:30 AM)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-50 border border-red-200"></div>
                    <span className="text-sm text-slate-600">Absent</span>
                </div>
            </div>
        </div>
    )
}
