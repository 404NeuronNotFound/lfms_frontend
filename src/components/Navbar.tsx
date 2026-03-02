"use client"

import { useState } from "react"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 pt-4"
    >
      <div className="max-w-7xl mx-auto">

        {/* Glass Container */}
        <div className="relative flex items-center justify-between h-16 px-6 rounded-2xl 
          bg-white/10 backdrop-blur-2xl 
          border border-white/20 
          shadow-[0_8px_32px_rgba(0,0,0,0.37)]">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-md">
              <Search className="h-5 w-5 text-white" />
            </div>

            <span className="text-sm md:text-base font-semibold text-white tracking-wide">
              Lost & Found Management System
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">

            {["Home", "About"].map((item) => (
              <motion.a
                key={item}
                href="#"
                whileHover={{ y: -2 }}
                className="relative text-sm font-medium text-gray-200 hover:text-white transition"
              >
                {item}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 hover:w-full"></span>
              </motion.a>
            ))}

            <Button
                size="lg"
                className="bg-white text-black border border-white/30 hover:bg-gray-500 hover:text-black transition font-semibold cursor-pointer"
                >
                Login
            </Button>

            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 transition shadow-lg cursor-pointer font-semibold">
              Register
            </Button>
          </div>

          {/* Mobile Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </motion.button>
        </div>

        {/* Mobile Glass Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.37)] overflow-hidden"
            >
              <div className="px-6 py-6 space-y-5">

                {["Home", "About"].map((item) => (
                  <motion.a
                    key={item}
                    href="#"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="block text-gray-200 hover:text-white text-sm font-medium"
                  >
                    {item}
                  </motion.a>
                ))}

                <div className="flex flex-col gap-3 pt-4">
                    <Button
                        size="lg"
                        className="w-full border-white/30 text-white hover:bg-white hover:text-black transition font-semibold">
                        Login
                    </Button>

                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:opacity-90 transition font-semibold shadow-lg">
                    Register
                  </Button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.nav>
  )
}