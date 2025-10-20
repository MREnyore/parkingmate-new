import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/AppSidebar'
import { Navbar } from '@/components/Navbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ErrorPlaceholder } from './common/ErrorPage'
import { LoadingPlaceholder } from './common/LoadingPlaceholder'
import { TransitionWrapper } from './common/TransitionWrapper'

interface DashboardLayoutProps {
  children: ReactNode
  isContentLoading?: boolean
  isContentError?: boolean
}

export function DashboardLayout({
  children,
  isContentLoading,
  isContentError
}: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <TransitionWrapper className="flex-1">
          {isContentLoading && <LoadingPlaceholder />}
          {isContentError && <ErrorPlaceholder />}
          {!isContentLoading && !isContentError && (
            <main className="flex-1 p-6 bg-background">{children}</main>
          )}
        </TransitionWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
