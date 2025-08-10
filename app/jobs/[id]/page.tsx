"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Users,
  Globe,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface JobDetails {
  id: string
  title: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  location?: string
  locationType: "REMOTE" | "ONSITE" | "HYBRID"
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "FREELANCE"
  salaryMin?: number
  salaryMax?: number
  currency: string
  skills: string[]
  experienceLevel: string
  applicationUrl?: string
  applicationEmail?: string
  questions: string[]
  views: number
  createdAt: string
  company: {
    id: string
    name: string
    logo?: string
    location?: string
    description?: string
    website?: string
    size?: string
  }
  applications: Array<{ id: string; userId: string }>
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuthStore()

  const [job, setJob] = useState<JobDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchJobDetails(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (job && isAuthenticated && user) {
      setHasApplied(job.applications.some((app) => app.userId === user.id))
    }
  }, [job, isAuthenticated, user])

  const fetchJobDetails = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)

      if (response.ok) {
        const jobData = await response.json()
        setJob(jobData)
      } else if (response.status === 404) {
        toast({
          title: "Job not found",
          description: "The job you are looking for does not exist.",
          variant: "destructive",
        })
        router.push("/jobs")
      } else {
        throw new Error("Failed to fetch job")
      }
    } catch (error) {
      console.error("Error fetching job details:", error)
      toast({
        title: "Error",
        description: "Failed to load job details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async () => {
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

    if (hasApplied) {
      toast({
        title: "Already applied",
        description: "You have already applied for this position.",
        variant: "destructive",
      })
      return
    }

    setIsApplying(true)

    try {
      const response = await fetch(`/api/jobs/${params.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setHasApplied(true)
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
    } finally {
      setIsApplying(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/jobs/${params.id}/save`, {
        method: isSaved ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsSaved(!isSaved)
        toast({
          title: isSaved ? "Job removed" : "Job saved",
          description: isSaved ? "Job removed from your saved list." : "Job saved to your list.",
        })
      } else {
        throw new Error("Failed to update bookmark")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatSalary = (min?: number, max?: number, currency = "USD") => {
    if (!min && !max) return null

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    return formatter.format(min || max || 0)
  }

  const formatJobType = (type: string) => {
    const types = {
      FULL_TIME: "Full-time",
      PART_TIME: "Part-time",
      CONTRACT: "Contract",
      FREELANCE: "Freelance",
    }
    return types[type as keyof typeof types] || type
  }

  const formatLocationType = (type: string) => {
    const types = {
      REMOTE: "Remote",
      ONSITE: "On-site",
      HYBRID: "Hybrid",
    }
    return types[type as keyof typeof types] || type
  }

  const formatExperienceLevel = (level: string) => {
    const levels = {
      ENTRY: "Entry Level",
      MID: "Mid Level",
      SENIOR: "Senior Level",
      LEAD: "Lead",
      EXECUTIVE: "Executive",
    }
    return levels[level as keyof typeof levels] || level
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays}d ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {job.company.logo ? (
                      <img
                        src={job.company.logo || "/placeholder.svg"}
                        alt={job.company.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                      <p className="text-lg text-gray-600 font-medium">{job.company.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSave}
                      className="hover:bg-[#fcce18]/10 bg-transparent"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-[#fcce18]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      onClick={handleApply}
                      disabled={isApplying || hasApplied}
                      className="bg-[#fcce18] hover:bg-[#fcce18]/90 text-gray-900 font-medium"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : hasApplied ? (
                        "Applied"
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Job Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                  )}
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency) && (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Posted {timeAgo(job.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {job.views} views
                  </div>
                </div>

                {/* Job Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary" className="bg-[#fcce18]/10 text-[#fcce18]">
                    {formatJobType(job.jobType)}
                  </Badge>
                  <Badge variant="outline">{formatLocationType(job.locationType)}</Badge>
                  <Badge variant="outline">{formatExperienceLevel(job.experienceLevel)}</Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {job.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-[#fcce18] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Qualifications */}
            {job.qualifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.qualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-[#fcce18] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.company.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">{job.company.description}</p>
                )}

                <div className="space-y-3">
                  {job.company.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.company.location}
                    </div>
                  )}

                  {job.company.size && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {job.company.size} employees
                    </div>
                  )}

                  {job.company.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2" />
                      <a
                        href={job.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#fcce18] hover:underline flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Application Method */}
            <Card>
              <CardHeader>
                <CardTitle>How to Apply</CardTitle>
              </CardHeader>
              <CardContent>
                {job.applicationUrl ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">This position requires external application.</p>
                    <Button asChild className="w-full bg-[#fcce18] hover:bg-[#fcce18]/90 text-gray-900">
                      <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                        Apply Externally
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                ) : job.applicationEmail ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Send your application to:</p>
                    <Button asChild className="w-full bg-[#fcce18] hover:bg-[#fcce18]/90 text-gray-900">
                      <a href={`mailto:${job.applicationEmail}`}>Email Application</a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Apply directly through our platform.</p>
                    <Button
                      onClick={handleApply}
                      disabled={isApplying || hasApplied}
                      className="w-full bg-[#fcce18] hover:bg-[#fcce18]/90 text-gray-900"
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : hasApplied ? (
                        "Applied"
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Job */}
            <Card>
              <CardHeader>
                <CardTitle>Share this Job</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast({
                        title: "Link copied!",
                        description: "Job link copied to clipboard.",
                      })
                    }}
                  >
                    Copy Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
