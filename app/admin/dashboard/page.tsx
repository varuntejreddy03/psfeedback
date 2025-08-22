"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/client"
import type { ProjectConcern } from "@/lib/types"
import { Search, Download, RefreshCw, FileText, Calendar, Users, Wifi, WifiOff } from "lucide-react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [concerns, setConcerns] = useState<ProjectConcern[]>([])
  const [filteredConcerns, setFilteredConcerns] = useState<ProjectConcern[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [newSubmissionCount, setNewSubmissionCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminSessionId = localStorage.getItem("adminSessionId")
        const isAdmin = localStorage.getItem("isAdmin")

        if (!adminSessionId || isAdmin !== "true") {
          window.location.href = "/login"
          return
        }

        const { data: session, error: sessionError } = await supabase
          .from("admin_sessions")
          .select("*, admin_users(*)")
          .eq("session_id", adminSessionId)
          .gt("expires_at", new Date().toISOString())
          .single()

        if (sessionError || !session) {
          localStorage.removeItem("adminSessionId")
          localStorage.removeItem("isAdmin")
          localStorage.removeItem("adminId")
          window.location.href = "/login"
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        const isAdmin = localStorage.getItem("isAdmin")
        if (isAdmin === "true") {
          setIsAuthenticated(true)
        } else {
          window.location.href = "/login"
        }
      }
    }
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const fetchConcerns = async () => {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("project_concerns")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setConcerns(data || [])
      setFilteredConcerns(data || [])
      setNewSubmissionCount(0)
    } catch (error) {
      console.error("[v0] Error fetching concerns:", error)
      setError("Failed to load project concerns. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return

    fetchConcerns()

    const channel = supabase
      .channel("project_concerns_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_concerns" },
        (payload) => {
          const newConcern = payload.new as ProjectConcern
          setConcerns((prevConcerns) => [newConcern, ...prevConcerns])
          setFilteredConcerns((prevFiltered) => [newConcern, ...prevFiltered])
          setNewSubmissionCount((prev) => prev + 1)
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConcerns(concerns)
      return
    }
    const filtered = concerns.filter(
      (concern) =>
        concern.group_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concern.project_title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredConcerns(filtered)
  }, [searchQuery, concerns])

  const handleRefresh = () => {
    setIsLoading(true)
    fetchConcerns()
  }

  const handleExportCSV = () => {
    const headers = [
      "Group Number",
      "Project Title",
      "Student Names",
      "Mentor Name",
      "Concern Description",
      "Preferred Mentor",
      "Submission Date",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredConcerns.map((concern) =>
        [
          `"${concern.group_number}"`,
          `"${concern.project_title}"`,
          `"${concern.student_names}"`,
          `"${concern.mentor_name}"`,
          `"${concern.concern_description.replace(/"/g, '""')}"`,
          `"${concern.preferred_mentor}"`,
          `"${new Date(concern.created_at).toLocaleString()}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `project_concerns_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {!isAuthenticated ? "Checking authentication..." : "Loading project concerns..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <Wifi className="h-3 w-3" /> Live
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      <WifiOff className="h-3 w-3" /> Offline
                    </div>
                  )}
                  {newSubmissionCount > 0 && (
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {newSubmissionCount} new
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor and manage project concerns</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Concerns</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{concerns.length}</p>
                </div>
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Showing Results</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{filteredConcerns.length}</p>
                </div>
                <Search className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Submissions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {
                      concerns.filter((c) => new Date(c.created_at).toDateString() === new Date().toDateString())
                        .length
                    }
                  </p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="shadow-lg border-0 mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Search & Export</CardTitle>
            <CardDescription className="text-sm">Filter and export concern data</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by group or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 sm:h-11 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRefresh} variant="outline" className="h-10 sm:h-11 bg-transparent flex-1 sm:flex-none">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                  <span className="sm:hidden">Sync</span>
                </Button>
                <Button onClick={handleExportCSV} className="h-10 sm:h-11 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="shadow-lg border-0 mb-6 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Project Concerns</CardTitle>
            <CardDescription className="text-sm">
              {filteredConcerns.length === 0
                ? "No concerns found"
                : `Showing ${filteredConcerns.length} of ${concerns.length} concerns`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredConcerns.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-base sm:text-lg">No concerns found</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery ? "Try different search terms" : "New submissions will appear here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm">Group</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm">Project</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm">Team</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm">Concern</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm">Mentor</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-gray-700 text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConcerns.map((concern, index) => (
                      <tr key={concern.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-3 sm:p-4 align-top">
                          <Badge variant="outline" className="font-mono text-xs">
                            {concern.group_number}
                          </Badge>
                        </td>
                        <td className="p-3 sm:p-4 align-top">
                          <div className="max-w-[200px]">
                            <p className="font-medium text-gray-900 truncate text-sm" title={concern.project_title}>
                              {concern.project_title}
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={concern.mentor_name}>
                              {concern.mentor_name}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 align-top">
                          <div className="max-w-[150px]">
                            <div className="text-xs text-gray-700 space-y-1">
                              {concern.student_names
                                .split(", ")
                                .map((name, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-blue-50 text-blue-800 px-2 py-1 rounded-md text-xs font-medium border border-blue-200"
                                    title={name.trim()}
                                  >
                                    {name.trim()}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 align-top">
                          <div className="max-w-[200px]">
                            <p className="text-xs text-gray-700 break-words" title={concern.concern_description}>
                              {concern.concern_description}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 align-top">
                          <Badge
                            variant={concern.preferred_mentor === "Srikanth" ? "default" : "secondary"}
                            className="whitespace-nowrap text-xs"
                          >
                            {concern.preferred_mentor}
                          </Badge>
                        </td>
                        <td className="p-3 sm:p-4 align-top">
                          <p className="text-xs text-gray-600 whitespace-nowrap">{formatDate(concern.created_at)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}