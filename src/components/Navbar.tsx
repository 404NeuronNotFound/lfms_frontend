"use client"

import { useState } from "react"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Search className="h-6 w-6" />
          <span className="text-lg font-semibold hidden sm:block">
            Lost & Found Management System
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-sm font-medium hover:text-primary">
            Home
          </a>
          <a href="/about" className="text-sm font-medium hover:text-primary">
            About
          </a>
          <Button variant="outline">Login</Button>
          <Button>Register</Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-4">
          <a href="/" className="block text-sm font-medium">
            Home
          </a>
          <a href="/about" className="block text-sm font-medium">
            About
          </a>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full">
              Login
            </Button>
            <Button className="w-full">
              Register
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}