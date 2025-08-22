"use client"
import { Check } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import type { ProjectData, ConcernFormData } from "@/lib/types"
import projectsData from "@/lib/data/projects.json"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { ChevronsUpDown, CheckCircle, FileText, Users, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)
  const [formData, setFormData] = useState<ConcernFormData>({
    project_title: "",
    concern_description: "",
    preferred_mentor: "Srikanth",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openCombobox, setOpenCombobox] = useState(false) // State for the new combobox

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
      console.error("[v0] Submission error:", error)
      setError("Failed to submit your request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = selectedProject && formData.concern_description.trim().length > 0

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Project Concern Management</h1>
          </div>
          <Card className="shadow-xl border-0 text-center">
            <CardContent className="pt-8 pb-8 sm:pt-12 sm:pb-12 px-4 sm:px-6">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Request Submitted Successfully!</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Your project concern has been submitted and will be reviewed by our team shortly.
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
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Submit Project Concern</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Having issues with your project? Let us know and we'll help you resolve them.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <CardTitle className="text-base sm:text-lg text-gray-900">Project Information</CardTitle>
              </div>
              <CardDescription className="text-sm">Select your project to auto-populate details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              {/* === MODIFIED SECTION: Searchable Combobox === */}
              <div className="space-y-2">
                <Label htmlFor="project-title" className="text-sm font-medium text-gray-700">
                  Project Title *
                </Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between h-10 sm:h-11 font-normal text-left"
                    >
                      <span className="truncate">
                        {formData.project_title
                          ? projects.find((p) => p["Project Title"] === formData.project_title)?.["Project Title"]
                          : "Choose your project"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search project title..." />
                      <CommandEmpty>No project found.</CommandEmpty>
                      <CommandGroup className="max-h-[250px] overflow-y-auto">
                        {projects.map((project) => (
                          <CommandItem
                            key={project["S.No"]}
                            value={project["Project Title"]}
                            onSelect={(currentValue) => {
                              handleProjectSelect(currentValue === formData.project_title ? "" : project["Project Title"])
                              setOpenCombobox(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.project_title === project["Project Title"] ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <span className="block truncate">{project["Project Title"]}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedProject && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Group Number</Label>
                    <Input value={selectedProject["Group Name"]} readOnly className="bg-gray-50 text-gray-600 h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Mentor</Label>
                    <Input value={selectedProject["Mentor(s)"]} readOnly className="bg-gray-50 text-gray-600 h-10" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Team Members</Label>
                    <div className="bg-gray-50 border rounded-md p-3 min-h-[60px] sm:min-h-[80px]">
                      <div className="flex flex-wrap gap-2">
                        {selectedProject["Student Name"].split(", ").map((name, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium"
                          >
                            {name.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Block 2: Project Concern */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                <CardTitle className="text-base sm:text-lg text-gray-900">Describe Your Concern</CardTitle>
              </div>
              <CardDescription className="text-sm">What challenges are you facing with your project?</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="concern-description" className="text-sm font-medium text-gray-700">
                  Project Concern Details *
                </Label>
                <Textarea
                  id="concern-description"
                  placeholder="Describe your project challenges, technical issues, or any help you need..."
                  value={formData.concern_description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, concern_description: e.target.value }))}
                  className="min-h-[100px] sm:min-h-[120px] resize-none text-sm"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-gray-500">{formData.concern_description.length}/500 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Block 3: Mentor Preference */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <CardTitle className="text-base sm:text-lg text-gray-900">Mentor Preference</CardTitle>
              </div>
              <CardDescription className="text-sm">Who would you prefer to help with your concern?</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Preferred Mentor *</Label>
                <RadioGroup
                  value={formData.preferred_mentor}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, preferred_mentor: value as "Srikanth" | "Sanjana" }))
                  }
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6"
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
          <div className="flex flex-col items-center gap-4 px-4 sm:px-0">
            {error && (
              <div className="w-full max-w-md p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full max-w-md h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium text-sm sm:text-base"
            >
              {isSubmitting ? "Submitting..." : "Submit Concern"}
            </Button>

            <p className="text-xs text-gray-500 text-center max-w-md px-4">
              * All fields are required. Your concern will be reviewed and addressed promptly.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}