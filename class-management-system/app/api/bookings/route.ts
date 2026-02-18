import { NextResponse } from "next/server"
import { getAllBookings, getBookingsByLecturer, createBooking, findClassById, notifyStudentsOfBooking } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function GET(req: Request) {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const lecturerId = url.searchParams.get("lecturerId")

  let bookings
  if (auth.role === "lecturer") {
    bookings = getBookingsByLecturer(auth.userId)
  } else if (lecturerId) {
    bookings = getBookingsByLecturer(lecturerId)
  } else {
    bookings = getAllBookings()
  }

  return NextResponse.json({ bookings })
}

export async function POST(req: Request) {
  const auth = await getAuthFromCookie()
  if (!auth || (auth.role !== "lecturer" && auth.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { classId, date, startTime, endTime } = await req.json()
  if (!classId || !date || !startTime || !endTime) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }
  const cls = findClassById(classId)
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 })

  const booking = createBooking({
    classId,
    lecturerId: auth.userId,
    date,
    startTime,
    endTime,
    status: "scheduled",
  })

  notifyStudentsOfBooking(booking, cls, "booking")

  return NextResponse.json({ booking }, { status: 201 })
}
