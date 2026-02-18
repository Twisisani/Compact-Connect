import { NextResponse } from "next/server"
import { getAttendanceByBooking, createAttendance, findBookingById } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const attendance = getAttendanceByBooking(id)
  return NextResponse.json({ attendance })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const { studentId, method } = await req.json()

  const booking = findBookingById(id)
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  const att = createAttendance({
    bookingId: id,
    studentId: studentId || auth.userId,
    markedAt: new Date().toISOString(),
    method: method || "manual",
  })

  return NextResponse.json({ attendance: att }, { status: 201 })
}
