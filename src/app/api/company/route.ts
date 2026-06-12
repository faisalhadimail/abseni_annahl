import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET company settings
export async function GET() {
  try {
    let company = await db.company.findFirst()
    
    // Create default company if not exists
    if (!company) {
      company = await db.company.create({
        data: {
          name: 'LBB Annahl',
          empPrefix: 'TENTOR',
          address: 'Jl. Pendidikan No. 1',
          phone: '',
          email: '',
          website: ''
        }
      })
    }
    
    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}

// PUT update company settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { name, empPrefix, address, phone, email, website } = body
    
    let company = await db.company.findFirst()
    
    if (company) {
      company = await db.company.update({
        where: { id: company.id },
        data: {
          name,
          empPrefix: empPrefix?.toUpperCase(),
          address,
          phone,
          email,
          website
        }
      })
    } else {
      company = await db.company.create({
        data: {
          name,
          empPrefix: empPrefix?.toUpperCase(),
          address,
          phone,
          email,
          website
        }
      })
    }
    
    return NextResponse.json(company)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 })
  }
}
