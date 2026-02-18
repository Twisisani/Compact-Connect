import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { findUserByEmail } from "@/lib/db"
import { setAuthCookie } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    const user = findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    const valid = bcrypt.compareSync(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    await setAuthCookie({ userId: user.id, role: user.role, email: user.email, name: user.name })
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
