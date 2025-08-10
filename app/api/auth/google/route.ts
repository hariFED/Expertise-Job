import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sign } from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    
    if (!code) {
      // Redirect to Google OAuth
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL || "http://localhost:3000")}/api/auth/google&` +
        `response_type=code&` +
        `scope=openid email profile&` +
        `access_type=offline`
      
      return NextResponse.redirect(googleAuthUrl)
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/google`,
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error("Failed to get tokens")
    }

    // Get user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const googleUser = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error("Failed to get user info")
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleId: googleUser.id },
    })

    if (!user) {
      // Check if user exists with same email
      const existingUser = await prisma.user.findUnique({
        where: { email: googleUser.email },
      })

      if (existingUser) {
        // Update existing user with Google ID
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { googleId: googleUser.id },
        })
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.id,
            role: "USER" as const,
          },
        })
      }
    }

    // Generate JWT tokens
    const accessToken = sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    )

    const refreshToken = sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    )

    // Store refresh token in database
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    // Redirect to frontend with tokens
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("accessToken", accessToken)
    redirectUrl.searchParams.set("refreshToken", refreshToken)
    redirectUrl.searchParams.set("auth", "success")

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Google OAuth error:", error)
    
    const redirectUrl = new URL("/", request.url)
    redirectUrl.searchParams.set("auth", "error")
    redirectUrl.searchParams.set("message", "Authentication failed")
    
    return NextResponse.redirect(redirectUrl)
  }
}
