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

    // Check if user is a job seeker
    if (payload.role !== "USER") {
      return NextResponse.json({ error: "Only job seekers can apply for positions" }, { status: 403 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, title: true },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (job.status !== "OPEN") {
      return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 400 })
    }

    // Check if user has already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: payload.userId,
          jobId,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 409 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: payload.userId,
        jobId,
        status: "PENDING",
      },
      include: {
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      message: "Application submitted successfully",
      application,
    })
  } catch (error) {
    console.error("Job application error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
