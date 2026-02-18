import { NextResponse } from "next/server"
import { getAllClasses, createClass } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function GET() {
  const classes = getAllClasses()
  return NextResponse.json({ classes })
}

export async function POST(req: Request) {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { name, description, capacity, room } = await req.json()
  if (!name || !room) {
    return NextResponse.json({ error: "Name and room are required" }, { status: 400 })
  }
  const cls = createClass({
    name,
    description: description || "",
    capacity: capacity || 30,
    room,
    createdBy: auth.userId,
  })
  return NextResponse.json({ class: cls }, { status: 201 })
}
