'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Platform', href: '#platform' },
  { name: 'Applications', href: '#applications' },
  { name: 'Digital Twin', href: '#digital-twin' },
  { name: 'Engagement', href: '#engagement' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-copper/20'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11">
              <Globe className="w-11 h-11 text-[#c9844a] transition-transform duration-500 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-[#c9844a]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-[0.15em] text-white">AURORA</span>
              <span className="text-[9px] tracking-[0.35em] text-[#c9844a] uppercase font-medium">OSI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="px-5 py-2.5 text-sm font-semibold tracking-wide text-white hover:text-[#c9844a] transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#c9844a] transition-all duration-300 group-hover:w-3/4" />
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button
              onClick={() => scrollToSection('#engagement')}
              className="bg-[#c9844a] hover:bg-[#d4a574] text-[#050508] font-semibold tracking-wide px-6 h-11 transition-all duration-300"
            >
              Request Briefing
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white hover:text-[#c9844a] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#0a0a0f]/98 backdrop-blur-xl border-b border-[#c9844a]/20"
          >
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-4 text-base font-semibold tracking-wide text-white hover:text-[#c9844a] hover:bg-white/5 transition-colors rounded-lg"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-4">
                <Button
                  onClick={() => scrollToSection('#engagement')}
                  className="w-full bg-[#c9844a] hover:bg-[#d4a574] text-[#050508] font-semibold tracking-wide h-12"
                >
                  Request Briefing
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
