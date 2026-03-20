'use client'

import Link from 'next/link'
import { Globe, Mail, Shield } from 'lucide-react'

const footerLinks = {
  platform: [
    { name: 'Architecture', href: '#platform' },
    { name: 'Data Foundation', href: '#platform' },
    { name: 'Intelligence Engine', href: '#platform' },
  ],
  applications: [
    { name: 'Critical Minerals', href: '#applications' },
    { name: 'Hydrocarbon Intelligence', href: '#applications' },
    { name: 'Carbon Storage', href: '#applications' },
  ],
  company: [
    { name: 'Strategic Engagement', href: '#engagement' },
    { name: 'Request Briefing', href: '#engagement' },
  ],
}

export function Footer() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="bg-[#0a0a10] border-t border-[#c9844a]/15 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Globe className="w-9 h-9 text-[#c9844a]" />
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-[0.15em] text-white">AURORA</span>
                <span className="text-[9px] tracking-[0.35em] text-[#c9844a] uppercase font-medium">OSI</span>
              </div>
            </Link>
            <p className="text-base text-[#a0a0b0] font-light leading-relaxed max-w-sm">
              Orbital Subsurface Intelligence Infrastructure
            </p>
            <p className="text-base text-[#a0a0b0] font-light leading-relaxed mt-4 max-w-sm">
              Transforming the Earth&apos;s subsurface into a structured, queryable intelligence layer.
            </p>
            
            {/* Security Badge */}
            <div className="flex items-center gap-3 mt-8 text-sm text-[#a0a0b0]">
              <Shield className="w-5 h-5 text-[#c9844a]" />
              <span className="font-medium">Sovereign-Grade Security</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide mb-5 text-white">Platform</h3>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-[#a0a0b0] hover:text-[#c9844a] transition-colors font-light"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Applications Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide mb-5 text-white">Applications</h3>
            <ul className="space-y-4">
              {footerLinks.applications.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-[#a0a0b0] hover:text-[#c9844a] transition-colors font-light"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide mb-5 text-white">Contact</h3>
            <a
              href="mailto:briefing@aurora-osi.com"
              className="flex items-center gap-3 text-sm text-[#a0a0b0] hover:text-[#c9844a] transition-colors font-light"
            >
              <Mail className="w-4 h-4" />
              briefing@aurora-osi.com
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#c9844a]/15 mt-14 pt-10 flex flex-col md:flex-row justify-between items-center gap-5">
          <p className="text-sm text-[#707080] font-light">
            © {new Date().getFullYear()} Aurora OSI. All rights reserved.
          </p>
          <p className="text-sm text-[#707080] font-light">
            Planetary-Scale Orbital Subsurface Intelligence
          </p>
        </div>
      </div>
    </footer>
  )
}
