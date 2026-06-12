import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all roles
export async function GET() {
  try {
    const roles = await db.role.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

// POST create new role
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, salary, defaultBonus, defaultAllowance } = body
    
    const role = await db.role.create({
      data: {
        name,
        salary: parseInt(salary) || 0,
        defaultBonus: parseInt(defaultBonus) || 0,
        defaultAllowance: parseInt(defaultAllowance) || 0
      }
    })
    
    return NextResponse.json(role)
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}

// PUT update role
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, salary, defaultBonus, defaultAllowance } = body
    
    const role = await db.role.update({
      where: { id },
      data: {
        name,
        salary: parseInt(salary) || 0,
        defaultBonus: parseInt(defaultBonus) || 0,
        defaultAllowance: parseInt(defaultAllowance) || 0
      }
    })
    
    return NextResponse.json(role)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

// DELETE role
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    await db.role.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
