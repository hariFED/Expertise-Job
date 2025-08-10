"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, MapPin, Briefcase, Users, TrendingUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { JobCard } from "@/components/job-card"
import { useSearchStore, useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
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

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { query, location, setQuery, setLocation } = useSearchStore()
  const { isAuthenticated, user } = useAuthStore()
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLocation, setSearchLocation] = useState("")

  useEffect(() => {
    fetchFeaturedJobs()
  }, [])

  const fetchFeaturedJobs = async () => {
    try {
      const response = await fetch("/api/jobs?featured=true&limit=6")
      if (response.ok) {
        const data = await response.json()
        setFeaturedJobs(data.jobs)
      }
    } catch (error) {
      console.error("Error fetching featured jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchQuery)
    setLocation(searchLocation)

    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (searchLocation) params.set("location", searchLocation)

    router.push(`/jobs?${params.toString()}`)
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your <span className="text-expertisor-yellow">Dream Job</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with top companies and discover opportunities that match your skills and ambitions. Join thousands
              of professionals finding their perfect career.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-0 focus:ring-0 text-base"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="City, state, or remote"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10 h-12 border-0 focus:ring-0 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8 bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900 font-semibold"
                >
                  Search Jobs
                </Button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-12 h-12 bg-expertisor-yellow/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-6 h-6 text-expertisor-yellow" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">10,000+</h3>
                <p className="text-gray-600">Active Jobs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-expertisor-yellow/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-expertisor-yellow" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">50,000+</h3>
                <p className="text-gray-900">Professionals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-expertisor-yellow/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-expertisor-yellow" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">95%</h3>
                <p className="text-gray-600">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Jobs</h2>
              <p className="text-gray-600">Discover hand-picked opportunities from top companies</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/jobs")} className="hidden md:flex items-center">
              View All Jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} onApply={() => handleApply(job.id)} />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" onClick={() => router.push("/jobs")} className="w-full">
              View All Jobs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900 font-semibold"
              onClick={() => router.push("/jobs")}
            >
              Browse Jobs
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                Sign Up Free
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
