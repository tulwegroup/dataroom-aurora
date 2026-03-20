'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Layers, Brain, Gauge } from 'lucide-react'

const dataTypes = [
  'Optical & Hyperspectral',
  'SAR & InSAR',
  'Thermal Infrared',
  'Multi-Orbit Gravimetry',
  'Magnetic & Bathymetric Data',
  'Oceanographic Parameters',
]

const intelligenceComponents = [
  'Physics-informed neural architectures',
  'Causal consistency enforcement',
  'Multi-resolution gravimetric inversion',
  'Hybrid classical-quantum optimization frameworks',
  'Generative geological scenario modeling',
]

const tiers = [
  {
    name: 'Bootstrap Tier',
    description: 'Global-scale reconnaissance identifying regions of interest.',
    level: 1,
  },
  {
    name: 'Smart Tier',
    description: 'Regional multi-physics modeling generating ranked targets.',
    level: 2,
  },
  {
    name: 'Premium Tier',
    description: 'High-resolution derisking with adaptive satellite tasking and advanced inversion.',
    level: 3,
  },
]

export function PlatformSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="platform" className="py-28 md:py-36 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10]/50 via-[#050508] to-[#0a0a10]/50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-[#c9844a] text-sm tracking-[0.3em] uppercase mb-5 font-medium">
            Platform
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-8 text-white">
            The Aurora OSI <span className="aurora-gradient">Platform</span>
          </h2>
          <p className="text-[#a0a0b0] font-light max-w-3xl mx-auto leading-relaxed text-lg">
            Aurora OSI is a planetary-scale intelligence architecture integrating satellite physics, 
            geodynamic priors, and causal machine reasoning into a unified subsurface modeling system.
          </p>
        </motion.div>

        {/* Data Foundation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-[#c9844a]/15 flex items-center justify-center">
              <Layers className="w-6 h-6 text-[#c9844a]" />
            </div>
            <h3 className="text-2xl font-medium text-white">Data Foundation</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
                className="flex items-center gap-4 px-5 py-4 aurora-border bg-[#0a0a10]/60 rounded-lg hover:bg-[#0f0f18] transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#c9844a]" />
                <span className="text-base font-light text-[#d0d0d8]">{type}</span>
              </motion.div>
            ))}
          </div>
          <p className="text-base text-[#a0a0b0] font-light mt-6 italic">
            All data streams are harmonized into a sensor-agnostic representation.
          </p>
        </motion.div>

        {/* Intelligence Engine */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-[#c9844a]/15 flex items-center justify-center">
              <Brain className="w-6 h-6 text-[#c9844a]" />
            </div>
            <h3 className="text-2xl font-medium text-white">Intelligence Engine</h3>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {intelligenceComponents.map((component, index) => (
                <motion.div
                  key={component}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 px-5 py-4 aurora-border bg-[#0a0a10]/60 rounded-lg hover:bg-[#0f0f18] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#c9844a] mt-2" />
                  <span className="text-base font-light text-[#d0d0d8]">{component}</span>
                </motion.div>
              ))}
            </div>
            <div className="aurora-border bg-[#0a0a10]/60 rounded-lg p-8 flex items-center justify-center">
              <p className="text-base text-[#a0a0b0] font-light text-center italic leading-relaxed">
                Outputs are probabilistic 3D anomaly cubes with associated uncertainty quantification.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Three-Tier Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-lg bg-[#c9844a]/15 flex items-center justify-center">
              <Gauge className="w-6 h-6 text-[#c9844a]" />
            </div>
            <h3 className="text-2xl font-medium text-white">Three-Tier Planetary Scan Funnel</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                className="relative group"
              >
                <div className="h-full p-7 aurora-border bg-[#0a0a10]/60 rounded-lg hover:bg-[#0f0f18] transition-all duration-300 card-hover">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-[#c9844a]/20 flex items-center justify-center">
                      <span className="text-base font-semibold text-[#c9844a]">{tier.level}</span>
                    </div>
                    <h4 className="text-lg font-medium text-white">{tier.name}</h4>
                  </div>
                  <p className="text-[#a0a0b0] font-light leading-relaxed">
                    {tier.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
