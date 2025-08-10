import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const cacheKey = `job:${id}`

    // Try to get from cache
    const cachedJob = await getCachedData(cacheKey)
    if (cachedJob) {
      return NextResponse.json(cachedJob)
    }

    // Fetch job from database
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            location: true,
            description: true,
            website: true,
            size: true,
          },
        },
        applications: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Increment view count
    await prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    // Cache the job
    await setCachedData(cacheKey, job, 300) // 5 minutes

    return NextResponse.json(job)
  } catch (error) {
    console.error("Job fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
