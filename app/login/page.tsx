"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      console.log("[v0] Attempting login with credentials:", { loginId, password })

      // Check admin credentials against Supabase
      const { data: adminUsers, error: fetchError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", loginId)
        .eq("password_hash", password)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.log("[v0] Supabase fetch error:", fetchError)
        throw fetchError
      }

      if (adminUsers) {
        // Admin login successful
        console.log("[v0] Admin login successful:", adminUsers)

        // Store admin session in Supabase (create a session record)
        const sessionId = crypto.randomUUID()
        const { error: sessionError } = await supabase.from("admin_sessions").insert({
          session_id: sessionId,
          admin_id: adminUsers.id,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })

        if (sessionError) {
          console.log("[v0] Session creation error:", sessionError)
          // Fallback to localStorage if session table doesn't exist yet
          localStorage.setItem("adminSessionId", sessionId)
          localStorage.setItem("isAdmin", "true")
          localStorage.setItem("adminId", adminUsers.id)
        } else {
          localStorage.setItem("adminSessionId", sessionId)
          localStorage.setItem("isAdmin", "true")
          localStorage.setItem("adminId", adminUsers.id)
        }

        console.log("[v0] Admin session created, redirecting to dashboard")
        setTimeout(() => {
          router.replace("/admin/dashboard")
        }, 100)
      } else {
        // Any other credentials redirect to user form
        console.log("[v0] Non-admin credentials, redirecting to user form")
        localStorage.removeItem("adminSessionId")
        localStorage.removeItem("isAdmin")
        localStorage.removeItem("adminId")
        router.push("/")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">Admin Login</CardTitle>
            <CardDescription className="text-gray-600">
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginId" className="text-sm font-medium text-gray-700">
                  Login ID
                </Label>
                <Input
                  id="loginId"
                  type="text"
                  placeholder="Enter your login ID"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
