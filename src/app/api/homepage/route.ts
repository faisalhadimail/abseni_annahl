import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET home page settings
export async function GET() {
  try {
    let settings = await db.homePageSettings.findFirst()
    
    // Create default settings if not exists
    if (!settings) {
      settings = await db.homePageSettings.create({
        data: {}
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching home page settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT update home page settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    let settings = await db.homePageSettings.findFirst()
    
    if (!settings) {
      settings = await db.homePageSettings.create({
        data: {
          heroTitle: body.heroTitle,
          heroSubtitle: body.heroSubtitle,
          heroDescription: body.heroDescription,
          heroImage: body.heroImage,
          statusText: body.statusText,
          adminCardTitle: body.adminCardTitle,
          adminCardDesc: body.adminCardDesc,
          tutorCardTitle: body.tutorCardTitle,
          tutorCardDesc: body.tutorCardDesc,
          showStats: body.showStats
        }
      })
    } else {
      settings = await db.homePageSettings.update({
        where: { id: settings.id },
        data: {
          heroTitle: body.heroTitle,
          heroSubtitle: body.heroSubtitle,
          heroDescription: body.heroDescription,
          heroImage: body.heroImage,
          statusText: body.statusText,
          adminCardTitle: body.adminCardTitle,
          adminCardDesc: body.adminCardDesc,
          tutorCardTitle: body.tutorCardTitle,
          tutorCardDesc: body.tutorCardDesc,
          showStats: body.showStats
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating home page settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
