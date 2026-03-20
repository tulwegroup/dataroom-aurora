'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Briefcase, Globe, Target, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const engagements = [
  {
    icon: Briefcase,
    title: 'Corporate Intelligence Engagement',
    description: 'Regional subsurface intelligence program for mining or energy operators.',
    includes: [
      'Target ranking',
      'Probability modeling',
      'Strategic advisory briefings',
    ],
  },
  {
    icon: Globe,
    title: 'Sovereign Feasibility Study',
    description: 'National-level subsurface assessment across territory or EEZ.',
    includes: [
      'Regional resource mapping',
      'Digital twin framework',
      'Strategic development roadmap',
    ],
  },
  {
    icon: Target,
    title: 'Premium Target Derisking',
    description: 'High-priority anomaly deep-dive analysis.',
    includes: [
      'Advanced inversion modeling',
      'Adaptive satellite tasking',
      'Generative scenario modeling',
      'Drill-ready recommendation framework',
    ],
  },
]

export function EngagementSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="engagement" className="py-28 md:py-36 relative bg-[#0a0a10]/50">
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
            Strategic Engagement
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-8 text-white">
            Strategic <span className="aurora-gradient">Engagement</span>
          </h2>
          <p className="text-[#a0a0b0] font-light max-w-2xl mx-auto leading-relaxed text-lg">
            Aurora engagements are structured for institutional and sovereign clients.
          </p>
        </motion.div>

        {/* Engagement Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {engagements.map((engagement, index) => (
            <motion.div
              key={engagement.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="group"
            >
              <div className="h-full p-8 aurora-border bg-[#0a0a10]/80 backdrop-blur-sm rounded-lg hover:bg-[#0f0f18] transition-all duration-500 flex flex-col card-hover">
                <div className="mb-8">
                  <div className="w-14 h-14 rounded-lg bg-[#c9844a]/15 flex items-center justify-center group-hover:bg-[#c9844a]/25 transition-colors duration-300 mb-6">
                    <engagement.icon className="w-7 h-7 text-[#c9844a]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-white">{engagement.title}</h3>
                  <p className="text-[#a0a0b0] font-light leading-relaxed">
                    {engagement.description}
                  </p>
                </div>

                <div className="mt-auto">
                  <p className="text-xs text-[#c9844a] tracking-[0.15em] uppercase mb-4 font-medium">
                    Includes
                  </p>
                  <ul className="space-y-3">
                    {engagement.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-base text-[#d0d0d8] font-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c9844a]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="aurora-border bg-[#0a0a10]/80 rounded-lg p-10 md:p-14">
            <h3 className="text-2xl md:text-3xl font-medium mb-5 text-white">
              Request a Strategic Briefing
            </h3>
            <p className="text-base text-[#a0a0b0] font-light mb-10 leading-relaxed">
              Aurora OSI engagements are conducted under confidentiality and institutional review.
            </p>
            
            <a href="mailto:briefing@aurora-osi.com">
              <Button
                size="lg"
                className="bg-[#c9844a] hover:bg-[#d4a574] text-[#050508] font-semibold tracking-wide px-8 h-14 text-base"
              >
                <Mail className="mr-2 w-5 h-5" />
                briefing@aurora-osi.com
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
