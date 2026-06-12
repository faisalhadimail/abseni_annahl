import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all attendance logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM
    const employeeId = searchParams.get('employeeId')
    
    let where: any = {}
    
    if (employeeId) {
      where.employeeId = employeeId
    }
    
    if (month) {
      const [year, m] = month.split('-').map(Number)
      const startDate = new Date(year, m - 1, 1)
      const endDate = new Date(year, m, 0, 23, 59, 59)
      
      where.timestamp = {
        gte: startDate,
        lte: endDate
      }
    }
    
    const logs = await db.attendanceLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      include: {
        employee: true
      }
    })
    
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

// POST create attendance log (IN/OUT)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { employeeId, type, note, timestamp } = body
    
    // Verify employee exists
    const employee = await db.employee.findUnique({
      where: { employeeId }
    })
    
    if (!employee) {
      return NextResponse.json({ error: 'Karyawan tidak ditemukan' }, { status: 404 })
    }
    
    const log = await db.attendanceLog.create({
      data: {
        employeeId,
        type,
        note,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      },
      include: {
        employee: true
      }
    })
    
    return NextResponse.json(log)
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 })
  }
}

// PUT update attendance log
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, employeeId, type, note, timestamp } = body
    
    const log = await db.attendanceLog.update({
      where: { id },
      data: {
        employeeId,
        type,
        note,
        timestamp: timestamp ? new Date(timestamp) : undefined
      },
      include: {
        employee: true
      }
    })
    
    return NextResponse.json(log)
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 })
  }
}

// DELETE attendance log
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    await db.attendanceLog.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attendance:', error)
    return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 })
  }
}
