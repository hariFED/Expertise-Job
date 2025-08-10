import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAccessToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: jobId } = params
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyAccessToken(accessToken)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check if already saved
    const existingSave = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: payload.userId,
          jobId,
        },
      },
    })

    if (existingSave) {
      return NextResponse.json({ error: "Job already saved" }, { status: 409 })
    }

    // Save job
    await prisma.savedJob.create({
      data: {
        userId: payload.userId,
        jobId,
      },
    })

    return NextResponse.json({ message: "Job saved successfully" })
  } catch (error) {
    console.error("Save job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: jobId } = params
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const payload = verifyAccessToken(accessToken)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Remove saved job
    await prisma.savedJob.deleteMany({
      where: {
        userId: payload.userId,
        jobId,
      },
    })

    return NextResponse.json({ message: "Job removed from saved list" })
  } catch (error) {
    console.error("Remove saved job error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
