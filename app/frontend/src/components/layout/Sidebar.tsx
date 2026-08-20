import { NavLink } from 'react-router-dom'
import { X, Settings } from 'lucide-react'
import { useUser } from '../../context/UserContext'

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
      { label: 'Metrics',    icon: 'ri-line-chart-line',    to: '/metrics'   },
      { label: 'Incidents',  icon: 'ri-alarm-warning-line', to: '/incidents' },
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
  onOpenSettings?: () => void
}

export default function Sidebar({ isOpen = false, onClose, onOpenSettings }: SidebarProps) {
  const { userName } = useUser();

  const userInitials = userName
    ? userName
        .trim()
        .split(/\s+/)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'RW';

  const content = (
    <div className="flex flex-col h-full w-full">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-3.5 py-3.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md shadow-sm"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
          >
            <i className="ri-heart-pulse-fill text-white text-sm" />
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Heal<span style={{ color: 'var(--color-cyan-400)' }}>Ops</span>
          </span>
        </div>

        {/* Close Button on Mobile */}
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 md:hidden text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
            title="Close Menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 touch-pan-y">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            <p
              className="text-[10px] font-semibold tracking-wider mb-1.5 px-2 uppercase text-slate-400"
            >
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <i className={`${item.icon} text-sm`} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Dynamic User Profile Footer */}
      <div
        onClick={onOpenSettings}
        className="flex items-center gap-2.5 px-3 py-3 border-t mt-auto shrink-0 cursor-pointer hover:bg-slate-800/60 transition-colors group"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-base)' }}
        title="Edit User Profile Settings"
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold text-white shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          {userInitials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate group-hover:text-sky-400 transition-colors" style={{ color: 'var(--color-text-primary)' }}>
            {userName}
          </p>
          <p className="text-[10px] text-slate-400 truncate">SRE Admin</p>
        </div>
        <Settings className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 shrink-0 transition-colors" />
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside
        className="hidden md:flex flex-col h-full w-52 shrink-0 z-20"
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
            className="relative flex flex-col h-full w-60 max-w-[85vw] z-10 shadow-2xl animate-in slide-in-from-left duration-200"
            style={{ background: 'var(--color-bg-sidebar)', borderRight: '1px solid var(--color-border)' }}
          >
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
