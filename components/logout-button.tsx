"use client"

import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function LogoutButton({ variant = "outline", size = "sm" }: LogoutButtonProps) {
  const handleLogout = () => {
    logout()
  }

  return (
    <Button onClick={handleLogout} variant={variant} size={size} className="flex items-center gap-2">
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}
