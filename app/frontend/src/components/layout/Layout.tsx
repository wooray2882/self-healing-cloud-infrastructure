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
  '/ai-assistant': 'AI Operations Assistant',
}

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'HealOps'

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--color-bg-base)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
      <AIChatWidget />
    </div>
  )
}
