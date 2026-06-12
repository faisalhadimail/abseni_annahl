'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { 
  School, Lock, GraduationCap, Users, Activity, Wallet, Settings, 
  Monitor, LayoutDashboard, BookOpen, Clock, Play, Square, 
  Calendar, CalendarCheck, Banknote, User, LogOut, Plus, Pencil, 
  Trash2, Printer, Save, ChevronRight, X, CheckCircle, AlertCircle,
  Calculator, Download, Upload, AlertTriangle, Building2, Briefcase,
  PlayCircle, StopCircle, Menu, BookOpenCheck
} from 'lucide-react'

// Types
type ViewMode = 'terminal' | 'admin' | 'employee'
type TabType = 'dashboard' | 'employees' | 'activities' | 'payroll' | 'settings'
type EmployeeTabType = 'dashboard' | 'attendance' | 'salary' | 'profile'
type SettingsTabType = 'company' | 'homepage' | 'roles' | 'admins' | 'database'

interface Company {
  id: string
  name: string
  empPrefix: string
  address: string
  phone: string
  email: string
  website: string
}

interface HomePageSettings {
  id: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroImage: string
  statusText: string
  adminCardTitle: string
  adminCardDesc: string
  tutorCardTitle: string
  tutorCardDesc: string
  showStats: boolean
}

interface Role {
  id: string
  name: string
  salary: number
  defaultBonus: number
  defaultAllowance: number
}

interface Employee {
  id: string
  employeeId: string
  name: string
  role: string
  salaryPerDay: number
  pin?: string
  isActive?: boolean
}

interface AttendanceLog {
  id: string
  employeeId: string
  type: 'IN' | 'OUT'
  timestamp: string
  note?: string
  employee?: Employee
}

interface PayrollAdjustment {
  id: string
  employeeId: string
  month: number
  year: number
  bonus: number
  allowance: number
}

interface Session {
  empId: string
  empName: string
  date: string
  sessionIndex: number
  startTime: string
  startId: string
  endTime: string | null
  endId: string | null
  note: string
  status: 'Berjalan' | 'Selesai'
}

interface Admin {
  id: string
  username: string
  name: string
  role: string
  isActive: boolean
}

// Utility functions
const formatRupiah = (number: number) => 
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number)

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const formatTime = (dateString: string) => 
  new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

const getCurrentMonth = () => new Date().toISOString().slice(0, 7)

// Toast Component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`flex items-center gap-2 px-6 py-3 rounded-lg shadow-lg text-white animate-fade-in ${
      type === 'error' ? 'bg-red-500' : 'bg-green-600'
    }`}>
      {type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
      <span>{message}</span>
    </div>
  )
}

// Modal Component with Portal
function Modal({ isOpen, onClose, title, children, size = 'md' }: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg'
}) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  
  if (!isOpen || !mounted) return null
  
  const sizeClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-lg' : 'max-w-md'

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-y-auto">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClass} overflow-hidden animate-fade-in my-8`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
  
  return createPortal(modalContent, document.body)
}

// Main App
export default function Home() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('terminal')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [activeEmployeeTab, setActiveEmployeeTab] = useState<EmployeeTabType>('dashboard')
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTabType>('company')
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Filter states
  const [filterActivityMonth, setFilterActivityMonth] = useState(getCurrentMonth())
  const [filterActivityEmp, setFilterActivityEmp] = useState('')
  const [filterPayrollMonth, setFilterPayrollMonth] = useState(getCurrentMonth())
  
  // Data states
  const [company, setCompany] = useState<Company>({
    id: '', name: 'LBB Annahl', empPrefix: 'TENTOR', address: '', phone: '', email: '', website: ''
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceLog, setAttendanceLog] = useState<AttendanceLog[]>([])
  const [payrollAdjustments, setPayrollAdjustments] = useState<Record<string, PayrollAdjustment>>({})
  const [admins, setAdmins] = useState<Admin[]>([])
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const [homePageSettings, setHomePageSettings] = useState<HomePageSettings>({
    id: '',
    heroTitle: 'Selamat Datang di',
    heroSubtitle: 'Portal LBB',
    heroDescription: 'Kelola absensi, aktivitas mengajar, dan penggajian dengan mudah dalam satu platform terintegrasi.',
    heroImage: '/hero-image.png',
    statusText: 'Sistem Aktif',
    adminCardTitle: 'Admin Dashboard',
    adminCardDesc: 'Kelola data pengajar, absensi, dan penggajian',
    tutorCardTitle: 'Portal Pengajar / Staf',
    tutorCardDesc: 'Akses absensi, riwayat mengajar, dan slip gaji',
    showStats: true
  })
  
  // Modal states
  const [showPinModal, setShowPinModal] = useState(false)
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showPayrollModal, setShowPayrollModal] = useState(false)
  const [showTeachingNoteModal, setShowTeachingNoteModal] = useState(false)
  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  
  // Form states
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [employeeLoginId, setEmployeeLoginId] = useState('')
  const [employeeLoginPin, setEmployeeLoginPin] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingActivity, setEditingActivity] = useState<Session | null>(null)
  const [editingPayroll, setEditingPayroll] = useState<{ employee: Employee; month: number; year: number } | null>(null)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [teachingNote, setTeachingNote] = useState('')
  const [payslipEmployee, setPayslipEmployee] = useState<Employee | null>(null)
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Close toast handler - stable reference
  const closeToast = useCallback(() => {
    setToast(null)
  }, [])
  
  // Clock state
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Fetch data functions
  const fetchData = useCallback(async () => {
    try {
      // Fetch company
      const companyRes = await fetch('/api/company')
      const companyData = await companyRes.json()
      if (companyData && !companyData.error) setCompany(companyData)
      
      // Fetch roles
      const rolesRes = await fetch('/api/roles')
      const rolesData = await rolesRes.json()
      if (Array.isArray(rolesData)) setRoles(rolesData)
      
      // Fetch employees
      const empRes = await fetch('/api/employees')
      const empData = await empRes.json()
      if (Array.isArray(empData)) setEmployees(empData)
      
      // Fetch attendance
      const attRes = await fetch('/api/attendance')
      const attData = await attRes.json()
      if (Array.isArray(attData)) setAttendanceLog(attData)
      
      // Fetch payroll
      const payRes = await fetch('/api/payroll')
      const payData = await payRes.json()
      if (Array.isArray(payData)) {
        const adjMap: Record<string, PayrollAdjustment> = {}
        payData.forEach((adj: PayrollAdjustment) => {
          adjMap[`${adj.employeeId}-${adj.month}-${adj.year}`] = adj
        })
        setPayrollAdjustments(adjMap)
      }
      
      // Fetch admins
      const adminRes = await fetch('/api/admin')
      const adminData = await adminRes.json()
      if (Array.isArray(adminData)) setAdmins(adminData)
      
      // Fetch home page settings
      const homeRes = await fetch('/api/homepage')
      const homeData = await homeRes.json()
      if (homeData && !homeData.error) setHomePageSettings(homeData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
    
    // Update clock every second
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [fetchData])
  
  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }
  
  // Handle Admin login
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setShowPinModal(false)
        setViewMode('admin')
        setCurrentAdmin(data.admin)
        setAdminUsername('')
        setAdminPassword('')
        showToast(`Selamat Datang, ${data.admin.name}`)
      } else {
        showToast(data.error || 'Login gagal', 'error')
      }
    } catch (error) {
      showToast('Gagal menghubungi server', 'error')
    }
  }
  
  // Handle employee login with PIN
  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId: employeeLoginId.trim().toUpperCase(), 
          pin: employeeLoginPin 
        })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        setCurrentEmployeeId(data.employee.employeeId)
        setViewMode('employee')
        setActiveEmployeeTab('dashboard')
        setEmployeeLoginId('')
        setEmployeeLoginPin('')
        showToast(`Selamat Datang, ${data.employee.name}`)
      } else {
        showToast(data.error || 'Login gagal', 'error')
      }
    } catch (error) {
      showToast('Gagal menghubungi server', 'error')
    }
  }
  
  // Handle attendance (IN/OUT)
  const handleAttendance = async (type: 'IN' | 'OUT') => {
    if (!currentEmployeeId) return
    
    // Check for debounce
    const myLogs = attendanceLog.filter(l => l.employeeId === currentEmployeeId)
    const lastLog = myLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    
    if (lastLog && (Date.now() - new Date(lastLog.timestamp).getTime() < 60000)) {
      showToast('Tunggu sebentar sebelum menekan tombol lagi.', 'error')
      return
    }
    
    if (type === 'OUT') {
      setShowTeachingNoteModal(true)
      return
    }
    
    await saveAttendance('IN', null)
  }
  
  // Save attendance
  const saveAttendance = async (type: 'IN' | 'OUT', note: string | null) => {
    if (!currentEmployeeId) return
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentEmployeeId,
          type,
          note
        })
      })
      
      if (res.ok) {
        showToast(type === 'IN' ? 'Absensi Masuk Tercatat' : 'Absensi Keluar Tercatat')
        fetchData()
      } else {
        showToast('Gagal menyimpan absensi', 'error')
      }
    } catch (error) {
      showToast('Gagal menyimpan absensi', 'error')
    }
  }
  
  // Submit teaching note
  const submitTeachingNote = () => {
    if (!teachingNote.trim()) {
      showToast('Isi catatan dulu!', 'error')
      return
    }
    setShowTeachingNoteModal(false)
    saveAttendance('OUT', teachingNote)
    setTeachingNote('')
  }
  
  // Get sessions (grouped IN/OUT logs)
  const getSessions = useCallback((): Session[] => {
    const logs = [...attendanceLog].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    const sessions: Session[] = []
    const active: Record<string, Session> = {}
    const sessionCounts: Record<string, number> = {}

    logs.forEach(log => {
      const dateKey = `${log.employeeId}_${log.timestamp.split('T')[0]}`
      if (!sessionCounts[dateKey]) sessionCounts[dateKey] = 0

      const emp = employees.find(e => e.employeeId === log.employeeId)
      const empName = emp ? emp.name : 'Unknown'

      if (log.type === 'IN') {
        sessionCounts[dateKey]++
        active[log.employeeId] = {
          empId: log.employeeId,
          empName,
          date: log.timestamp.split('T')[0],
          sessionIndex: sessionCounts[dateKey],
          startTime: log.timestamp,
          startId: log.id,
          endTime: null,
          endId: null,
          note: '',
          status: 'Berjalan'
        }
      } else if (log.type === 'OUT') {
        if (active[log.employeeId]) {
          const session = active[log.employeeId]
          session.endTime = log.timestamp
          session.endId = log.id
          session.note = log.note || ''
          session.status = 'Selesai'
          sessions.push(session)
          delete active[log.employeeId]
        }
      }
    })

    // Push incomplete active sessions
    Object.values(active).forEach(s => sessions.push(s))
    return sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  }, [attendanceLog, employees])
  
  // Get adjustment key
  const getAdjustmentKey = (empId: string, date: Date) => {
    return `${empId}-${date.getMonth()}-${date.getFullYear()}`
  }
  
  // Current employee
  const currentEmployee = employees.find(e => e.employeeId === currentEmployeeId)
  
  // Clock display
  const clockDisplay = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateDisplay = currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  
  // Render Terminal Mode
  const renderTerminalMode = () => {
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = getSessions().filter(s => s.date === today && s.status === 'Berjalan')
    
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col relative overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${homePageSettings.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/70" />
        </div>
        
        {/* Header */}
        <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-lg">
                <School className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-white tracking-tight">{company.name}</h1>
                <p className="text-sm text-indigo-200 font-medium">Sistem Manajemen Lembaga Bimbingan Belajar</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-right">
                <p className="text-3xl font-mono text-white font-bold tracking-wider" suppressHydrationWarning>{clockDisplay}</p>
                <p className="text-sm text-indigo-200 font-medium" suppressHydrationWarning>{dateDisplay}</p>
              </div>
            </div>
            {/* Mobile Clock */}
            <div className="md:hidden text-right">
              <p className="text-xl font-mono text-white font-bold" suppressHydrationWarning>{clockDisplay}</p>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="relative z-10 flex-1 flex flex-col justify-center px-4 md:px-8 py-8 md:py-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Left Side - Welcome Text */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-indigo-200 font-medium">{homePageSettings.statusText}</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {homePageSettings.heroTitle}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">{homePageSettings.heroSubtitle}</span>
                </h2>
                <p className="text-lg md:text-xl text-indigo-100/80 mb-8 max-w-lg">
                  {homePageSettings.heroDescription}
                </p>
                
                {/* Stats Row */}
                {homePageSettings.showStats && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                      <p className="text-2xl font-bold text-white">{employees.length}</p>
                      <p className="text-xs text-indigo-200">Pengajar Aktif</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                      <p className="text-2xl font-bold text-green-400">{todaySessions.length}</p>
                      <p className="text-xs text-indigo-200">Sesi Hari Ini</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3">
                      <p className="text-2xl font-bold text-cyan-400">{attendanceLog.filter(l => l.timestamp.startsWith(today)).length}</p>
                      <p className="text-xs text-indigo-200">Log Hari Ini</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Side - Mentor Login Form */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Portal Pengajar</h3>
                    <p className="text-sm text-indigo-200">Masukkan ID dan PIN untuk login</p>
                  </div>
                  
                  <form onSubmit={handleEmployeeLogin} className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        value={employeeLoginId}
                        onChange={e => setEmployeeLoginId(e.target.value.toUpperCase())}
                        className="w-full text-center text-xl font-mono uppercase py-3 px-4 bg-white/10 border border-white/30 rounded-xl focus:border-indigo-400 focus:bg-white/20 outline-none transition-all text-white placeholder-white/50" 
                        placeholder="ID PENGAJAR..."
                        required
                      />
                    </div>
                    <div>
                      <input 
                        type="password" 
                        value={employeeLoginPin}
                        onChange={e => setEmployeeLoginPin(e.target.value)}
                        maxLength={6}
                        className="w-full text-center text-2xl font-mono tracking-[0.3em] py-3 px-4 bg-white/10 border border-white/30 rounded-xl focus:border-indigo-400 focus:bg-white/20 outline-none transition-all text-white placeholder-white/50" 
                        placeholder="PIN"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold hover:from-indigo-500 hover:to-indigo-600 transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/30">
                      MASUK
                    </button>
                  </form>
                </div>
                
                {/* Today's Activity */}
                {todaySessions.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">Sedang Mengajar</h3>
                    </div>
                    <div className="space-y-2">
                      {todaySessions.slice(0, 3).map((s, i) => (
                        <div key={i} className="bg-white/10 rounded-xl p-3 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {s.empName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">{s.empName}</p>
                              <p className="text-xs text-indigo-300">Sesi {s.sessionIndex} • {formatTime(s.startTime)}</p>
                            </div>
                          </div>
                          <span className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full text-xs font-bold">AKTIF</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="relative z-10 bg-black/30 backdrop-blur-sm border-t border-white/10 py-4 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-indigo-300">{company.address} {company.phone && `• ${company.phone}`}</p>
            <p 
              className="text-xs text-indigo-400 cursor-default select-none" 
              onDoubleClick={() => setShowPinModal(true)}
              title=""
            >
              © {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    )
  }
  
  // Render Admin Layout
  const renderAdminLayout = () => {
    const getNavClass = (tab: TabType) => 
      `w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
        activeTab === tab ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`
    
    return (
      <div className="flex min-h-screen relative">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <School className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800">Admin LBB</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </header>
        
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />
        )}
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col pt-16 md:pt-0`}>
          <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-100">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <School className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-slate-800">Admin LBB</span>
          </div>
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false) }} className={getNavClass('dashboard')}>
              <LayoutDashboard className="w-5 h-5" /><span>Dashboard</span>
            </button>
            <button onClick={() => { setActiveTab('employees'); setMobileMenuOpen(false) }} className={getNavClass('employees')}>
              <Users className="w-5 h-5" /><span>Data Tentor/Staf</span>
            </button>
            <button onClick={() => { setActiveTab('activities'); setMobileMenuOpen(false) }} className={getNavClass('activities')}>
              <Activity className="w-5 h-5" /><span>Aktivitas Tentor</span>
            </button>
            <button onClick={() => { setActiveTab('payroll'); setMobileMenuOpen(false) }} className={getNavClass('payroll')}>
              <Wallet className="w-5 h-5" /><span>Penggajian</span>
            </button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false) }} className={getNavClass('settings')}>
              <Settings className="w-5 h-5" /><span>Pengaturan</span>
            </button>
            <div className="border-t border-slate-100 pt-4 mt-4">
              <button onClick={() => setViewMode('terminal')} className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-indigo-600 hover:bg-indigo-50 font-medium">
                <Monitor className="w-5 h-5" /><span>Mode Terminal</span>
              </button>
            </div>
          </nav>
          <div className="p-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                {currentAdmin?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{currentAdmin?.name || 'Admin'}</p>
                <p className="text-xs text-slate-400">{currentAdmin?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <button 
                onClick={() => { setCurrentAdmin(null); setViewMode('terminal') }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 bg-slate-50 pt-20 md:pt-8 w-full overflow-x-hidden">
          {activeTab === 'dashboard' && renderAdminDashboard()}
          {activeTab === 'employees' && renderAdminEmployees()}
          {activeTab === 'activities' && renderAdminActivities()}
          {activeTab === 'payroll' && renderAdminPayroll()}
          {activeTab === 'settings' && renderAdminSettings()}
        </main>
      </div>
    )
  }
  
  // Render Admin Dashboard
  const renderAdminDashboard = () => {
    const today = new Date().toISOString().split('T')[0]
    const sessionsToday = attendanceLog.filter(l => l.timestamp.startsWith(today) && l.type === 'IN').length
    const recentLogs = [...attendanceLog].reverse().slice(0, 5)
    
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Staf</p>
              <p className="text-2xl font-bold text-slate-800">{employees.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sesi Hari Ini</p>
              <p className="text-2xl font-bold text-slate-800">{sessionsToday}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Log</p>
              <p className="text-2xl font-bold text-slate-800">{attendanceLog.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-700">Aktivitas Terakhir</h3>
          </div>
          <div>
            {recentLogs.length > 0 ? recentLogs.map(l => {
              const emp = employees.find(e => e.employeeId === l.employeeId)
              return (
                <div key={l.id} className="p-4 flex justify-between items-center hover:bg-slate-50 border-b border-slate-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${l.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {l.type === 'IN' ? <PlayCircle className="w-4 h-4" /> : <StopCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{emp?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{l.type === 'IN' ? 'Mulai Sesi' : 'Selesai Sesi'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{formatDate(l.timestamp)}</span>
                </div>
              )
            }) : (
              <div className="p-8 text-center text-slate-400 text-sm">Belum ada aktivitas sesi</div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Render Admin Employees
  const renderAdminEmployees = () => {
    const handleSaveEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)
      const customId = formData.get('customId') as string
      const name = formData.get('name') as string
      const role = formData.get('role') as string
      const salary = formData.get('salary') as string
      const pin = formData.get('pin') as string
      
      try {
        if (editingEmployee) {
          // Update
          await fetch('/api/employees', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingEmployee.id,
              employeeId: customId || editingEmployee.employeeId,
              name,
              role,
              salaryPerDay: parseInt(salary),
              pin
            })
          })
          showToast('Data berhasil diperbarui')
        } else {
          // Create
          const empId = customId || await generateEmployeeId()
          await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: empId,
              name,
              role,
              salaryPerDay: parseInt(salary),
              pin
            })
          })
          showToast('Data berhasil ditambahkan')
        }
        setShowEmployeeModal(false)
        setEditingEmployee(null)
        fetchData()
      } catch (error) {
        showToast('Gagal menyimpan data', 'error')
      }
    }
    
    const generateEmployeeId = async () => {
      const res = await fetch('/api/employees/generate-id')
      const data = await res.json()
      return data.nextId
    }
    
    const deleteEmployee = async (id: string) => {
      if (!confirm('Hapus data ini?')) return
      try {
        await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
        showToast('Data dihapus')
        fetchData()
      } catch (error) {
        showToast('Gagal menghapus data', 'error')
      }
    }
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">Data Tentor & Staf</h2>
          <button 
            onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true) }}
            className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">ID</th>
                  <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Nama</th>
                  <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Posisi</th>
                  <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Fee/Sesi</th>
                  <th className="p-4 font-semibold text-slate-600 text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                    <td className="p-4 font-mono text-indigo-600 font-bold whitespace-nowrap">{emp.employeeId}</td>
                    <td className="p-4 text-slate-800 whitespace-nowrap">{emp.name}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs uppercase tracking-wide border border-slate-200 whitespace-nowrap">{emp.role}</span>
                    </td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">{formatRupiah(emp.salaryPerDay)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingEmployee(emp); setShowEmployeeModal(true) }}
                          className="text-indigo-500 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-full"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteEmployee(emp.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada data tentor/staf</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Employee Modal */}
        <Modal 
          isOpen={showEmployeeModal} 
          onClose={() => { setShowEmployeeModal(false); setEditingEmployee(null) }}
          title={editingEmployee ? 'Edit Data' : 'Tambah Pengajar/Staf'}
        >
          <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID (Opsional / Custom)</label>
              <input 
                type="text" 
                name="customId"
                defaultValue={editingEmployee?.employeeId || ''}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase placeholder-slate-400" 
                placeholder="Kosongkan untuk Auto-Generate"
              />
              <p className="text-xs text-slate-400 mt-1">*Contoh: MTK-001, ADM-BUDI, dll.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                name="name"
                defaultValue={editingEmployee?.name || ''}
                required 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Posisi/Mapel</label>
              <select 
                name="role"
                defaultValue={editingEmployee?.role || ''}
                required 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Pilih Posisi...</option>
                {roles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fee per Sesi (Rp)</label>
              <input 
                type="number" 
                name="salary"
                defaultValue={editingEmployee?.salaryPerDay || ''}
                required 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">PIN Login (6 digit)</label>
              <input 
                type="text" 
                name="pin"
                defaultValue={editingEmployee?.pin || '123456'}
                maxLength={6}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-center tracking-widest" 
                placeholder="123456"
              />
              <p className="text-xs text-slate-400 mt-1">*Default: 123456</p>
            </div>
            <div className="pt-4 flex gap-3">
              <button type="button" onClick={() => { setShowEmployeeModal(false); setEditingEmployee(null) }} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Batal</button>
              <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Simpan</button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
  
  // Render Admin Activities
  const renderAdminActivities = () => {
    let sessions = getSessions()
    
    // Filtering
    if (filterActivityMonth) {
      sessions = sessions.filter(s => s.date.startsWith(filterActivityMonth))
    }
    if (filterActivityEmp) {
      sessions = sessions.filter(s => s.empId === filterActivityEmp)
    }
    
    const handleSaveActivity = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)
      
      const empId = formData.get('employeeId') as string
      const date = formData.get('date') as string
      const startTime = formData.get('startTime') as string
      const endTime = formData.get('endTime') as string
      const note = formData.get('note') as string
      
      try {
        // Create IN log
        const startTimestamp = new Date(`${date}T${startTime}`).toISOString()
        
        if (editingActivity?.startId) {
          // Update existing IN
          await fetch('/api/attendance', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingActivity.startId,
              employeeId: empId,
              type: 'IN',
              timestamp: startTimestamp
            })
          })
          
          // Handle OUT log
          if (endTime) {
            const endTimestamp = new Date(`${date}T${endTime}`).toISOString()
            if (editingActivity.endId) {
              await fetch('/api/attendance', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: editingActivity.endId,
                  employeeId: empId,
                  type: 'OUT',
                  timestamp: endTimestamp,
                  note
                })
              })
            } else {
              await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  employeeId: empId,
                  type: 'OUT',
                  timestamp: endTimestamp,
                  note
                })
              })
            }
          } else if (editingActivity.endId) {
            await fetch(`/api/attendance?id=${editingActivity.endId}`, { method: 'DELETE' })
          }
        } else {
          // Create new
          await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: empId,
              type: 'IN',
              timestamp: startTimestamp
            })
          })
          
          if (endTime) {
            const endTimestamp = new Date(`${date}T${endTime}`).toISOString()
            await fetch('/api/attendance', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                employeeId: empId,
                type: 'OUT',
                timestamp: endTimestamp,
                note
              })
            })
          }
        }
        
        setShowActivityModal(false)
        setEditingActivity(null)
        showToast('Aktivitas tersimpan')
        fetchData()
      } catch (error) {
        showToast('Gagal menyimpan aktivitas', 'error')
      }
    }
    
    const deleteActivity = async (session: Session) => {
      if (!confirm('Hapus sesi ini?')) return
      try {
        await fetch(`/api/attendance?id=${session.startId}`, { method: 'DELETE' })
        if (session.endId) {
          await fetch(`/api/attendance?id=${session.endId}`, { method: 'DELETE' })
        }
        showToast('Sesi dihapus')
        fetchData()
      } catch (error) {
        showToast('Gagal menghapus sesi', 'error')
      }
    }
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Aktivitas Tentor</h2>
            <p className="text-slate-500 text-sm">Monitoring sesi belajar per hari.</p>
          </div>
          <button 
            onClick={() => { setEditingActivity(null); setShowActivityModal(true) }}
            className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Manual
          </button>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-auto flex-1 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 min-w-[60px]">
              <Calendar className="w-4 h-4 inline mr-1" />Bulan:
            </span>
            <input 
              type="month" 
              value={filterActivityMonth} 
              onChange={e => setFilterActivityMonth(e.target.value)} 
              className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div className="w-full md:w-auto flex-1 flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600 min-w-[60px]">
              <User className="w-4 h-4 inline mr-1" />Tentor:
            </span>
            <select 
              value={filterActivityEmp} 
              onChange={e => setFilterActivityEmp(e.target.value)} 
              className="flex-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Semua Tentor</option>
              {employees.map(e => (
                <option key={e.id} value={e.employeeId}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Waktu</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Tentor</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Sesi</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Mulai</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Selesai</th>
                  <th className="p-4 font-bold text-slate-600 min-w-[200px]">Catatan</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                    <td className="p-4 align-top text-sm text-slate-600 whitespace-nowrap">
                      {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-4 align-top font-medium text-slate-800 whitespace-nowrap">{s.empName}</td>
                    <td className="p-4 align-top">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">Sesi {s.sessionIndex}</span>
                    </td>
                    <td className="p-4 align-top font-mono text-sm text-green-700 whitespace-nowrap">{formatTime(s.startTime)}</td>
                    <td className="p-4 align-top font-mono text-sm text-indigo-700 whitespace-nowrap">
                      {s.endTime ? formatTime(s.endTime) : '-'}
                    </td>
                    <td className="p-4 align-top text-sm text-slate-500 italic min-w-[200px]">{s.note || '-'}</td>
                    <td className="p-4 align-top">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingActivity(s); setShowActivityModal(true) }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteActivity(s)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 italic">Tidak ada data sesi untuk filter ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
  
  // Render Admin Payroll
  const renderAdminPayroll = () => {
    const filterDate = new Date(filterPayrollMonth + '-01')
    const filterMonth = filterDate.getMonth()
    const filterYear = filterDate.getFullYear()
    const filterMonthName = filterDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    
    let gTotal = 0
    let totalSessionsAll = 0
    
    const handleSavePayroll = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)
      
      try {
        await fetch('/api/payroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: editingPayroll?.employee.employeeId,
            month: filterMonth,
            year: filterYear,
            bonus: parseInt(formData.get('bonus') as string) || 0,
            allowance: parseInt(formData.get('allowance') as string) || 0
          })
        })
        
        setShowPayrollModal(false)
        setEditingPayroll(null)
        showToast('Komponen gaji tersimpan')
        fetchData()
      } catch (error) {
        showToast('Gagal menyimpan', 'error')
      }
    }
    
    const openPayslip = (emp: Employee) => {
      setPayslipEmployee(emp)
      setShowPayslipModal(true)
    }
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Rekapitulasi Gaji</h2>
            <p className="text-slate-500 text-sm">Kelola penggajian dan slip bulanan.</p>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2 bg-white p-1.5 border border-slate-300 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <span className="text-sm font-medium text-slate-600 mr-1 whitespace-nowrap">Periode:</span>
            <input 
              type="month" 
              value={filterPayrollMonth} 
              onChange={e => setFilterPayrollMonth(e.target.value)} 
              className="p-1 text-sm outline-none font-bold text-indigo-700 bg-transparent cursor-pointer w-full" 
            />
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm text-indigo-600">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Total Estimasi Payout</p>
                <p className="text-2xl font-bold text-slate-800">{formatRupiah(gTotal)}</p>
                <p className="text-xs text-slate-500">{filterMonthName}</p>
              </div>
            </div>
            <div className="h-px md:h-auto w-full md:w-px bg-indigo-200" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Total Sesi Mengajar</p>
                <p className="text-2xl font-bold text-slate-800">{totalSessionsAll} <span className="text-sm font-normal text-slate-500">Sesi</span></p>
                <p className="text-xs text-slate-500">{employees.length} Tentor Aktif</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 text-sm shadow-sm">
              <Calculator className="w-4 h-4" /> Rekap
            </button>
            <button onClick={() => window.print()} className="flex-1 md:flex-none bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 text-sm shadow-sm">
              <Printer className="w-4 h-4" /> Cetak
            </button>
          </div>
        </div>
        
        {/* Payroll Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-bold text-slate-600 w-12 text-center whitespace-nowrap">No</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Nama</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Fee Sesi</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Bonus</th>
                  <th className="p-4 font-bold text-slate-600 whitespace-nowrap">Tunjangan</th>
                  <th className="p-4 font-bold text-slate-600 text-right whitespace-nowrap">Total</th>
                  <th className="p-4 font-bold text-slate-600 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e, idx) => {
                  // Calculate sessions for this month
                  const work = attendanceLog.filter(l => 
                    l.employeeId === e.employeeId && 
                    l.type === 'IN' && 
                    new Date(l.timestamp).getMonth() === filterMonth &&
                    new Date(l.timestamp).getFullYear() === filterYear
                  ).length
                  
                  totalSessionsAll += work
                  
                  const key = getAdjustmentKey(e.employeeId, filterDate)
                  let adj = payrollAdjustments[key]
                  if (!adj) {
                    const r = roles.find(r => r.name === e.role)
                    adj = r ? { bonus: r.defaultBonus, allowance: r.defaultAllowance } : { bonus: 0, allowance: 0 }
                  }
                  
                  const tot = (work * e.salaryPerDay) + adj.bonus + adj.allowance
                  gTotal += tot
                  
                  return (
                    <tr key={e.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <td className="p-4 text-center text-slate-400 font-medium whitespace-nowrap">{idx + 1}</td>
                      <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                        {e.name}
                        <div className="text-xs text-slate-500 font-mono">{e.employeeId}</div>
                      </td>
                      <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                        <div>Fee: {formatRupiah(work * e.salaryPerDay)}</div>
                        <div className="text-xs text-slate-400">({work} Sesi)</div>
                      </td>
                      <td className="p-4 text-green-600 text-sm whitespace-nowrap">+ {formatRupiah(adj.bonus)}</td>
                      <td className="p-4 text-indigo-600 text-sm whitespace-nowrap">+ {formatRupiah(adj.allowance)}</td>
                      <td className="p-4 text-right font-bold text-slate-800 text-lg whitespace-nowrap">{formatRupiah(tot)}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => { setEditingPayroll({ employee: e, month: filterMonth, year: filterYear }); setShowPayrollModal(true) }}
                            className="bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 p-2 rounded-lg" 
                            title="Edit Komponen"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openPayslip(e)}
                            className="bg-slate-800 hover:bg-slate-900 text-white p-2 rounded-lg" 
                            title="Lihat Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">Belum ada data tentor/staf</td>
                  </tr>
                )}
              </tbody>
              {employees.length > 0 && (
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={5} className="p-4 text-right font-bold text-slate-700 uppercase text-sm tracking-wide">Total:</td>
                    <td className="p-4 text-right font-bold text-slate-900 text-xl whitespace-nowrap">{formatRupiah(gTotal)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
        
        {/* Payroll Edit Modal */}
        <Modal 
          isOpen={showPayrollModal} 
          onClose={() => { setShowPayrollModal(false); setEditingPayroll(null) }}
          title="Atur Komponen Gaji"
          size="sm"
        >
          <form onSubmit={handleSavePayroll} className="p-6 space-y-4">
            <div className="mb-4 bg-slate-50 p-3 rounded-lg">
              <p className="text-sm font-bold text-slate-800">{editingPayroll?.employee.name}</p>
              <p className="text-xs text-slate-500">{editingPayroll?.employee.role}</p>
              <p className="text-xs text-indigo-600 font-mono mt-1">
                Periode: {filterMonthName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bonus</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">Rp</span>
                <input 
                  type="number" 
                  name="bonus"
                  defaultValue={payrollAdjustments[getAdjustmentKey(editingPayroll?.employee.employeeId || '', filterDate)]?.bonus || roles.find(r => r.name === editingPayroll?.employee.role)?.defaultBonus || 0}
                  className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tunjangan</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">Rp</span>
                <input 
                  type="number" 
                  name="allowance"
                  defaultValue={payrollAdjustments[getAdjustmentKey(editingPayroll?.employee.employeeId || '', filterDate)]?.allowance || roles.find(r => r.name === editingPayroll?.employee.role)?.defaultAllowance || 0}
                  className="w-full pl-10 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex justify-center items-center gap-2">
                <Save className="w-4 h-4" /> Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
        
        {/* Payslip Modal */}
        <Modal 
          isOpen={showPayslipModal} 
          onClose={() => { setShowPayslipModal(false); setPayslipEmployee(null) }}
          title="Slip Honorarium"
          size="lg"
        >
          <div className="p-6">
            {payslipEmployee && (() => {
              const filterDate = new Date(filterPayrollMonth + '-01')
              const work = attendanceLog.filter(l => 
                l.employeeId === payslipEmployee.employeeId && 
                l.type === 'IN' && 
                new Date(l.timestamp).getMonth() === filterDate.getMonth() &&
                new Date(l.timestamp).getFullYear() === filterDate.getFullYear()
              ).length
              
              const key = getAdjustmentKey(payslipEmployee.employeeId, filterDate)
              let adj = payrollAdjustments[key]
              if (!adj) {
                const r = roles.find(r => r.name === payslipEmployee.role)
                adj = r ? { bonus: r.defaultBonus, allowance: r.defaultAllowance } : { bonus: 0, allowance: 0 }
              }
              
              const basic = work * payslipEmployee.salaryPerDay
              const total = basic + adj.bonus + adj.allowance
              
              return (
                <div className="text-center">
                  <div className="mb-6 border-b-2 border-slate-800 pb-4">
                    <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-wide">{company.name}</h1>
                    <p className="text-sm text-slate-600">{company.address}</p>
                    <div className="flex justify-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{company.phone}</span> • <span>{company.email}</span>
                    </div>
                    <p className="text-slate-800 font-bold uppercase text-sm tracking-widest mt-4 border-t border-dashed border-slate-300 pt-2 w-1/2 mx-auto">Slip Honorarium</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 mb-6 text-left">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Penerima</p>
                      <p className="font-bold text-lg text-slate-800">{payslipEmployee.name}</p>
                      <p className="text-sm text-slate-600">{payslipEmployee.role}</p>
                      <p className="text-sm font-mono text-slate-400 mt-1">{payslipEmployee.employeeId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Periode</p>
                      <p className="font-bold text-lg text-slate-800">{filterDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-1 mb-8">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="p-3 text-sm text-slate-600 text-left">Total Sesi ({work} Sesi)</td>
                          <td className="p-3 text-right font-medium text-slate-800">{formatRupiah(basic)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm text-slate-600 text-left">Bonus/Insentif</td>
                          <td className="p-3 text-right font-medium text-green-600">+ {formatRupiah(adj.bonus)}</td>
                        </tr>
                        <tr>
                          <td className="p-3 text-sm text-slate-600 text-left">Tunjangan Transport/Lain</td>
                          <td className="p-3 text-right font-medium text-blue-600">+ {formatRupiah(adj.allowance)}</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-slate-100 border-t border-slate-200">
                        <tr>
                          <td className="p-4 font-bold text-slate-800 uppercase text-sm text-left">Total Diterima</td>
                          <td className="p-4 text-right font-bold text-2xl text-slate-900">{formatRupiah(total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="flex justify-between mt-12 pt-4">
                    <div className="text-center w-40">
                      <p className="text-sm text-slate-500 mb-16">Penerima</p>
                      <p className="font-bold text-slate-800 border-t border-slate-300 pt-2">{payslipEmployee.name}</p>
                    </div>
                    <div className="text-center w-40">
                      <p className="text-sm text-slate-500 mb-16">Keuangan</p>
                      <p className="font-bold text-slate-800 border-t border-slate-300 pt-2">Admin LBB</p>
                    </div>
                  </div>
                </div>
              )
            })()}
            <div className="mt-6 flex gap-3">
              <button onClick={() => window.print()} className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium flex items-center justify-center gap-2">
                <Printer className="w-4 h-4" /> Cetak
              </button>
              <button onClick={() => { setShowPayslipModal(false); setPayslipEmployee(null) }} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Tutup</button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
  
  // Render Admin Settings
  const renderAdminSettings = () => {
    const getTabClass = (t: SettingsTabType) => 
      `flex-1 md:flex-none text-center md:text-left px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
        activeSettingsTab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
      }`
    
    const handleSaveCompany = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)
      
      try {
        await fetch('/api/company', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.get('companyName'),
            empPrefix: formData.get('empPrefix'),
            address: formData.get('companyAddress'),
            phone: formData.get('companyPhone'),
            email: formData.get('companyEmail'),
            website: formData.get('companyWebsite')
          })
        })
        showToast('Info disimpan')
        fetchData()
      } catch (error) {
        showToast('Gagal menyimpan', 'error')
      }
    }
    
    const handleSaveRole = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)
      
      try {
        if (editingRole) {
          await fetch('/api/roles', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingRole.id,
              name: formData.get('name'),
              salary: formData.get('salary'),
              defaultBonus: formData.get('defaultBonus'),
              defaultAllowance: formData.get('defaultAllowance')
            })
          })
        } else {
          await fetch('/api/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.get('name'),
              salary: formData.get('salary'),
              defaultBonus: formData.get('defaultBonus'),
              defaultAllowance: formData.get('defaultAllowance')
            })
          })
        }
        setShowRoleModal(false)
        setEditingRole(null)
        showToast('Posisi tersimpan')
        fetchData()
      } catch (error) {
        showToast('Gagal menyimpan', 'error')
      }
    }
    
    const deleteRole = async (id: string) => {
      if (!confirm('Hapus posisi ini?')) return
      try {
        await fetch(`/api/roles?id=${id}`, { method: 'DELETE' })
        showToast('Posisi dihapus')
        fetchData()
      } catch (error) {
        showToast('Gagal menghapus', 'error')
      }
    }
    
    const deleteAdmin = async (id: string) => {
      if (!confirm('Hapus admin ini?')) return
      try {
        const res = await fetch(`/api/admin?id=${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (res.ok) {
          showToast('Admin dihapus')
          fetchData()
        } else {
          showToast(data.error || 'Gagal menghapus', 'error')
        }
      } catch (error) {
        showToast('Gagal menghapus', 'error')
      }
    }
    
    const handleSaveAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      const formData = new FormData(form)
      
      try {
        if (editingAdmin) {
          await fetch('/api/admin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: editingAdmin.id,
              username: formData.get('username'),
              password: formData.get('password') || undefined,
              name: formData.get('name'),
              role: formData.get('role'),
              isActive: formData.get('isActive') === 'on'
            })
          })
        } else {
          await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: formData.get('username'),
              password: formData.get('password'),
              name: formData.get('name'),
              role: formData.get('role')
            })
          })
        }
        setShowAdminModal(false)
        setEditingAdmin(null)
        showToast('Admin tersimpan')
        fetchData()
      } catch (error) {
        showToast('Gagal menyimpan', 'error')
      }
    }
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan</h2>
          <p className="text-slate-500">Kelola identitas LBB dan data sistem</p>
        </div>
        
        <div className="border-b border-slate-200 mb-6 overflow-x-auto">
          <nav className="flex gap-4 min-w-max">
            <button onClick={() => setActiveSettingsTab('company')} className={getTabClass('company')}>Identitas LBB</button>
            <button onClick={() => setActiveSettingsTab('homepage')} className={getTabClass('homepage')}>Tampilan Depan</button>
            <button onClick={() => setActiveSettingsTab('roles')} className={getTabClass('roles')}>Profil Posisi</button>
            <button onClick={() => setActiveSettingsTab('admins')} className={getTabClass('admins')}>Admin</button>
            <button onClick={() => setActiveSettingsTab('database')} className={getTabClass('database')}>Database</button>
          </nav>
        </div>
        
        {activeSettingsTab === 'homepage' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Monitor className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-700 text-lg">Pengaturan Tampilan Depan</h3>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const formData = new FormData(form)
              
              try {
                const res = await fetch('/api/homepage', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    heroTitle: formData.get('heroTitle'),
                    heroSubtitle: formData.get('heroSubtitle'),
                    heroDescription: formData.get('heroDescription'),
                    heroImage: formData.get('heroImage'),
                    statusText: formData.get('statusText'),
                    adminCardTitle: formData.get('adminCardTitle'),
                    adminCardDesc: formData.get('adminCardDesc'),
                    tutorCardTitle: formData.get('tutorCardTitle'),
                    tutorCardDesc: formData.get('tutorCardDesc'),
                    showStats: formData.get('showStats') === 'on'
                  })
                })
                const data = await res.json()
                setHomePageSettings(data)
                showToast('Pengaturan halaman depan disimpan')
              } catch (error) {
                showToast('Gagal menyimpan', 'error')
              }
            }} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Judul Hero</label>
                  <input 
                    type="text" 
                    name="heroTitle"
                    defaultValue={homePageSettings.heroTitle}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subjudul Hero</label>
                  <input 
                    type="text" 
                    name="heroSubtitle"
                    defaultValue={homePageSettings.heroSubtitle}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea 
                  name="heroDescription"
                  defaultValue={homePageSettings.heroDescription}
                  rows={3}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Hero Image</label>
                <input 
                  type="text" 
                  name="heroImage"
                  defaultValue={homePageSettings.heroImage}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="/hero-image.png"
                />
                <p className="text-xs text-slate-400 mt-1">Contoh: /hero-image.png (file di folder public)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teks Status</label>
                <input 
                  type="text" 
                  name="statusText"
                  defaultValue={homePageSettings.statusText}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="Sistem Aktif"
                />
              </div>
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-medium text-slate-700 mb-3">Kartu Admin</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                    <input 
                      type="text" 
                      name="adminCardTitle"
                      defaultValue={homePageSettings.adminCardTitle}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                    <input 
                      type="text" 
                      name="adminCardDesc"
                      defaultValue={homePageSettings.adminCardDesc}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-medium text-slate-700 mb-3">Kartu Pengajar/Staf</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                    <input 
                      type="text" 
                      name="tutorCardTitle"
                      defaultValue={homePageSettings.tutorCardTitle}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                    <input 
                      type="text" 
                      name="tutorCardDesc"
                      defaultValue={homePageSettings.tutorCardDesc}
                      className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
                <input 
                  type="checkbox" 
                  name="showStats"
                  id="showStats"
                  defaultChecked={homePageSettings.showStats}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="showStats" className="text-sm text-slate-700">Tampilkan Statistik (Pengajar Aktif, Sesi Hari Ini, Log)</label>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeSettingsTab === 'company' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-700 text-lg">Identitas LBB</h3>
            </div>
            <form onSubmit={handleSaveCompany} className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama LBB</label>
                <input 
                  type="text" 
                  name="companyName"
                  defaultValue={company.name}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prefix ID (Otomatis)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    name="empPrefix"
                    defaultValue={company.empPrefix}
                    className="w-32 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono uppercase" 
                    required 
                  />
                  <span className="text-sm text-slate-400">Contoh: {company.empPrefix}001</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                <textarea 
                  name="companyAddress"
                  defaultValue={company.address}
                  rows={2} 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telepon</label>
                  <input 
                    type="text" 
                    name="companyPhone"
                    defaultValue={company.phone}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="companyEmail"
                    defaultValue={company.email}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <input 
                  type="text" 
                  name="companyWebsite"
                  defaultValue={company.website}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            </form>
          </div>
        )}
        
        {activeSettingsTab === 'roles' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-700 text-lg">Posisi & Fee</h3>
              </div>
              <button 
                onClick={() => { setEditingRole(null); setShowRoleModal(true) }}
                className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 text-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Posisi
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Nama Posisi</th>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Fee/Sesi</th>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Bonus Def</th>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Tunjangan Def</th>
                    <th className="p-4 font-semibold text-slate-600 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{r.name}</td>
                      <td className="p-4 text-slate-600 whitespace-nowrap">{formatRupiah(r.salary)}</td>
                      <td className="p-4 text-slate-600 whitespace-nowrap">{formatRupiah(r.defaultBonus)}</td>
                      <td className="p-4 text-slate-600 whitespace-nowrap">{formatRupiah(r.defaultAllowance)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingRole(r); setShowRoleModal(true) }} className="text-indigo-500 hover:text-indigo-700">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteRole(r.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {roles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada posisi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeSettingsTab === 'admins' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-700 text-lg">Manajemen Admin</h3>
              </div>
              <button 
                onClick={() => { setEditingAdmin(null); setShowAdminModal(true) }}
                className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 text-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Admin
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Username</th>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Nama</th>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Role</th>
                    <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Status</th>
                    <th className="p-4 font-semibold text-slate-600 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <td className="p-4 font-mono text-slate-800 whitespace-nowrap">{a.username}</td>
                      <td className="p-4 font-medium text-slate-800 whitespace-nowrap">{a.name}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${a.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {a.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingAdmin(a); setShowAdminModal(true) }} className="text-indigo-500 hover:text-indigo-700">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteAdmin(a.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada admin</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeSettingsTab === 'database' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-700 text-lg">Backup Database</h3>
                  <p className="text-sm text-slate-500">Unduh data sistem ke JSON.</p>
                </div>
              </div>
              <button className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium">
                <Download className="w-4 h-4" /> Download Backup
              </button>
            </div>
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-700 text-lg">Reset Database</h3>
                  <p className="text-sm text-red-600/80">Hapus semua data. Tidak bisa dibatalkan.</p>
                </div>
              </div>
              <button className="w-full md:w-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm font-medium border border-red-700">
                <AlertTriangle className="w-4 h-4" /> Hapus Semua Data
              </button>
            </div>
          </div>
        )}
        
        {/* Role Modal */}
        <Modal 
          isOpen={showRoleModal} 
          onClose={() => { setShowRoleModal(false); setEditingRole(null) }}
          title={editingRole ? 'Edit Posisi' : 'Tambah Posisi'}
        >
          <form onSubmit={handleSaveRole} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Posisi</label>
              <input 
                type="text" 
                name="name"
                defaultValue={editingRole?.name || ''}
                required 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Standar Fee per Sesi</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm">Rp</span>
                <input 
                  type="number" 
                  name="salary"
                  defaultValue={editingRole?.salary || ''}
                  required 
                  className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bonus Default</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm">Rp</span>
                  <input 
                    type="number" 
                    name="defaultBonus"
                    defaultValue={editingRole?.defaultBonus || 0}
                    className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tunjangan Default</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm">Rp</span>
                  <input 
                    type="number" 
                    name="defaultAllowance"
                    defaultValue={editingRole?.defaultAllowance || 0}
                    className="w-full pl-9 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Simpan Profil</button>
            </div>
          </form>
        </Modal>
        
        {/* Admin Modal */}
        <Modal 
          isOpen={showAdminModal} 
          onClose={() => { setShowAdminModal(false); setEditingAdmin(null) }}
          title={editingAdmin ? 'Edit Admin' : 'Tambah Admin'}
        >
          <form onSubmit={handleSaveAdmin} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                name="username"
                defaultValue={editingAdmin?.username || ''}
                required 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password {editingAdmin && '(kosongkan jika tidak diubah)'}</label>
              <input 
                type="password" 
                name="password"
                required={!editingAdmin}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder={editingAdmin ? '••••••••' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input 
                type="text" 
                name="name"
                defaultValue={editingAdmin?.name || ''}
                required 
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select 
                name="role"
                defaultValue={editingAdmin?.role || 'admin'}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
            {editingAdmin && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isActive"
                  id="adminIsActive"
                  defaultChecked={editingAdmin?.isActive ?? true}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="adminIsActive" className="text-sm text-slate-700">Akun Aktif</label>
              </div>
            )}
            <div className="pt-4">
              <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Simpan</button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
  
  // Render Employee Layout
  const renderEmployeeLayout = () => {
    if (!currentEmployee) return null
    
    const getNavClass = (tab: EmployeeTabType) => 
      `flex flex-col items-center gap-1 p-2 ${activeEmployeeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'} transition-colors`
    
    const myLogsToday = attendanceLog.filter(l => 
      l.employeeId === currentEmployee.employeeId && 
      l.timestamp.startsWith(new Date().toISOString().split('T')[0])
    ).reverse()
    
    const sessionsToday = myLogsToday.filter(l => l.type === 'IN').length
    const lastLog = myLogsToday[0]
    const isInSession = lastLog && lastLog.type === 'IN'
    
    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    const daysWorked = attendanceLog.filter(l => 
      l.employeeId === currentEmployee.employeeId && 
      l.type === 'IN' && 
      new Date(l.timestamp).getMonth() === month &&
      new Date(l.timestamp).getFullYear() === year
    ).length
    
    const key = getAdjustmentKey(currentEmployee.employeeId, new Date())
    let adj = payrollAdjustments[key]
    if (!adj) {
      const r = roles.find(r => r.name === currentEmployee.role)
      adj = r ? { bonus: r.defaultBonus, allowance: r.defaultAllowance } : { bonus: 0, allowance: 0 }
    }
    const basic = daysWorked * currentEmployee.salaryPerDay
    const total = basic + adj.bonus + adj.allowance
    
    return (
      <div className="flex min-h-screen bg-slate-50">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">PORTAL TENTOR</p>
            <h1 className="font-bold text-xl text-slate-800 truncate">{currentEmployee.name}</h1>
            <p className="text-sm text-slate-500">{currentEmployee.employeeId}</p>
          </div>
          <nav className="p-4 space-y-2 flex-1">
            <button onClick={() => setActiveEmployeeTab('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeEmployeeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <LayoutDashboard className="w-5 h-5" /><span>Dashboard</span>
            </button>
            <button onClick={() => setActiveEmployeeTab('attendance')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeEmployeeTab === 'attendance' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <CalendarCheck className="w-5 h-5" /><span>Riwayat Sesi</span>
            </button>
            <button onClick={() => setActiveEmployeeTab('salary')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeEmployeeTab === 'salary' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <Banknote className="w-5 h-5" /><span>Info Honor</span>
            </button>
            <button onClick={() => setActiveEmployeeTab('profile')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeEmployeeTab === 'profile' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <User className="w-5 h-5" /><span>Profil</span>
            </button>
          </nav>
          <div className="p-4 border-t border-slate-100">
            <button onClick={() => { setCurrentEmployeeId(null); setViewMode('terminal') }} className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 font-medium">
              <LogOut className="w-5 h-5" /><span>Keluar</span>
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
          {activeEmployeeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Halo, {currentEmployee.name.split(' ')[0]}!</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-500">Status:</span>
                  <span className={`px-2 py-0.5 rounded text-sm font-bold ${isInSession ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                    {isInSession ? 'MENGAJAR' : 'OFF'}
                  </span>
                </div>
              </div>
              
              {/* Attendance Panel */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden text-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="p-6 md:p-8 text-center relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-indigo-100 font-medium uppercase tracking-widest text-xs">Panel Absensi</p>
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                      Sesi: <span className="text-white text-lg ml-1">{sessionsToday}</span>
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold mb-8 font-mono" suppressHydrationWarning>{clockDisplay}</h3>
                  <div className="flex flex-col gap-3 max-w-sm mx-auto">
                    <button 
                      onClick={() => handleAttendance('IN')} 
                      disabled={isInSession}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isInSession ? 'bg-white/50 text-slate-300 cursor-not-allowed' : 'bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 shadow-lg'}`}
                    >
                      <div className={`p-1.5 rounded-full ${isInSession ? 'bg-white/20' : 'bg-indigo-100'}`}>
                        <Play className={`w-5 h-5 ${isInSession ? 'text-white' : 'text-indigo-600'}`} />
                      </div>
                      <span>MULAI SESI</span>
                    </button>
                    <button 
                      onClick={() => handleAttendance('OUT')} 
                      disabled={!isInSession}
                      className={`w-full py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-indigo-500/30 ${!isInSession ? 'bg-indigo-900/30 text-slate-400 cursor-not-allowed' : 'bg-indigo-800 hover:bg-indigo-900 active:scale-95 text-white shadow-lg'}`}
                    >
                      <div className={`p-1.5 rounded-full ${!isInSession ? 'bg-indigo-900/20' : 'bg-white/20'}`}>
                        <Square className="w-5 h-5 text-white" />
                      </div>
                      <span>SELESAI SESI</span>
                    </button>
                  </div>
                  <p className="text-xs text-indigo-200 mt-6">*Catatan wajib diisi sebelum selesai.</p>
                </div>
              </div>
              
              {/* Today's Activity */}
              <div>
                <h3 className="font-bold text-slate-800 mb-4">Aktivitas Hari Ini</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  {myLogsToday.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {myLogsToday.map(l => (
                        <div key={l.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${l.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {l.type === 'IN' ? <PlayCircle className="w-5 h-5" /> : <StopCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{l.type === 'IN' ? 'Mulai' : 'Selesai'}</p>
                              {l.note ? (
                                <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">"{l.note}"</p>
                              ) : (
                                <p className="text-xs text-slate-500 mt-1">{new Date(l.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-600 text-sm">{formatTime(l.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                      <CalendarCheck className="w-8 h-8 text-slate-300" />
                      <p className="text-sm">Belum ada aktivitas.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeEmployeeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800">Riwayat Sesi</h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Tanggal</th>
                        <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Sesi</th>
                        <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Waktu Mulai</th>
                        <th className="p-4 font-semibold text-slate-600 whitespace-nowrap">Waktu Selesai</th>
                        <th className="p-4 font-semibold text-slate-600 min-w-[200px]">Catatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSessions().filter(s => s.empId === currentEmployee.employeeId).map((s, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-slate-600 text-sm whitespace-nowrap">
                            {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">Sesi {s.sessionIndex}</span>
                          </td>
                          <td className="p-4 font-mono text-green-700 text-sm whitespace-nowrap">{formatTime(s.startTime)}</td>
                          <td className="p-4 font-mono text-indigo-700 text-sm whitespace-nowrap">
                            {s.endTime ? formatTime(s.endTime) : <span className="text-orange-500 font-bold text-xs">BERJALAN...</span>}
                          </td>
                          <td className="p-4 text-sm text-slate-500 italic">{s.note || '-'}</td>
                        </tr>
                      ))}
                      {getSessions().filter(s => s.empId === currentEmployee.employeeId).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-400 italic">Belum ada riwayat sesi mengajar.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeEmployeeTab === 'salary' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800">Info Honor</h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-700">Estimasi Bulan Ini</h3>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs">
                    {new Date().toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-2">
                    <p className="text-xs text-slate-400 uppercase">Total Sesi</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{daysWorked} <span className="text-sm font-normal text-slate-500">Sesi</span></p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-slate-400 uppercase">Bonus & Tunjangan</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{formatRupiah(adj.bonus + adj.allowance)}</p>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-slate-400 uppercase">Total Estimasi</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{formatRupiah(total)}</p>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <button 
                    onClick={() => { setPayslipEmployee(currentEmployee); setShowPayslipModal(true) }}
                    className="w-full md:w-auto bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <Printer className="w-4 h-4" /> Cetak Slip Honor
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Nilai final dihitung akhir periode.</p>
              </div>
            </div>
          )}
          
          {activeEmployeeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-800">Profil Saya</h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col items-center md:flex-row md:items-start gap-6 md:gap-8">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 border-4 border-white shadow-lg shrink-0">
                  {currentEmployee.name.charAt(0)}
                </div>
                <div className="space-y-4 flex-1 w-full text-center md:text-left">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{currentEmployee.name}</h3>
                    <p className="text-slate-500 font-mono">{currentEmployee.employeeId}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-left">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Posisi</p>
                      <p className="font-medium text-slate-700">{currentEmployee.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Fee / Sesi</p>
                      <p className="font-medium text-slate-700">{formatRupiah(currentEmployee.salaryPerDay)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Status</p>
                      <p className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold mt-1">Aktif</p>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setCurrentEmployeeId(null); setViewMode('terminal') }}
                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors md:hidden"
              >
                <LogOut className="w-5 h-5" /> Keluar
              </button>
            </div>
          )}
        </main>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[90] flex justify-around h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveEmployeeTab('dashboard')} className={getNavClass('dashboard')}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button onClick={() => setActiveEmployeeTab('attendance')} className={getNavClass('attendance')}>
            <CalendarCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold">Riwayat</span>
          </button>
          <button onClick={() => setActiveEmployeeTab('salary')} className={getNavClass('salary')}>
            <Banknote className="w-5 h-5" />
            <span className="text-[10px] font-bold">Gaji</span>
          </button>
          <button onClick={() => setActiveEmployeeTab('profile')} className={getNavClass('profile')}>
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profil</span>
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
        {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      </div>
      
      {/* Admin Login Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="Login Admin LBB" size="sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
            <Lock className="w-8 h-8" />
          </div>
          <p className="text-slate-500 text-sm mb-6">Masukkan kredensial admin</p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input 
              type="text" 
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              className="w-full text-center text-xl py-3 border-b-2 border-slate-300 focus:border-indigo-600 outline-none bg-transparent transition-colors text-slate-800" 
              placeholder="Username"
              autoFocus
              required
            />
            <input 
              type="password" 
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full text-center text-xl py-3 border-b-2 border-slate-300 focus:border-indigo-600 outline-none bg-transparent transition-colors text-slate-800" 
              placeholder="Password"
              required
            />
            <button type="submit" className="w-full py-3 bg-indigo-800 text-white rounded-xl font-bold hover:bg-indigo-900 transition-all active:scale-95 shadow-lg">
              MASUK
            </button>
            <button type="button" onClick={() => setShowPinModal(false)} className="text-sm text-slate-400 hover:text-slate-600 mt-4 block mx-auto">
              Batal
            </button>
          </form>
        </div>
      </Modal>
      
      {/* Teaching Note Modal */}
      <Modal isOpen={showTeachingNoteModal} onClose={() => setShowTeachingNoteModal(false)} title="Catatan Mengajar">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ringkasan Materi & Progres Siswa</label>
            <textarea 
              value={teachingNote}
              onChange={e => setTeachingNote(e.target.value)}
              rows={4} 
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
              placeholder="Contoh: Membahas Bab Aljabar, Siswa sudah paham konsep dasar tapi butuh latihan soal cerita..."
            />
            <p className="text-xs text-slate-400 mt-2">*Catatan ini akan tersimpan di riwayat aktivitas.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={() => setShowTeachingNoteModal(false)} className="py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50">Batal</button>
            <button onClick={submitTeachingNote} className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">Simpan & Selesai</button>
          </div>
        </div>
      </Modal>
      
      {/* Payslip Modal (Employee View) */}
      <Modal 
        isOpen={showPayslipModal} 
        onClose={() => { setShowPayslipModal(false); setPayslipEmployee(null) }}
        title="Slip Honorarium"
        size="lg"
      >
        <div className="p-6">
          {payslipEmployee && (() => {
            const filterDate = new Date()
            const work = attendanceLog.filter(l => 
              l.employeeId === payslipEmployee.employeeId && 
              l.type === 'IN' && 
              new Date(l.timestamp).getMonth() === filterDate.getMonth() &&
              new Date(l.timestamp).getFullYear() === filterDate.getFullYear()
            ).length
            
            const key = getAdjustmentKey(payslipEmployee.employeeId, filterDate)
            let adj = payrollAdjustments[key]
            if (!adj) {
              const r = roles.find(r => r.name === payslipEmployee.role)
              adj = r ? { bonus: r.defaultBonus, allowance: r.defaultAllowance } : { bonus: 0, allowance: 0 }
            }
            
            const basic = work * payslipEmployee.salaryPerDay
            const total = basic + adj.bonus + adj.allowance
            
            return (
              <div className="text-center">
                <div className="mb-6 border-b-2 border-slate-800 pb-4">
                  <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-wide">{company.name}</h1>
                  <p className="text-sm text-slate-600">{company.address}</p>
                  <div className="flex justify-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{company.phone}</span> • <span>{company.email}</span>
                  </div>
                  <p className="text-slate-800 font-bold uppercase text-sm tracking-widest mt-4 border-t border-dashed border-slate-300 pt-2 w-1/2 mx-auto">Slip Honorarium</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6 text-left">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Penerima</p>
                    <p className="font-bold text-lg text-slate-800">{payslipEmployee.name}</p>
                    <p className="text-sm text-slate-600">{payslipEmployee.role}</p>
                    <p className="text-sm font-mono text-slate-400 mt-1">{payslipEmployee.employeeId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Periode</p>
                    <p className="font-bold text-lg text-slate-800">{filterDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-1 mb-8">
                  <table className="w-full">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 text-sm text-slate-600 text-left">Total Sesi ({work} Sesi)</td>
                        <td className="p-3 text-right font-medium text-slate-800">{formatRupiah(basic)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-sm text-slate-600 text-left">Bonus/Insentif</td>
                        <td className="p-3 text-right font-medium text-green-600">+ {formatRupiah(adj.bonus)}</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-sm text-slate-600 text-left">Tunjangan Transport/Lain</td>
                        <td className="p-3 text-right font-medium text-blue-600">+ {formatRupiah(adj.allowance)}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-100 border-t border-slate-200">
                      <tr>
                        <td className="p-4 font-bold text-slate-800 uppercase text-sm text-left">Total Diterima</td>
                        <td className="p-4 text-right font-bold text-2xl text-slate-900">{formatRupiah(total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="flex justify-between mt-12 pt-4">
                  <div className="text-center w-40">
                    <p className="text-sm text-slate-500 mb-16">Penerima</p>
                    <p className="font-bold text-slate-800 border-t border-slate-300 pt-2">{payslipEmployee.name}</p>
                  </div>
                  <div className="text-center w-40">
                    <p className="text-sm text-slate-500 mb-16">Keuangan</p>
                    <p className="font-bold text-slate-800 border-t border-slate-300 pt-2">Admin LBB</p>
                  </div>
                </div>
              </div>
            )
          })()}
          <div className="mt-6 flex gap-3">
            <button onClick={() => window.print()} className="flex-1 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" /> Cetak
            </button>
            <button onClick={() => { setShowPayslipModal(false); setPayslipEmployee(null) }} className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50">Tutup</button>
          </div>
        </div>
      </Modal>
      
      {/* Main Content */}
      {viewMode === 'terminal' && renderTerminalMode()}
      {viewMode === 'admin' && renderAdminLayout()}
      {viewMode === 'employee' && renderEmployeeLayout()}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}
