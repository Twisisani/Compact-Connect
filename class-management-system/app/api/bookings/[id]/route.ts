import { NextResponse } from "next/server"
import { findBookingById, updateBooking, findClassById, notifyStudentsOfBooking } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = findBookingById(id)
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  return NextResponse.json({ booking })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const updates = await req.json()

  const booking = findBookingById(id)
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

  const updated = updateBooking(id, updates)
  if (!updated) return NextResponse.json({ error: "Failed to update" }, { status: 500 })

  const cls = findClassById(updated.classId)
  if (cls) {
    if (updates.status === "cancelled") {
      notifyStudentsOfBooking(updated, cls, "cancellation")
    } else {
      notifyStudentsOfBooking(updated, cls, "update")
    }
  }

  return NextResponse.json({ booking: updated })
}
