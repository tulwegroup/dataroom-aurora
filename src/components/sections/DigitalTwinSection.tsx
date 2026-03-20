'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Box, Database, Lock, Terminal } from 'lucide-react'

const features = [
  { icon: Box, name: 'Voxel-based probabilistic modeling' },
  { icon: Database, name: 'Volumetric resource estimation' },
  { icon: Box, name: 'Scenario simulation capability' },
  { icon: Database, name: 'Temporal versioning' },
  { icon: Terminal, name: 'API-driven query interface' },
]

const securityFeatures = [
  'Geofenced infrastructure',
  'Sovereign data control',
  'Encrypted processing environments',
  'Role-based access controls',
]

const exampleQueries = [
  'Estimate total inferred lithium resources within defined boundary.',
  'Simulate groundwater extraction impact over 10 years.',
  'Rank offshore hydrothermal vent potential within EEZ.',
]

export function DigitalTwinSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="digital-twin" className="py-28 md:py-36 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#c9844a] text-sm tracking-[0.3em] uppercase mb-5 font-medium">
            Sovereign Digital Twin
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-8 text-white">
            Sovereign Subsurface <span className="aurora-gradient">Digital Twin</span>
          </h2>
          <p className="text-[#a0a0b0] font-light max-w-3xl mx-auto leading-relaxed text-lg">
            Aurora enables the construction of a dynamic, queryable 4D subsurface digital twin 
            for nations and exclusive economic zones.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-xl font-medium mb-8 flex items-center gap-4 text-white">
              <Box className="w-6 h-6 text-[#c9844a]" />
              What It Provides
            </h3>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
                  className="flex items-center gap-4 px-5 py-4 aurora-border bg-[#0a0a10]/60 rounded-lg hover:bg-[#0f0f18] transition-colors"
                >
                  <feature.icon className="w-5 h-5 text-[#c9844a]" />
                  <span className="text-base font-light text-[#d0d0d8]">{feature.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Example Queries */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-xl font-medium mb-8 flex items-center gap-4 text-white">
              <Terminal className="w-6 h-6 text-[#c9844a]" />
              Example Queries
            </h3>
            <p className="text-sm text-[#a0a0b0] font-light mb-5 italic">
              Conceptual examples only
            </p>
            <div className="space-y-4">
              {exampleQueries.map((query, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="px-5 py-4 aurora-border bg-[#0a0a10]/60 rounded-lg font-mono text-sm text-[#a0a0b0]"
                >
                  <span className="text-[#c9844a] mr-3">&gt;</span>
                  {query}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20"
        >
          <div className="aurora-border bg-[#0a0a10]/60 rounded-lg p-10">
            <div className="flex items-center gap-4 mb-8">
              <Lock className="w-6 h-6 text-[#c9844a]" />
              <h3 className="text-xl font-medium text-white">Data Security</h3>
            </div>
            <p className="text-base text-[#a0a0b0] font-light mb-8">
              Aurora deployments support:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3 px-5 py-4 bg-[#050508]/80 rounded-lg border border-[#c9844a]/15"
                >
                  <span className="w-2 h-2 rounded-full bg-[#c9844a]" />
                  <span className="text-sm font-light text-[#d0d0d8]">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
