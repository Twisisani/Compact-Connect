import { NextResponse } from "next/server"
import { getNotificationsByUser } from "@/lib/db"
import { getAuthFromCookie } from "@/lib/auth"

export async function GET() {
  const auth = await getAuthFromCookie()
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const notifications = getNotificationsByUser(auth.userId)
  return NextResponse.json({ notifications })
}
