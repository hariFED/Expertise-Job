"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  MapPin, 
  Mail, 
  FileText, 
  Plus, 
  Edit3, 
  Save, 
  X,
  ExternalLink,
  Camera,
  Award,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  location?: string
  headline?: string
  bio?: string
  skills: string[]
  resume?: string
  portfolio: string[]
  verified: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    headline: "",
    bio: "",
    skills: "",
  })
  
  const [newSkill, setNewSkill] = useState("")
  const [newPortfolio, setNewPortfolio] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    
    if (user?.role === "COMPANY") {
      router.push("/company/dashboard")
      return
    }
    
    fetchProfile()
  }, [isAuthenticated, user, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData({
          name: data.profile.name || "",
          location: data.profile.location || "",
          headline: data.profile.headline || "",
          bio: data.profile.bio || "",
          skills: data.profile.skills?.join(", ") || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map(skill => skill.trim()).filter(Boolean),
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setIsEditing(false)
        toast({
          title: "Profile updated!",
          description: "Your profile has been saved successfully.",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && profile) {
      const updatedSkills = [...profile.skills, newSkill.trim()]
      setProfile(prev => prev ? { ...prev, skills: updatedSkills } : null)
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills.join(", ")
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    if (profile) {
      const updatedSkills = profile.skills.filter(skill => skill !== skillToRemove)
      setProfile(prev => prev ? { ...prev, skills: updatedSkills } : null)
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills.join(", ")
      }))
    }
  }

  const addPortfolio = () => {
    if (newPortfolio.trim() && profile) {
      const updatedPortfolio = [...profile.portfolio, newPortfolio.trim()]
      setProfile(prev => prev ? { ...prev, portfolio: updatedPortfolio } : null)
      setNewPortfolio("")
    }
  }

  const removePortfolio = (urlToRemove: string) => {
    if (profile) {
      const updatedPortfolio = profile.portfolio.filter(url => url !== urlToRemove)
      setProfile(prev => prev ? { ...prev, portfolio: updatedPortfolio } : null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h1>
            <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
            <Button onClick={() => router.push("/")} className="bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900">
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full bg-expertisor-yellow/20 flex items-center justify-center mx-auto">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.name}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-expertisor-yellow" />
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                {profile.headline && (
                  <p className="text-gray-600 text-sm">{profile.headline}</p>
                )}
                {profile.verified && (
                  <Badge className="bg-green-100 text-green-800 mt-2">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-3 text-expertisor-yellow" />
                    {profile.email}
                  </div>
                  {profile.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-expertisor-yellow" />
                      {profile.location}
                    </div>
                  )}
                </div>


              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-expertisor-yellow" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    {isEditing ? (
                      <Input
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.location || "Not specified"}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Headline
                  </label>
                  {isEditing ? (
                    <Input
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      placeholder="e.g., Senior Frontend Developer"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.headline || "Not specified"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.bio || "No bio added yet."}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-expertisor-yellow" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a new skill"
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button 
                        onClick={addSkill}
                        size="sm"
                        className="bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill)}
                            className="h-auto p-0 ml-1 hover:bg-red-100"
                          >
                            <X className="w-3 h-3 text-red-500" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Portfolio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-expertisor-yellow" />
                  Portfolio & Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newPortfolio}
                        onChange={(e) => setNewPortfolio(e.target.value)}
                        placeholder="Add portfolio URL"
                        type="url"
                        onKeyPress={(e) => e.key === "Enter" && addPortfolio()}
                      />
                      <Button 
                        onClick={addPortfolio}
                        size="sm"
                        className="bg-expertisor-yellow hover:bg-expertisor-yellow-light text-gray-900"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {profile.portfolio.map((url, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-blue-600 hover:text-blue-800 truncate"
                          >
                            {url}
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePortfolio(url)}
                            className="h-auto p-1 hover:bg-red-100"
                          >
                            <X className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile.portfolio.length > 0 ? (
                      profile.portfolio.map((url, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No portfolio links added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume */}
            {profile.resume && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-expertisor-yellow" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={profile.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
