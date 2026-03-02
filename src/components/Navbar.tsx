"use client"

import { useState } from "react"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full border-b bg-white/95 backdrop-blur sticky top-0 z-50"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Search className="h-6 w-6 text-black" />
          <span className="text-lg font-semibold text-black hidden sm:block">
            Lost & Found Management System
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">

          {["Home", "About"].map((item) => (
            <motion.a
              key={item}
              href="#"
              className="relative text-sm font-medium text-black"
              whileHover={{ y: -2 }}
            >
              {item}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}

          <Button
            variant="outline"
            className="text-black border-black hover:bg-black hover:text-white transition"
          >
            Login
          </Button>

          <Button className="bg-black text-white hover:bg-gray-800">
            Register
          </Button>
        </div>

        {/* Mobile Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </motion.button>
      </div>

      {/* Mobile Menu Animated */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:hidden border-t bg-white overflow-hidden"
          >
            <div className="px-4 py-6 space-y-5">

              {["Home", "About"].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="block text-black text-sm font-medium"
                >
                  {item}
                </motion.a>
              ))}

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full text-black border-black"
                >
                  Login
                </Button>

                <Button className="w-full bg-black text-white">
                  Register
                </Button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}