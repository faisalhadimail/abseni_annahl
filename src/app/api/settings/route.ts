import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET app settings
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key) {
      const setting = await db.appSetting.findUnique({
        where: { key }
      })
      return NextResponse.json(setting)
    }
    
    const settings = await db.appSetting.findMany()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST or PUT setting (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, value } = body
    
    const setting = await db.appSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
    
    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
  }
}
