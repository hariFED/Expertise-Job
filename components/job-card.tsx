"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Clock, DollarSign, Building2, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface JobCardProps {
  job: {
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
  isSaved?: boolean
  onApply?: () => void
  compact?: boolean
}

export function JobCard({ job, isSaved = false, onApply, compact = false }: JobCardProps) {
  const { isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  const [isBookmarked, setIsBookmarked] = useState(isSaved)
  const [isLoading, setIsLoading] = useState(false)

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

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save jobs.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/jobs/${job.id}/save`, {
        method: isBookmarked ? "DELETE" : "POST",
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
        toast({
          title: isBookmarked ? "Job removed" : "Job saved",
          description: isBookmarked ? "Job removed from your saved list." : "Job saved to your list.",

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

    onApply?.()
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

  if (compact) {
    return (
      <Link href={`/jobs/${job.id}`}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {job.company.logo && (
                    <img
                      src={job.company.logo || "/placeholder.svg"}
                      alt={job.company.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {timeAgo(job.createdAt)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{formatJobType(job.jobType)}</Badge>
                  <Badge variant="outline">{formatLocationType(job.locationType)}</Badge>
                </div>
              </div>

              <Button variant="ghost" size="icon" onClick={handleBookmark} disabled={isLoading} className="ml-2">
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-[#fcce18]" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {job.company.logo ? (
                <img
                  src={job.company.logo || "/placeholder.svg"}
                  alt={job.company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 hover:text-[#fcce18] transition-colors">
                  {job.title}
                </h3>
                <p className="text-gray-600 font-medium">{job.company.name}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              disabled={isLoading}
              className="hover:bg-[#fcce18]/10"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-[#fcce18]" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400 hover:text-[#fcce18]" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
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
              {timeAgo(job.createdAt)}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-[#fcce18]/10 text-[#fcce18] hover:bg-[#fcce18]/20">
                {formatJobType(job.jobType)}
              </Badge>
              <Badge variant="outline">{formatLocationType(job.locationType)}</Badge>
            </div>
          </div>

          {job.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 4} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <Button onClick={handleApply} className="w-full bg-[#fcce18] hover:bg-[#fcce18]/90 text-gray-900 font-medium">
            Apply Now
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
