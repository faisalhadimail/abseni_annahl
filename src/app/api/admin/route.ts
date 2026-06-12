import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all admins
export async function GET() {
  try {
    const admins = await db.admin.findMany({
      orderBy: { createdAt: 'desc' }
    })
    // Don't return passwords
    const safeAdmins = admins.map(a => ({
      id: a.id,
      username: a.username,
      name: a.name,
      role: a.role,
      isActive: a.isActive,
      createdAt: a.createdAt
    }))
    return NextResponse.json(safeAdmins)
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}

// POST create new admin
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password, name, role } = body
    
    // Check if username exists
    const existing = await db.admin.findUnique({
      where: { username }
    })
    
    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }
    
    const admin = await db.admin.create({
      data: {
        username,
        password,
        name,
        role: role || 'admin'
      }
    })
    
    return NextResponse.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}

// PUT update admin
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, username, password, name, role, isActive } = body
    
    // Check if username conflicts
    if (username) {
      const existing = await db.admin.findFirst({
        where: {
          username,
          NOT: { id }
        }
      })
      
      if (existing) {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
      }
    }
    
    const updateData: any = {}
    if (username) updateData.username = username
    if (password) updateData.password = password
    if (name) updateData.name = name
    if (role) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive
    
    const admin = await db.admin.update({
      where: { id },
      data: updateData
    })
    
    return NextResponse.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive
    })
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

// DELETE admin
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    
    // Check if this is the last admin
    const count = await db.admin.count()
    if (count <= 1) {
      return NextResponse.json({ error: 'Tidak dapat menghapus admin terakhir' }, { status: 400 })
    }
    
    await db.admin.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
  }
}
