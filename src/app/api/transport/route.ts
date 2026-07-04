import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { transport } from '@/lib/db/schema'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const routes = await db.query.transport.findMany()
    return NextResponse.json(routes)
  } catch (error) {
    console.error('GET transport error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    console.log('Creating transport:', body)

    if (!body.routeName || !body.routeNo || !body.vehicleNo || !body.driverName || !body.driverPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [route] = await db.insert(transport).values({
      routeName: body.routeName,
      routeNo: body.routeNo,
      vehicleNo: body.vehicleNo,
      driverName: body.driverName,
      driverPhone: body.driverPhone,
      capacity: body.capacity || 40,
      stops: body.stops || null,
      fee: body.fee || null,
    }).returning()

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error('POST transport error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
