import { NextResponse } from "next/server"
import { getAllUsers } from "@/lib/db"
import { setAuthCookie, euclideanDistance } from "@/lib/auth"

const FACE_MATCH_THRESHOLD = 0.6

export async function POST(req: Request) {
  try {
    const { faceDescriptor } = await req.json()
    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return NextResponse.json({ error: "Face descriptor is required" }, { status: 400 })
    }

    const users = getAllUsers()
    let bestMatch = null
    let bestDistance = Infinity

    for (const user of users) {
      if (!user.faceDescriptor) continue
      const distance = euclideanDistance(faceDescriptor, user.faceDescriptor)
      if (distance < bestDistance) {
        bestDistance = distance
        bestMatch = user
      }
    }

    if (!bestMatch || bestDistance > FACE_MATCH_THRESHOLD) {
      return NextResponse.json({ error: "No matching face found. Please try again or use email login." }, { status: 401 })
    }

    await setAuthCookie({ userId: bestMatch.id, role: bestMatch.role, email: bestMatch.email, name: bestMatch.name })
    return NextResponse.json({
      user: { id: bestMatch.id, name: bestMatch.name, email: bestMatch.email, role: bestMatch.role, profilePicture: bestMatch.profilePicture },
      confidence: 1 - bestDistance,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
