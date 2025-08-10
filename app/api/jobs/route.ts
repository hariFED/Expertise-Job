import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCachedData, setCachedData } from "@/lib/redis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const location = searchParams.get("location") || ""
    const jobType = searchParams.get("jobType") || ""
    const locationType = searchParams.getAll("locationType")
    const experienceLevel = searchParams.getAll("experienceLevel")
    const featured = searchParams.get("featured") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    // Create cache key
    const cacheKey = `jobs:${JSON.stringify({
      query,
      location,
      jobType,
      locationType,
      experienceLevel,
      featured,
      limit,
      page,
    })}`

    // Try to get from cache
    const cachedData = await getCachedData(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Build where clause
    const where: any = {
      status: "OPEN",
    }

    if (featured) {
      where.featured = true
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { company: { name: { contains: query, mode: "insensitive" } } },
        { skills: { hasSome: [query] } },
      ]
    }

    if (location) {
      where.OR = [
        ...(where.OR || []),
        { location: { contains: location, mode: "insensitive" } },
        { company: { location: { contains: location, mode: "insensitive" } } },
      ]
    }

    if (jobType) {
      where.jobType = jobType
    }

    if (locationType.length > 0) {
      where.locationType = { in: locationType }
    }

    if (experienceLevel.length > 0) {
      where.experienceLevel = { in: experienceLevel }
    }

    // Fetch jobs
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              location: true,
            },
          },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ])

    const result = {
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }

    // Cache the result
    await setCachedData(cacheKey, result, 300) // 5 minutes

    return NextResponse.json(result)
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
