import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token" },
        { status: 401 }
      )
    }

    // Verify the access token
    let payload
    try {
      payload = verifyAccessToken(accessToken)
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    if (!payload?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token payload" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        location: true,
        headline: true,
        bio: true,
        skills: true,
        resume: true,
        portfolio: true,
        verified: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile: user })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - No access token" },
        { status: 401 }
      )
    }

    // Verify the access token
    let payload
    try {
      payload = verifyAccessToken(accessToken)
    } catch (error) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      )
    }

    if (!payload?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token payload" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      location,
      headline,
      bio,
      skills,
    } = body

    const updatedUser = await prisma.user.update({
      where: { email: payload.email },
      data: {
        name,
        location,
        headline,
        bio,
        skills,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        location: true,
        headline: true,
        bio: true,
        skills: true,
        resume: true,
        portfolio: true,
        verified: true,
      }
    })

    return NextResponse.json({ profile: updatedUser })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
