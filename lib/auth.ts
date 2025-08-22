"use client"

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("isAuthenticated") === "true"
}

export const getUserRole = (): "admin" | "user" | null => {
  if (typeof window === "undefined") return null
  const role = localStorage.getItem("userRole")
  return role as "admin" | "user" | null
}

export const logout = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("userRole")
  window.location.href = "/login"
}

export const requireAuth = (requiredRole?: "admin" | "user"): boolean => {
  if (!isAuthenticated()) {
    window.location.href = "/login"
    return false
  }

  if (requiredRole && getUserRole() !== requiredRole) {
    // Redirect to appropriate page based on role
    const userRole = getUserRole()
    if (userRole === "admin") {
      window.location.href = "/admin/dashboard"
    } else {
      window.location.href = "/user/request"
    }
    return false
  }

  return true
}
