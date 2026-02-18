import { NextResponse } from "next/server"
import { getAllBookings, getAllClasses, getAllUsers, getAttendanceByBooking } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function POST(req: Request) {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { dateFrom, dateTo, classId, lecturerId } = await req.json()

  const classes = getAllClasses()
  const users = getAllUsers()
  let bookings = getAllBookings()

  // Filter bookings
  if (dateFrom) bookings = bookings.filter((b) => b.date >= dateFrom)
  if (dateTo) bookings = bookings.filter((b) => b.date <= dateTo)
  if (classId) bookings = bookings.filter((b) => b.classId === classId)
  if (lecturerId) bookings = bookings.filter((b) => b.lecturerId === lecturerId)

  const rows = bookings.map((b) => {
    const cls = classes.find((c) => c.id === b.classId)
    const lecturer = users.find((u) => u.id === b.lecturerId)
    const attendance = getAttendanceByBooking(b.id)
    return {
      bookingId: b.id,
      className: cls?.name || "Unknown",
      room: cls?.room || "N/A",
      lecturer: lecturer?.name || "Unknown",
      date: b.date,
      time: `${b.startTime} - ${b.endTime}`,
      status: b.status,
      attendanceCount: attendance.length,
      capacity: cls?.capacity || 0,
    }
  })

  const summary = {
    totalBookings: rows.length,
    scheduledBookings: rows.filter((r) => r.status === "scheduled").length,
    cancelledBookings: rows.filter((r) => r.status === "cancelled").length,
    totalAttendance: rows.reduce((sum, r) => sum + r.attendanceCount, 0),
    averageAttendance: rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.attendanceCount, 0) / rows.length) : 0,
  }

  return NextResponse.json({ rows, summary })
}
