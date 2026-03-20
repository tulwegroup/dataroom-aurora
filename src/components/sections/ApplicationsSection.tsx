'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Gem, Droplets, Wind, Waves } from 'lucide-react'

const applications = [
  {
    icon: Gem,
    title: 'Critical Minerals',
    description: 'Aurora identifies and ranks potential mineral systems including:',
    items: [
      'Copper',
      'Lithium',
      'Rare Earth Elements',
      'Nickel',
      'Bauxite',
      'Polymetallic Nodules',
    ],
    footer: 'Outputs include probability-ranked targets and volumetric estimates.',
  },
  {
    icon: Droplets,
    title: 'Hydrocarbon Intelligence',
    description: null,
    items: [
      'Frontier basin screening',
      'Structural trap probability modeling',
      'Offshore seepage network analysis',
      'Basin-scale gravimetric reconstruction',
    ],
    footer: null,
  },
  {
    icon: Wind,
    title: 'Carbon Capture & Storage (CCS)',
    description: null,
    items: [
      'Deep saline aquifer geometry',
      'Seal integrity assessment',
      'Deformation monitoring',
      'Long-term storage suitability modeling',
    ],
    footer: null,
  },
  {
    icon: Waves,
    title: 'Groundwater & Environmental Monitoring',
    description: null,
    items: [
      'Aquifer mass balance estimation',
      'Subsidence mapping',
      'Saline intrusion detection',
      'Tailings and legacy mine monitoring',
    ],
    footer: null,
  },
]

export function ApplicationsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="applications" className="py-28 md:py-36 relative bg-[#0a0a10]/50">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#c9844a] text-sm tracking-[0.3em] uppercase mb-5 font-medium">
            Applications
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white">
            Strategic <span className="aurora-gradient">Applications</span>
          </h2>
        </motion.div>

        {/* Application Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {applications.map((app, index) => (
            <motion.div
              key={app.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <div className="h-full p-8 aurora-border bg-[#0a0a10]/80 backdrop-blur-sm rounded-lg hover:bg-[#0f0f18] transition-all duration-500 card-hover">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-lg bg-[#c9844a]/15 flex items-center justify-center group-hover:bg-[#c9844a]/25 transition-colors duration-300">
                    <app.icon className="w-7 h-7 text-[#c9844a]" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{app.title}</h3>
                </div>

                {app.description && (
                  <p className="text-base text-[#a0a0b0] font-light mb-5">
                    {app.description}
                  </p>
                )}

                <ul className="space-y-3">
                  {app.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-base text-[#d0d0d8] font-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c9844a]" />
                      {item}
                    </li>
                  ))}
                </ul>

                {app.footer && (
                  <p className="text-sm text-[#a0a0b0] font-light mt-6 pt-5 border-t border-[#c9844a]/15 italic">
                    {app.footer}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
