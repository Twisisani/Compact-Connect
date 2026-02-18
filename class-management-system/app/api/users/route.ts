import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getAllUsers, createUser } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"
import type { SafeUser } from "@/lib/types"

export async function GET(req: Request) {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const role = url.searchParams.get("role")

  let users = getAllUsers()
  if (role) users = users.filter((u) => u.role === role)

  const safeUsers: SafeUser[] = users.map(({ password, faceDescriptor, ...rest }) => rest)
  return NextResponse.json({ users: safeUsers })
}

export async function POST(req: Request) {
  const auth = await getAuthFromCookie()
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const { name, email, password, role } = await req.json()
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }
  const user = createUser({
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    faceDescriptor: null,
    profilePicture: null,
  })
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture, createdAt: user.createdAt },
  }, { status: 201 })
}
