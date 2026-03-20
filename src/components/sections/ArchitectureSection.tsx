'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Atom, Orbit, Box } from 'lucide-react'

const pillars = [
  {
    icon: Atom,
    title: 'Physics-Causal Intelligence',
    description: 'Aurora enforces geological cause-effect consistency across surface expressions, structural geometry, subsurface properties, and gravimetric responses.',
  },
  {
    icon: Orbit,
    title: 'Multi-Orbit Multi-Physics Fusion',
    description: 'Optical, hyperspectral, SAR, thermal, magnetic, and gravimetric data are harmonized into a unified spatio-temporal representation.',
  },
  {
    icon: Box,
    title: 'Sovereign-Grade Digital Twin',
    description: 'A dynamic 4D voxel-based subsurface model that can be queried, simulated, and continuously updated.',
  },
]

export function ArchitectureSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-28 md:py-36 relative bg-[#0a0a10]/60">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#c9844a] text-sm tracking-[0.3em] uppercase mb-5 font-medium">
            Core Architecture
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white">
            Three Pillars of <span className="aurora-gradient">Intelligence</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="group"
            >
              <div className="h-full p-8 aurora-border bg-[#0a0a10]/80 backdrop-blur-sm hover:bg-[#0f0f18] transition-all duration-500 rounded-lg relative overflow-hidden card-hover">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#c9844a]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="w-14 h-14 rounded-lg bg-[#c9844a]/15 flex items-center justify-center group-hover:bg-[#c9844a]/25 transition-colors duration-300">
                      <pillar.icon className="w-7 h-7 text-[#c9844a]" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-5 text-white tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-[#a0a0b0] font-light leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
