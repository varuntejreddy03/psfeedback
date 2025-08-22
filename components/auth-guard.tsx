"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getUserRole } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push("/login")
        return
      }

      const userRole = getUserRole()

      if (requiredRole && userRole !== requiredRole) {
        // Redirect to appropriate page based on role
        if (userRole === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/request")
        }
        return
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
