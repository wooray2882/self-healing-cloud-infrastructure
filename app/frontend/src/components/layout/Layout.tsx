import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import AIChatWidget from '../ai/AIChatWidget'

const PAGE_TITLES: Record<string, string> = {
  '/overview':     'Cluster Overview',
  '/nodes':        'Node Management',
  '/pods':         'Pod Status',
  '/metrics':      'Metrics & Observability',
  '/alerts':       'Alerts & Incidents',
  '/self-healing': 'Self-Healing Engine',
  '/chaos':        'Chaos Engineering',
  '/cicd':         'GitOps & CI/CD Pipeline',
  '/security':     'Security & Compliance Audit',
  '/ai-assistant': 'AI Operations Assistant',
}

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const title = PAGE_TITLES[pathname] ?? 'HealOps'

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--color-bg-base)' }}>
      {/* Sidebar (Permanent on Desktop, Drawer on Mobile) */}
      <Sidebar 
        isOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar 
          title={title} 
          onMenuClick={() => setMobileSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5">
          {children}
        </main>
      </div>

      <AIChatWidget />
    </div>
  )
}
