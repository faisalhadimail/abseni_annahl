import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Admin login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    const admin = await db.admin.findUnique({
      where: { username }
    })
    
    if (!admin) {
      return NextResponse.json({ error: 'Username tidak ditemukan' }, { status: 401 })
    }
    
    if (admin.password !== password) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 })
    }
    
    if (!admin.isActive) {
      return NextResponse.json({ error: 'Akun tidak aktif' }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Error admin login:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
