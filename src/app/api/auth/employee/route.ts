import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Employee login with ID and PIN
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employeeId, pin } = body
    
    const employee = await db.employee.findUnique({
      where: { employeeId }
    })
    
    if (!employee) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 401 })
    }
    
    if (employee.pin !== pin) {
      return NextResponse.json({ error: 'PIN salah' }, { status: 401 })
    }
    
    if (!employee.isActive) {
      return NextResponse.json({ error: 'Akun tidak aktif' }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role,
        salaryPerDay: employee.salaryPerDay
      }
    })
  } catch (error) {
    console.error('Error employee login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
