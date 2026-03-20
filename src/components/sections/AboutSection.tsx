'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const capabilities = [
  'Critical mineral targeting',
  'Frontier hydrocarbon basin screening',
  'Offshore seabed intelligence',
  'Carbon storage site evaluation',
  'National subsurface digital twins',
]

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="py-28 md:py-36 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-[#0a0a10]/80 to-[#050508]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-8 text-white">
              Transforming Subsurface Into{' '}
              <span className="aurora-gradient">Intelligence</span>
            </h2>
            
            <div className="space-y-6 text-[#a0a0b0] font-light leading-relaxed text-lg">
              <p>
                Aurora OSI is the first integrated orbital system designed to transform the 
                Earth&apos;s subsurface into a structured, queryable intelligence layer.
              </p>
              <p>
                By fusing multi-orbit satellite data with physics-informed and causally 
                constrained AI, Aurora generates probabilistic 3D subsurface models at 
                regional to planetary scale.
              </p>
            </div>

            {/* Capabilities list */}
            <div className="mt-12">
              <p className="text-sm text-[#c9844a] tracking-[0.2em] mb-6 uppercase font-medium">The System Enables</p>
              <ul className="space-y-4">
                {capabilities.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-4 text-[#d0d0d8] font-light text-lg"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#c9844a]" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Visual element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square relative max-w-md mx-auto">
              {/* Layered circles representing subsurface layers */}
              <div className="absolute inset-0 rounded-full border border-[#c9844a]/15 aurora-border" />
              <div className="absolute inset-8 rounded-full border border-[#c9844a]/20 aurora-border" />
              <div className="absolute inset-16 rounded-full border border-[#c9844a]/25 aurora-border" />
              <div className="absolute inset-24 rounded-full border border-[#c9844a]/35 aurora-border" />
              
              {/* Center glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-[#c9844a]/15 blur-2xl" />
              </div>
              
              {/* Cross-section lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(201,132,74,0.15)" strokeWidth="1" strokeDasharray="6,6" />
                <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(201,132,74,0.15)" strokeWidth="1" strokeDasharray="6,6" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
