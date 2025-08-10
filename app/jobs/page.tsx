"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JobCard } from "@/components/job-card"
import { JobFilters } from "@/components/job-filters"
import { useSearchStore, useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string
  title: string
  description: string
  location?: string
  locationType: "REMOTE" | "ONSITE" | "HYBRID"
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE"
  salaryMin?: number
  salaryMax?: number
  currency: string
  skills: string[]
  createdAt: string
  company: {
    id: string
    name: string
    logo?: string
    location?: string
  }
}

export default function JobsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { query, location, setQuery, setLocation, filters } = useSearchStore()
  const { isAuthenticated, user } = useAuthStore()

  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLocation, setSearchLocation] = useState("")

  useEffect(() => {
    // Initialize search from URL params
    const urlQuery = searchParams.get("q") || ""
    const urlLocation = searchParams.get("location") || ""

    setSearchQuery(urlQuery)
    setSearchLocation(urlLocation)
    setQuery(urlQuery)
    setLocation(urlLocation)
  }, [searchParams, setQuery, setLocation])

  useEffect(() => {
    fetchJobs()
  }, [query, location, filters, pagination.page])

  const fetchJobs = async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      if (location) params.set("location", location)
      if (filters.locationType.length > 0) {
        filters.locationType.forEach((type) => params.append("locationType", type))
      }
      if (filters.experienceLevel.length > 0) {
        filters.experienceLevel.forEach((level) => params.append("experienceLevel", level))
      }
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())

      const response = await fetch(`/api/jobs?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch jobs. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchQuery)
    setLocation(searchLocation)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleApply = async (jobId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to apply for jobs.",
        variant: "destructive",
      })
      return
    }

    if (user?.role !== "USER") {
      toast({
        title: "Not available",
        description: "Only job seekers can apply for positions.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        toast({
          title: "Application submitted!",
          description: "Your application has been sent successfully.",

        })
      } else {
        const data = await response.json()
        toast({
          title: "Application failed",
          description: data.error || "Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Next Job</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-lg shadow-md border border-gray-200">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-0 focus:ring-0"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="City, state, or remote"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10 h-10 border-0 focus:ring-0"
                />
              </div>
              <Button type="submit" className="h-10 px-6 bg-[#fcce18] hover:bg-[#fcce18]/90 text-gray-900 font-medium">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <JobFilters />

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isLoading ? "Searching..." : `${pagination.total} jobs found`}
                </h2>
                {(query || location) && (
                  <p className="text-gray-600 mt-1">
                    {query && `"${query}"`}
                    {query && location && " in "}
                    {location && `${location}`}
                  </p>
                )}
              </div>
            </div>

            {/* Job Results */}
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="flex space-x-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters to find more opportunities.
                </p>
                <Button
                  onClick={() => {
                    setQuery("")
                    setLocation("")
                    setSearchQuery("")
                    setSearchLocation("")
                  }}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} onApply={() => handleApply(job.id)} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>

                    {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                      const pageNum = i + 1
                      const isActive = pageNum === pagination.page

                      return (
                        <Button
                          key={pageNum}
                          variant={isActive ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                          className={isActive ? "bg-[#fcce18] hover:bg-[#fcce18]/90 text-gray-900" : ""}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
