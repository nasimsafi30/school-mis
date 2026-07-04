'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, User, GraduationCap, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchResult {
  students: Array<{ id: string; firstName: string; lastName: string; admissionNo: string }>
  teachers: Array<{ id: string; firstName: string; lastName: string; employeeId: string }>
  books: Array<{ id: string; title: string; author: string; isbn: string }>
}

export function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ students: [], teachers: [], books: [] })
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ students: [], teachers: [], books: [] })
      return
    }

    const searchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }

    searchData()
  }, [debouncedQuery])

  const handleSelect = (type: string, id: string) => {
    setOpen(false)
    switch (type) {
      case 'student':
        router.push('/students/' + id)
        break
      case 'teacher':
        router.push('/teachers/' + id)
        break
      case 'book':
        router.push('/library')
        break
    }
  }

  const totalResults = results.students.length + results.teachers.length + results.books.length

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex text-muted-foreground">Search anything...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search students, teachers, books..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          <CommandEmpty>
            {query.length < 2
              ? 'Type at least 2 characters to search...'
              : totalResults === 0 && !loading
              ? 'No results found.'
              : ''}
          </CommandEmpty>

          {results.students.length > 0 && (
            <CommandGroup heading="Students">
              {results.students.map((student) => (
                <CommandItem
                  key={student.id}
                  onSelect={() => handleSelect('student', student.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.teachers.length > 0 && (
            <CommandGroup heading="Teachers">
              {results.teachers.map((teacher) => (
                <CommandItem
                  key={teacher.id}
                  onSelect={() => handleSelect('teacher', teacher.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                    <p className="text-xs text-muted-foreground">{teacher.employeeId}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.books.length > 0 && (
            <CommandGroup heading="Books">
              {results.books.map((book) => (
                <CommandItem
                  key={book.id}
                  onSelect={() => handleSelect('book', book.id)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="font-medium">{book.title}</p>
                    <p className="text-xs text-muted-foreground">by {book.author}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}