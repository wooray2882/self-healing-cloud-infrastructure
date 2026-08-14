import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'

interface NavItem {
  label: string
  icon: string
  to: string
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'CLUSTER',
    items: [
      { label: 'Overview',   icon: 'ri-dashboard-3-line',  to: '/overview' },
      { label: 'Nodes',      icon: 'ri-server-line',        to: '/nodes'    },
      { label: 'Pods',       icon: 'ri-box-3-line',         to: '/pods'     },
    ],
  },
  {
    title: 'MONITORING',
    items: [
      { label: 'Metrics',  icon: 'ri-line-chart-line',    to: '/metrics' },
      { label: 'Alerts',   icon: 'ri-alarm-warning-line', to: '/alerts'  },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Self-Healing',  icon: 'ri-heart-pulse-line',  to: '/self-healing'  },
      { label: 'Chaos',         icon: 'ri-flashlight-line',   to: '/chaos'         },
    ],
  },
  {
    title: 'GITOPS & DELIVERY',
    items: [
      { label: 'CI/CD Pipeline', icon: 'ri-git-merge-line',   to: '/cicd'          },
    ],
  },
  {
    title: 'SECURITY & COMPLIANCE',
    items: [
      { label: 'Security Audit', icon: 'ri-shield-check-line', to: '/security'     },
    ],
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const content = (
    <div className="flex flex-col h-full w-full">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-4 py-4.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl shadow-md"
            style={{ background: 'linear-gradient(135deg, #06D6F0, #8B5CF6)' }}
          >
            <i className="ri-heart-pulse-fill text-white text-base" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Heal<span style={{ color: 'var(--color-cyan-500)' }}>Ops</span>
          </span>
        </div>

        {/* Close Button on Mobile */}
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1.5 md:hidden text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors"
            title="Close Menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4.5 touch-pan-y">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            <p
              className="text-[10px] font-bold tracking-wider mb-2 px-2 uppercase"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''} flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all`
                    }
                  >
                    <i className={`${item.icon} text-base`} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 border-t mt-auto shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #06D6F0, #8B5CF6)' }}
        >
          RW
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>Ray Woo</p>
          <p className="text-[10px] text-slate-400 truncate">SRE Admin</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside
        className="hidden md:flex flex-col h-full w-56 shrink-0 z-20"
        style={{ background: 'var(--color-bg-sidebar)', borderRight: '1px solid var(--color-border)' }}
      >
        {content}
      </aside>

      {/* Mobile Drawer (Slide-over with Backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <aside 
            className="relative flex flex-col h-full w-64 max-w-[85vw] z-10 shadow-2xl animate-in slide-in-from-left duration-200"
            style={{ background: 'var(--color-bg-sidebar)', borderRight: '1px solid var(--color-border)' }}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
