import { NextResponse } from "next/server"
import { findUserById, updateUser, deleteUser } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = findUserById(id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const { password, faceDescriptor, ...safe } = user
  return NextResponse.json({ user: safe })
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const updates = await req.json()
  delete updates.id
  delete updates.password
  const user = updateUser(id, updates)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const { password, faceDescriptor, ...safe } = user
  return NextResponse.json({ user: safe })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { id } = await params
  const deleted = deleteUser(id)
  if (!deleted) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
