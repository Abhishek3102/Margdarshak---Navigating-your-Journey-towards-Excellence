"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface CourseFilterProps {
  onFilterChange: (filters: FilterOptions) => void
  initialFilters?: FilterOptions
}

export interface FilterOptions {
  search?: string
  category?: string
  level?: string
  sort?: string
}

export function CourseFilter({ onFilterChange, initialFilters = {} }: CourseFilterProps) {
  const [search, setSearch] = useState(initialFilters.search || "")
  const [category, setCategory] = useState(initialFilters.category || "all")
  const [level, setLevel] = useState(initialFilters.level || "all")
  const [sort, setSort] = useState(initialFilters.sort || "newest")

  // Apply filters when any filter changes
  useEffect(() => {
    // Only trigger filter changes when values actually change
    const newFilters: FilterOptions = {}

    if (search) newFilters.search = search
    if (category !== "all") newFilters.category = category
    if (level !== "all") newFilters.level = level
    if (sort !== "newest") newFilters.sort = sort

    // Use a ref to prevent unnecessary updates
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(initialFilters)

    if (filtersChanged) {
      onFilterChange(newFilters)
    }
    // We only want this to run when the filter values change, not when onFilterChange changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, level, sort, JSON.stringify(initialFilters)])

  const resetFilters = () => {
    setSearch("")
    setCategory("all")
    setLevel("all")
    setSort("newest")
  }

  return (
    <div className="glass-effect rounded-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
          <Input
            placeholder="Search courses..."
            className="pl-10 bg-slate-800/50 border-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Data Science">Data Science</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
            </SelectContent>
          </Select>

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] bg-slate-800/50 border-slate-700">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="border-slate-700 hover:bg-slate-800" onClick={resetFilters}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
