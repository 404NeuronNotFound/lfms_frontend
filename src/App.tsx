"use client"

import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShieldCheck, BellRing, Users } from "lucide-react"
import { motion } from "framer-motion"

function App() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0f172a] via-[#0b1120] to-black text-gray-100 overflow-hidden scroll-smooth">

      {/* Animated Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] bg-purple-600/30 blur-[120px] rounded-full top-10 left-10 animate-pulse" />
        <div className="absolute w-[500px] h-[500px] bg-blue-600/30 blur-[120px] rounded-full bottom-10 right-10 animate-pulse" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* HERO SECTION */}
      <section className="container mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Find What’s Lost.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Return What’s Found.
            </span>
          </h1>

          <p className="mt-6 text-gray-400 max-w-lg">
            A smart and secure Lost & Found Management System designed
            to reconnect people with their valuable belongings faster
            and easier.
          </p>

          <div className="flex gap-4 mt-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
              Report Lost Item
            </Button>
            <Button size="lg" variant="outline">
              Browse Found Items
            </Button>
          </div>

          <div className="flex gap-10 mt-12 text-sm text-gray-400">
            <div>
              <p className="text-2xl font-bold text-white">2K+</p>
              Items Recovered
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1.5K+</p>
              Active Users
            </div>
            <div>
              <p className="text-2xl font-bold text-white">98%</p>
              Success Rate
            </div>
          </div>
        </motion.div>

        {/* Floating Card */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          <Card className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/10 before:pointer-events-none">
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center gap-3">
                <Search className="text-blue-400" />
                <h3 className="text-lg font-semibold">
                  Smart Search Engine
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered search to quickly match lost and found reports.
              </p>
              <div className="h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-gray-300">
                System Preview
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Why Choose Our System?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[{
            icon: <ShieldCheck className="text-green-400" />,
            title: "Secure & Verified",
            desc: "User verification ensures safe item claiming process."
          },
          {
            icon: <BellRing className="text-yellow-400" />,
            title: "Instant Notifications",
            desc: "Get notified when matching items are found instantly."
          },
          {
            icon: <Users className="text-purple-400" />,
            title: "Community Driven",
            desc: "Built for campuses, offices, and communities."
          }].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="bg-white/5 border border-white/10 rounded-2xl">
                <CardContent className="p-8 space-y-4">
                  {item.icon}
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          What Our Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {["I recovered my lost wallet within 24 hours!",
            "The notification system works perfectly.",
            "This system saved our university hundreds of lost items."
          ].map((text, i) => (
            <Card key={i} className="bg-white/5 border border-white/10 rounded-2xl">
              <CardContent className="p-6 text-gray-300">
                “{text}”
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-14 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Reconnect Lost Items?
          </h2>
          <Button size="lg" className="bg-white text-black hover:bg-gray-200">
            Join the Community
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto grid md:grid-cols-4 gap-8 text-gray-400 text-sm">
          <div>
            <h3 className="text-white font-semibold mb-4">
              Lost & Found
            </h3>
            <p>
              A secure SaaS platform designed to reconnect communities with their lost belongings.
            </p>
          </div>
          <div>
            <h4 className="text-white mb-3">Product</h4>
            <p>Features</p>
            <p>Security</p>
            <p>Pricing</p>
          </div>
          <div>
            <h4 className="text-white mb-3">Company</h4>
            <p>About</p>
            <p>Careers</p>
            <p>Contact</p>
          </div>
          <div>
            <h4 className="text-white mb-3">Resources</h4>
            <p>Documentation</p>
            <p>Support</p>
            <p>Privacy Policy</p>
          </div>
        </div>

        <div className="text-center text-gray-500 mt-10 text-xs">
          © 2025 Lost & Found Management System. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default App