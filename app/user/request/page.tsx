"use client"

import type React from "react"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/client"
import type { ProjectData, ConcernFormData } from "@/lib/types"
import projectsData from "@/lib/data/projects.json"
import { CheckCircle, FileText, Users, UserCheck } from "lucide-react"

export default function UserRequestPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [formData, setFormData] = useState<ConcernFormData>({
    project_title: "",
    concern_description: "",
    preferred_mentor: "Srikanth",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const projects = projectsData as ProjectData[]

  const handleProjectSelect = (projectTitle: string) => {
    const project = projects.find((p) => p["Project Title"] === projectTitle)
    setSelectedProject(project || null)
    setFormData((prev) => ({ ...prev, project_title: projectTitle }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !formData.concern_description.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: submitError } = await supabase.from("project_concerns").insert({
        group_number: selectedProject["Group Name"],
        project_title: selectedProject["Project Title"],
        student_names: selectedProject["Student Name"],
        mentor_name: selectedProject["Mentor(s)"],
        concern_description: formData.concern_description.trim(),
        preferred_mentor: formData.preferred_mentor,
      })

      if (submitError) throw submitError

      setIsSubmitted(true)
    } catch (error) {
      console.error("Submission error:", error)
      setError("Failed to submit your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = selectedProject && formData.concern_description.trim().length > 0

  if (isSubmitted) {
    return (
      <AuthGuard requiredRole="user">
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Project Concern Management</h1>
              <LogoutButton />
            </div>

            <Card className="shadow-xl border-0 text-center">
              <CardContent className="pt-12 pb-12">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h2>
                <p className="text-gray-600 mb-6">
                  Your project concern has been submitted and will be reviewed by the admin team.
                </p>
                <Button
                  onClick={() => {
                    setIsSubmitted(false)
                    setSelectedProject(null)
                    setFormData({
                      project_title: "",
                      concern_description: "",
                      preferred_mentor: "Srikanth",
                    })
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="user">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Project Concern Request Form</h1>
            <LogoutButton />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Block 1: Group Details */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg text-gray-900">Group Details</CardTitle>
                </div>
                <CardDescription>Select your project to auto-populate group information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-title" className="text-sm font-medium text-gray-700">
                    Project Title *
                  </Label>
                  <Select onValueChange={handleProjectSelect} value={formData.project_title}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Search and select your project title" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project["S.No"]} value={project["Project Title"]}>
                          {project["Project Title"]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProject && (
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Group Number</Label>
                      <Input value={selectedProject["Group Name"]} readOnly className="bg-gray-50 text-gray-600" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">PS Batch / Mentor Name</Label>
                      <Input value={selectedProject["Mentor(s)"]} readOnly className="bg-gray-50 text-gray-600" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Student Names</Label>
                      <Textarea
                        value={selectedProject["Student Name"]}
                        readOnly
                        className="bg-gray-50 text-gray-600 min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Block 2: Project Concern */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg text-gray-900">Project Concern</CardTitle>
                </div>
                <CardDescription>Describe your project concern in detail</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="concern-description" className="text-sm font-medium text-gray-700">
                    Short Description about the Concern in the Project *
                  </Label>
                  <Textarea
                    id="concern-description"
                    placeholder="Please describe your project concern, challenges, or issues you're facing..."
                    value={formData.concern_description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, concern_description: e.target.value }))}
                    className="min-h-[120px] resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500">{formData.concern_description.length}/500 characters</p>
                </div>
              </CardContent>
            </Card>

            {/* Block 3: Mentor Preference */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg text-gray-900">Mentor Preference</CardTitle>
                </div>
                <CardDescription>Choose your preferred mentor for guidance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Preferred Mentor *</Label>
                  <RadioGroup
                    value={formData.preferred_mentor}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, preferred_mentor: value as "Srikanth" | "Sanjana" }))
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Srikanth" id="srikanth" />
                      <Label htmlFor="srikanth" className="text-sm font-medium cursor-pointer">
                        Srikanth
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sanjana" id="sanjana" />
                      <Label htmlFor="sanjana" className="text-sm font-medium cursor-pointer">
                        Sanjana
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-4">
              {error && (
                <div className="w-full max-w-md p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full max-w-md h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium"
              >
                {isSubmitting ? "Submitting Request..." : "Submit Request"}
              </Button>

              <p className="text-xs text-gray-500 text-center max-w-md">
                * Required fields. Your request will be reviewed by the admin team and appropriate action will be taken.
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
