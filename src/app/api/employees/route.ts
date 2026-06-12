import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all employees
export async function GET() {
  try {
    const employees = await db.employee.findMany({
      orderBy: { employeeId: 'asc' },
      include: {
        roleRel: true
      }
    })
    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

// POST create new employee
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employeeId, name, role, salaryPerDay, pin } = body
    
    // Check if employeeId already exists
    const existing = await db.employee.findUnique({
      where: { employeeId }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'ID sudah digunakan' }, { status: 400 })
    }
    
    const employee = await db.employee.create({
      data: {
        employeeId,
        name,
        role,
        salaryPerDay: parseInt(salaryPerDay) || 0,
        pin: pin || '123456'
      }
    })
    
    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

// PUT update employee
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, employeeId, name, role, salaryPerDay, pin, isActive } = body
    
    // Check if new employeeId conflicts with another employee
    if (employeeId) {
      const existing = await db.employee.findFirst({
        where: {
          employeeId,
          NOT: { id }
        }
      })
      
      if (existing) {
        return NextResponse.json({ error: 'ID sudah digunakan' }, { status: 400 })
      }
    }
    
    const updateData: any = {}
    if (employeeId) updateData.employeeId = employeeId
    if (name) updateData.name = name
    if (role) updateData.role = role
    if (salaryPerDay !== undefined) updateData.salaryPerDay = parseInt(salaryPerDay) || 0
    if (pin) updateData.pin = pin
    if (isActive !== undefined) updateData.isActive = isActive
    
    const employee = await db.employee.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

// DELETE employee
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    // Delete related attendance logs
    await db.attendanceLog.deleteMany({
      where: { employeeId: id }
    })
    
    // Delete related payroll adjustments
    await db.payrollAdjustment.deleteMany({
      where: { employeeId: id }
    })
    
    // Delete employee
    await db.employee.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}
