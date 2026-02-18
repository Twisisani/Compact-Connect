import { NextResponse } from "next/server"
import { findClassById, updateClass, deleteClass } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cls = findClassById(id)
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 })
  return NextResponse.json({ class: cls })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const updates = await req.json()
  delete updates.id
  const cls = updateClass(id, updates)
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 })
  return NextResponse.json({ class: cls })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const deleted = deleteClass(id)
  if (!deleted) return NextResponse.json({ error: "Class not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
