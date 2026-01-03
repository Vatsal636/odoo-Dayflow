"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DollarSign, Calendar, Download, ChevronRight, FileText, Calculator } from "lucide-react"

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPayroll, setSelectedPayroll] = useState(null)

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const res = await fetch('/api/payroll/history')
                if (res.ok) {
                    const data = await res.json()
                    setPayrolls(data.payrolls || [])
                    // Auto-select most recent
                    if (data.payrolls?.length > 0) setSelectedPayroll(data.payrolls[0])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchPayrolls()
    }, [])

    if (loading) return <div className="p-8 text-center text-slate-500">Loading payroll history...</div>

    return (
        <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
            {/* Sidebar List */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10 space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Payslips</h2>
                        <p className="text-slate-500 text-sm">Monthly salary statements</p>
                    </div>
                    <Link href="/dashboard/payroll/simulator" className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-md hover:shadow-lg transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Calculator className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">Salary Simulator</p>
                                <p className="text-xs text-blue-100">Predict your in-hand</p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                    {payrolls.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No payslips found.</div>
                    ) : (
                        payrolls.map(slip => {
                            const date = new Date(slip.year, slip.month)
                            const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })
                            const isSelected = selectedPayroll?.id === slip.id

                            return (
                                <button
                                    key={slip.id}
                                    onClick={() => setSelectedPayroll(slip)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${isSelected ? 'bg-blue-50 ring-1 ring-blue-100' : 'hover:bg-slate-50'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden transition-colors ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}`}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{monthName}</p>
                                        <p className={`text-xs truncate ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>Net Pay: ₹{slip.netPay.toLocaleString('en-IN')}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-300'}`} />
                                </button>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Detail View (Payslip) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 overflow-y-auto">
                {selectedPayroll ? (
                    <div className="max-w-2xl mx-auto border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">

                        {/* Header */}
                        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">Payslip</h1>
                                <p className="text-slate-400 font-medium opacity-80">
                                    {new Date(selectedPayroll.year, selectedPayroll.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Net Pay</p>
                                <p className="text-3xl font-bold text-emerald-400">₹{selectedPayroll.netPay.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gross Earnings</p>
                                    <p className="text-xl font-bold text-slate-900">₹{selectedPayroll.totalEarnings.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Deductions</p>
                                    <p className="text-xl font-bold text-red-600">- ₹{selectedPayroll.totalDeductions.toLocaleString('en-IN')}</p>
                                </div>
                            </div>

                            {/* Detailed Breakdown */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Salary Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Base Wage (CTC)</span>
                                        <span className="font-medium text-slate-900">₹{selectedPayroll.baseWage.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Computed Gross Earnings</span>
                                        <span className="font-medium text-emerald-700">₹{selectedPayroll.totalEarnings.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Deductions (PF, Tax, LOP)</span>
                                        <span className="font-medium text-red-600">- ₹{selectedPayroll.totalDeductions.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status: <span className="text-emerald-600">{selectedPayroll.status}</span></span>
                                <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <DollarSign className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a month to view payslip.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
