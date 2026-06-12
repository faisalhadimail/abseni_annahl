import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET payroll adjustments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // 0-11
    const year = searchParams.get('year')
    const employeeId = searchParams.get('employeeId')
    
    let where: any = {}
    
    if (month !== null && year) {
      where.month = parseInt(month)
      where.year = parseInt(year)
    }
    
    if (employeeId) {
      where.employeeId = employeeId
    }
    
    const adjustments = await db.payrollAdjustment.findMany({
      where,
      include: {
        employee: true
      }
    })
    
    return NextResponse.json(adjustments)
  } catch (error) {
    console.error('Error fetching payroll:', error)
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 })
  }
}

// POST or PUT payroll adjustment (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employeeId, month, year, bonus, allowance } = body
    
    // Check if adjustment exists
    const existing = await db.payrollAdjustment.findFirst({
      where: {
        employeeId,
        month: parseInt(month),
        year: parseInt(year)
      }
    })
    
    let adjustment
    
    if (existing) {
      adjustment = await db.payrollAdjustment.update({
        where: { id: existing.id },
        data: {
          bonus: parseInt(bonus) || 0,
          allowance: parseInt(allowance) || 0
        },
        include: {
          employee: true
        }
      })
    } else {
      adjustment = await db.payrollAdjustment.create({
        data: {
          employeeId,
          month: parseInt(month),
          year: parseInt(year),
          bonus: parseInt(bonus) || 0,
          allowance: parseInt(allowance) || 0
        },
        include: {
          employee: true
        }
      })
    }
    
    return NextResponse.json(adjustment)
  } catch (error) {
    console.error('Error saving payroll:', error)
    return NextResponse.json({ error: 'Failed to save payroll' }, { status: 500 })
  }
}
