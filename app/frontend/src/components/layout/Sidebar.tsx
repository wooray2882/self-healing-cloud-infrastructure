import { NavLink } from 'react-router-dom'

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
]

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col h-full w-56 shrink-0"
      style={{ background: 'var(--color-bg-sidebar)', borderRight: '1px solid var(--color-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #06D6F0, #8B5CF6)' }}
        >
          <i className="ri-heart-pulse-fill text-white text-sm" />
        </div>
        <span className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
          Heal<span style={{ color: 'var(--color-cyan-500)' }}>Ops</span>
        </span>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.title}>
            <p
              className="text-xs font-semibold tracking-widest mb-2 px-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
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

      {/* User Profile */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #06D6F0, #8B5CF6)' }}
        >
          RW
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>Ray Woo</p>
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>Admin</p>
        </div>
        <i className="ri-more-2-fill ml-auto text-sm" style={{ color: 'var(--color-text-muted)' }} />
      </div>
    </aside>
  )
}
