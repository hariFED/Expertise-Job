import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { revokeSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("refreshToken")?.value

    if (refreshToken) {
      // Revoke session from database
      await revokeSession(refreshToken)
    }

    // Clear cookies
    cookieStore.delete("accessToken")
    cookieStore.delete("refreshToken")

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
