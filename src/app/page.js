import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="fixed w-full bg-white/50 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                            D
                        </div>
                        <span className="font-bold text-slate-900 text-lg">Dayflow</span>
                    </div>
                    <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="pt-32 pb-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                        HR Management Reimagined
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
                        Every workday, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Perfectly Aligned.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Streamline operations with Dayflow. From effortless onboarding to automated payroll, we enable teams to focus on what matters most.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-semibold transition-all">
                            View Demo
                        </button>
                    </div>
                </div>

                {/* Subtle Visual Element */}
                <div className="mt-20 relative max-w-5xl mx-auto">
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#60a5fa] to-[#6366f1] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
                    </div>

                    <div className="rounded-3xl bg-slate-50 border border-slate-200 p-2 shadow-2xl">
                        <div className="rounded-2xl bg-white aspect-[16/9] overflow-hidden flex items-center justify-center border border-slate-100">
                            <div className="text-center">
                                <p className="text-slate-400 font-medium">Dashboard Preview</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Smart Payroll", desc: "Automated calculations customized to your structure." },
                        { title: "Attendance Tracking", desc: "Seamless check-ins with precise reporting." },
                        { title: "Team Management", desc: "Centralized employee profiles and documents." }
                    ].map((feature, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-6 border border-slate-100">
                                <Check className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 mt-20">
                © 2026 Dayflow Inc. All rights reserved.
            </footer>
        </div>
    )
}
