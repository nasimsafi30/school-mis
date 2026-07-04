"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  numericName: z.number().optional(),
  description: z.string().optional(),
  capacity: z.number().min(1).optional(),
  sections: z.array(z.object({
    name: z.string().min(1),
    capacity: z.number().min(1).optional(),
    roomNo: z.string().optional(),
  })).optional(),
})

type ClassFormData = z.infer<typeof classSchema>

interface ClassFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function ClassForm({ initialData, onSuccess }: ClassFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: initialData || { name: "", numericName: undefined, description: "", capacity: 30, sections: [{ name: "A", capacity: 30, roomNo: "" }] },
  })

  const sections = watch("sections") || []

  const addSection = () => {
    const current = watch("sections") || []
    setValue("sections", [...current, { name: "", capacity: 30, roomNo: "" }])
  }

  const removeSection = (index: number) => {
    const current = watch("sections") || []
    setValue("sections", current.filter((_: any, i: number) => i !== index))
  }

  const onSubmit = async (data: ClassFormData) => {
    try {
      const url = isEditing ? "/api/classes/" + initialData.id : "/api/classes"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(isEditing ? "Class updated" : "Class created")
        onSuccess?.()
        router.refresh()
      } else {
        toast.error("Failed to save class")
      }
    } catch (error) {
      toast.error("Failed to save class")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{isEditing ? "Edit Class" : "Add New Class"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Class Name *</Label><Input {...register("name")} placeholder="e.g., Grade 5" />{errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}</div>
            <div><Label>Numeric Name</Label><Input type="number" {...register("numericName", { valueAsNumber: true })} placeholder="e.g., 5" /></div>
            <div><Label>Capacity</Label><Input type="number" {...register("capacity", { valueAsNumber: true })} /></div>
          </div>
          <div><Label>Description</Label><Textarea {...register("description")} rows={3} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sections</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addSection}><Plus className="mr-2 h-4 w-4" />Add Section</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section: any, index: number) => (
            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1"><Label>Section Name *</Label><Input {...register(`sections.${index}.name`)} placeholder="e.g., A" /></div>
              <div className="flex-1"><Label>Capacity</Label><Input type="number" {...register(`sections.${index}.capacity`, { valueAsNumber: true })} /></div>
              <div className="flex-1"><Label>Room No</Label><Input {...register(`sections.${index}.roomNo`)} placeholder="e.g., 101" /></div>
              {sections.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeSection(index)} className="text-red-500"><Trash2 className="h-4 w-4" /></Button>}
            </div>
          ))}
          {sections.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No sections added</p>}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : isEditing ? "Update Class" : "Create Class"}</Button>
      </div>
    </form>
  )
}
