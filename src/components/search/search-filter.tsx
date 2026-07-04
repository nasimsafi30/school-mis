'use client'

import { useState } from 'react'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface FilterOption {
  label: string
  value: string
  options: { label: string; value: string }[]
}

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (filters: Record<string, string>) => void
  filters: FilterOption[]
  placeholder?: string
  searchValue?: string
  activeFilters?: Record<string, string>
}

export function SearchFilter({
  onSearch,
  onFilter,
  filters,
  placeholder = 'Search...',
  searchValue = '',
  activeFilters = {},
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState(searchValue)
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(activeFilters)
  const [open, setOpen] = useState(false)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value }
    if (!value || value === 'all') {
      delete newFilters[key]
    }
    setLocalFilters(newFilters)
    onFilter(newFilters)
  }

  const clearSearch = () => {
    setSearchQuery('')
    onSearch('')
  }

  const clearAllFilters = () => {
    setLocalFilters({})
    onFilter({})
    setOpen(false)
  }

  const activeFilterCount = Object.keys(localFilters).length

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter Button & Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] flex items-center justify-center px-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {filters.map((filter) => (
              <div key={filter.value} className="space-y-2">
                <Label className="text-sm font-medium">{filter.label}</Label>
                <Select
                  value={localFilters[filter.value] || 'all'}
                  onValueChange={(value) => handleFilterChange(filter.value, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {filter.label}</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Active Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(localFilters).map(([key, value]) => {
                      const filterDef = filters.find(f => f.value === key)
                      const optionLabel = filterDef?.options.find(o => o.value === value)?.label || value
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20"
                          onClick={() => handleFilterChange(key, '')}
                        >
                          {filterDef?.label}: {optionLabel}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <SheetFooter className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            )}
            <SheetClose asChild>
              <Button className="w-full">Done</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Example usage component
export function SearchFilterExample() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const filterOptions: FilterOption[] = [
    {
      label: 'Status',
      value: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
      ],
    },
    {
      label: 'Role',
      value: 'role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Teacher', value: 'teacher' },
        { label: 'Student', value: 'student' },
      ],
    },
    {
      label: 'Department',
      value: 'department',
      options: [
        { label: 'Science', value: 'science' },
        { label: 'Mathematics', value: 'math' },
        { label: 'English', value: 'english' },
        { label: 'History', value: 'history' },
      ],
    },
  ]

  return (
    <div className="p-4 space-y-4">
      <SearchFilter
        onSearch={setSearchQuery}
        onFilter={setActiveFilters}
        filters={filterOptions}
        placeholder="Search by name, email, or ID..."
      />
      
      <div className="text-sm text-muted-foreground">
        {searchQuery && <p>Search: "{searchQuery}"</p>}
        {Object.keys(activeFilters).length > 0 && (
          <p>Active filters: {Object.keys(activeFilters).length}</p>
        )}
      </div>
    </div>
  )
}