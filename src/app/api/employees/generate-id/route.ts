import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET next employee ID
export async function GET() {
  try {
    const company = await db.company.findFirst()
    const prefix = company?.empPrefix || 'TENTOR'
    
    // Get all employees with this prefix
    const employees = await db.employee.findMany({
      where: {
        employeeId: {
          startsWith: prefix
        }
      },
      orderBy: { employeeId: 'desc' }
    })
    
    let nextNum = 1
    
    if (employees.length > 0) {
      // Extract number from last employee ID
      const lastEmployee = employees[0]
      const lastNum = parseInt(lastEmployee.employeeId.replace(prefix, ''))
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1
      }
    }
    
    const nextId = `${prefix}${String(nextNum).padStart(3, '0')}`
    
    return NextResponse.json({ nextId })
  } catch (error) {
    console.error('Error generating ID:', error)
    return NextResponse.json({ error: 'Failed to generate ID' }, { status: 500 })
  }
}
