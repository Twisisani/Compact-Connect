import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { findUserByEmail, createUser } from "@/lib/db"
import { setAuthCookie } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { name, email, password, faceDescriptor } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }
    if (findUserByEmail(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }
    const hashedPassword = bcrypt.hashSync(password, 10)
    const user = createUser({
      name,
      email,
      password: hashedPassword,
      role: "student",
      faceDescriptor: faceDescriptor || null,
      profilePicture: null,
    })
    await setAuthCookie({ userId: user.id, role: user.role, email: user.email, name: user.name })
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
