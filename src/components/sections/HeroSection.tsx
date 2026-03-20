'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronDown } from 'lucide-react'

export function HeroSection() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with grid pattern */}
      <div className="absolute inset-0 bg-[#050508]">
        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-60" />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/60 to-[#050508]" />
        
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,132,74,0.12)_0%,_transparent_70%)]" />
      </div>

      {/* Animated orbital rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px]">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-[#c9844a]/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute inset-8 rounded-full border border-[#c9844a]/20"
            animate={{ rotate: -360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute inset-16 rounded-full border border-[#c9844a]/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Orbital dots */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#c9844a]/50"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateX(${180 + i * 20}px) translateY(-50%)`,
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Tagline */}
          <p className="text-[#c9844a] text-sm tracking-[0.35em] uppercase mb-8 font-medium">
            Orbital Subsurface Intelligence
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-tight mb-8 text-white"
        >
          <span className="block">Planetary-Scale</span>
          <span className="block aurora-gradient mt-2">Orbital Subsurface</span>
          <span className="block mt-2">Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-[#a0a0b0] font-light max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          Aurora OSI is a physics-causal, multi-orbit intelligence architecture enabling 
          sovereign-grade subsurface resource assessment without ground-based intervention.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <Button
            size="lg"
            onClick={() => scrollToSection('#engagement')}
            className="bg-[#c9844a] hover:bg-[#d4a574] text-[#050508] font-semibold tracking-wide px-8 h-14 text-base animate-subtle-pulse"
          >
            Request Strategic Briefing
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSection('#platform')}
            className="border-[#c9844a]/40 text-[#c9844a] hover:bg-[#c9844a]/10 hover:border-[#c9844a]/60 font-semibold tracking-wide px-8 h-14 text-base"
          >
            Explore the Platform
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center text-[#a0a0b0] cursor-pointer"
          onClick={() => scrollToSection('#about')}
        >
          <span className="text-xs tracking-[0.2em] mb-2 font-medium uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  )
}
