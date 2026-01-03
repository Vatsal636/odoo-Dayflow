"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Mail, Phone, MoreHorizontal, Users } from "lucide-react"
import AddEmployeeModal from "@/components/AddEmployeeModal"

export default function AdminDashboard() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    const [stats, setStats] = useState([
        { label: 'Total Employees', value: '-', change: '...', icon: Users },
        { label: 'Present Today', value: '-', change: '...', icon: Phone }, // reusing Phone icon as placeholder if UserCheck not imported, will fix imports
        { label: 'Pending Leaves', value: '-', change: '...', icon: Mail },
        { label: 'Payroll Status', value: '-', change: '...', icon: MoreHorizontal },
    ])

    // Mock data for initial render if API fails or empty
    const mockEmployees = [
        { id: 1, name: "Alice Johnson", role: "Software Engineer", employeeId: "OIJO2022001", avatar: null, department: "Engineering" },
        { id: 2, name: "Bob Smith", role: "Product Manager", employeeId: "OIBS2022002", avatar: null, department: "Product" },
        { id: 3, name: "Charlie Davis", role: "Designer", employeeId: "OICD2022003", avatar: null, department: "Design" },
    ]

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/admin/employees')
            if (res.ok) {
                const data = await res.json()
                setEmployees(data.employees || [])
            } else {
                setEmployees(mockEmployees) // Fallback for demo
            }
        } catch (e) {
            setEmployees(mockEmployees)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats')
                if (res.ok) {
                    const data = await res.json()
                    // Map string icons to components if dynamic, or just map values
                    setStats(prev => prev.map((s, i) => ({ ...s, ...data.stats[i] })))
                }
            } catch (e) {
                console.error(e)
            }
        }

        // ... existing fetchEmployees call
        fetchEmployees()
        fetchStats()
    }, [])

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

    return (
        <div className="space-y-8">
            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onRefresh={fetchEmployees}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, Admin.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Employee
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                {/* Icon placeholder logic or static mapping */}
                                {i === 0 && <Users className="w-5 h-5" />}
                                {i === 1 && <div className="w-5 h-5 flex items-center justify-center font-bold">P</div>}
                                {i === 2 && <Mail className="w-5 h-5" />}
                                {i === 3 && <div className="w-5 h-5 font-bold">$</div>}
                            </div>
                        </div>
                        <div className="text-xs text-slate-400 font-medium bg-slate-50 inline-block px-2 py-1 rounded-md">
                            {stat.change}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Recent Members</h2>
                <a href="/admin/employees" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</a>
            </div>

            {/* Grid (Employees) */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {employees.map((emp) => (
                    <motion.div
                        key={emp.id}
                        variants={item}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-lg font-bold">
                                {emp.avatar ? (
                                    <img src={emp.avatar} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    emp.name.charAt(0)
                                )}
                            </div>
                            <button className="text-slate-300 hover:text-slate-600 transition-colors">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-900">{emp.name}</h3>
                            <p className="text-sm text-slate-500 mb-1">{emp.role}</p>
                            <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                {emp.employeeId}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
                            <button className="hover:text-blue-600 transition-colors p-1">
                                <Mail className="w-4 h-4" />
                            </button>
                            <button className="hover:text-green-600 transition-colors p-1">
                                <Phone className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                {emp.department || "General"}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}
