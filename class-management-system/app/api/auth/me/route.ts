import { NextResponse } from "next/server"
import { getAuthFromCookie } from "@/lib/auth"
import { findUserById } from "@/lib/db"

export async function GET() {
  const auth = await getAuthFromCookie()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const user = findUserById(auth.userId)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
  })
}
