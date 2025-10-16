import type { ReactNode } from 'react'
import { BrandingSection } from '@/components/BrandingSection'

interface AuthLayoutProps {
  children: ReactNode
  backgroundText?: string
  backgroundTextDefault?: string
}

export function AuthLayout({
  children,
  backgroundText,
  backgroundTextDefault
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form Content - 1/3 of screen on desktop */}
      <div className="w-full md:w-[40%] flex items-center justify-center p-4 px-8 sm:p-8 bg-white">
        {children}
      </div>

      {/* Right Side - Branding - 2/3 of screen on desktop, hidden on mobile */}
      <div className="hidden md:block w-[60%]">
        <BrandingSection
          backgroundText={backgroundText}
          backgroundTextDefault={backgroundTextDefault}
        />
      </div>
    </div>
  )
}
