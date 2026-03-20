'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Building2, Landmark, Pickaxe, Zap, TrendingUp } from 'lucide-react'

const clients = [
  { icon: Landmark, name: 'National governments' },
  { icon: Building2, name: 'Sovereign wealth funds' },
  { icon: Pickaxe, name: 'Major mining corporations' },
  { icon: Zap, name: 'Energy operators' },
  { icon: TrendingUp, name: 'Strategic commodity investors' },
]

export function WhoWeServeSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-28 md:py-36 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#c9844a] text-sm tracking-[0.3em] uppercase mb-5 font-medium">
            Strategic Clients
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-white">
            Who We <span className="aurora-gradient">Serve</span>
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-5 md:gap-6">
          {clients.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <div className="flex items-center gap-4 px-7 py-5 aurora-border bg-[#0a0a10]/60 backdrop-blur-sm rounded-lg hover:bg-[#0f0f18] hover:border-[#c9844a]/40 transition-all duration-300 card-hover">
                <client.icon className="w-6 h-6 text-[#c9844a]" />
                <span className="text-base font-medium text-[#d0d0d8] group-hover:text-white transition-colors">
                  {client.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
