"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, Users, Clock, Calendar, Banknote, FileText, LogOut, MessageCircle, Trophy } from "lucide-react"

const defaultAdminItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Employees", href: "/admin/employees", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: Clock },
    { name: "Payroll", href: "/admin/payroll", icon: Banknote },
    { name: "Chat", href: "/admin/chat", icon: MessageCircle },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy }, // Shared link? Or Admin specific? The page is in dashboard/leaderboard but can be accessed.
    // Wait, I didn't create /admin/leaderboard/page.js. 
    // I created /dashboard/leaderboard/page.js. 
    // And it works for both if the layout permits or if I redirect.
    // The layout.js for admin wraps pages? 
    // Actually, Admin pages are in /admin. /dashboard pages are for users.
    // If I link /dashboard/leaderboard in Admin nav, it might render inside Dashboard layout?
    // Let's create an admin page wrapper or just link to it. 
    // Ideally, consistency: /admin/leaderboard. 
    // Let's plan to create /admin/leaderboard as well, or update plan. for now let's reuse /dashboard one if possible or just duplicate wrapper.
    { name: "Leaves", href: "/admin/leaves", icon: Calendar },
    // { name: "Reports", href: "/admin/reports", icon: FileText },
]

export default function FloatingNavbar({ items }) {
    const pathname = usePathname()
    const navLinks = items || defaultAdminItems

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="bg-slate-900/90 backdrop-blur-lg border border-white/10 text-white p-2 rounded-full shadow-2xl flex items-center gap-1 overflow-hidden"
            >
                {navLinks.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/dashboard" && pathname.startsWith(item.href))
                    const label = item.name || item.label // Handle both casing

                    return (
                        <Link
                            key={label}
                            href={item.href}
                            className="relative flex items-center"
                        >
                            <motion.div
                                className={`relative px-4 py-3 rounded-full flex items-center transition-colors ${isActive ? "" : "hover:bg-white/10"}`}
                                initial="initial"
                                whileHover="hover"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/20 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-blue-200" : "text-slate-400"}`} />

                                <motion.span
                                    variants={{
                                        initial: { width: 0, opacity: 0, marginLeft: 0 },
                                        hover: { width: "auto", opacity: 1, marginLeft: 8 }
                                    }}
                                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                    className="text-sm font-medium whitespace-nowrap overflow-hidden relative z-10"
                                >
                                    {label}
                                </motion.span>
                            </motion.div>
                        </Link>
                    )
                })}

                <div className="w-px h-8 bg-white/10 mx-2" />

                <button
                    onClick={() => {
                        // Logout logic
                        document.cookie = 'token=; Max-Age=0; path=/;'
                        window.location.href = '/'
                    }}
                    className="px-4 py-3 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </motion.nav>
        </div>
    )
}
