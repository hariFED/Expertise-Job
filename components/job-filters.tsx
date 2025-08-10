"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchStore } from "@/lib/store"

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
]

const LOCATION_TYPES = [
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
]

const EXPERIENCE_LEVELS = [
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior Level" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
]

export function JobFilters() {
  const { jobType, setJobType, filters, setFilters, clearFilters } = useSearchStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocationTypeChange = (value: string, checked: boolean) => {
    const newLocationTypes = checked
      ? [...filters.locationType, value]
      : filters.locationType.filter((type) => type !== value)

    setFilters({ locationType: newLocationTypes })
  }

  const handleExperienceLevelChange = (value: string, checked: boolean) => {
    const newExperienceLevels = checked
      ? [...filters.experienceLevel, value]
      : filters.experienceLevel.filter((level) => level !== value)

    setFilters({ experienceLevel: newExperienceLevels })
  }

  const handleSalaryRangeChange = (value: number[]) => {
    setFilters({ salaryRange: [value[0], value[1]] })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (jobType) count++
    if (filters.locationType.length > 0) count += filters.locationType.length
    if (filters.experienceLevel.length > 0) count += filters.experienceLevel.length
    if (filters.salaryRange[0] > 0 || filters.salaryRange[1] < 300000) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Job Type */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Job Type</Label>
        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger>
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_TYPES">All Types</SelectItem>
            {JOB_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location Type */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Work Location</Label>
        <div className="space-y-2">
          {LOCATION_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`location-${type.value}`}
                checked={filters.locationType.includes(type.value)}
                onCheckedChange={(checked) => handleLocationTypeChange(type.value, checked as boolean)}
              />
              <Label htmlFor={`location-${type.value}`} className="text-sm">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Experience Level</Label>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={`experience-${level.value}`}
                checked={filters.experienceLevel.includes(level.value)}
                onCheckedChange={(checked) => handleExperienceLevelChange(level.value, checked as boolean)}
              />
              <Label htmlFor={`experience-${level.value}`} className="text-sm">
                {level.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Salary Range: ${filters.salaryRange[0].toLocaleString()} - ${filters.salaryRange[1].toLocaleString()}
        </Label>
        <Slider
          value={filters.salaryRange}
          onValueChange={handleSalaryRangeChange}
          max={300000}
          min={0}
          step={5000}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>$0</span>
          <span>$300k+</span>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-[#fcce18]/10 text-[#fcce18]">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        <FilterContent />
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-[#fcce18] text-gray-900 text-xs px-1.5 py-0.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Job Filters</SheetTitle>
              <SheetDescription>Refine your job search with these filters</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {jobType && (
            <Badge variant="secondary" className="bg-[#fcce18]/10 text-[#fcce18]">
              {JOB_TYPES.find((t) => t.value === jobType)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => setJobType("")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.locationType.map((type) => (
            <Badge key={type} variant="secondary" className="bg-[#fcce18]/10 text-[#fcce18]">
              {LOCATION_TYPES.find((t) => t.value === type)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => handleLocationTypeChange(type, false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
          {filters.experienceLevel.map((level) => (
            <Badge key={level} variant="secondary" className="bg-[#fcce18]/10 text-[#fcce18]">
              {EXPERIENCE_LEVELS.find((l) => l.value === level)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => handleExperienceLevelChange(level, false)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </>
  )
}
