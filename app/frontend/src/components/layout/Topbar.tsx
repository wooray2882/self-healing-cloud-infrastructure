interface TopbarProps {
  title: string
}

export default function Topbar({ title }: TopbarProps) {
  return (
    <header
      className="flex items-center justify-between px-6 h-14 shrink-0 border-b"
      style={{
        background: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h1 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h1>

      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399' }}>
          <span className="live-dot" />
          Live
        </div>

        {/* Search */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: 'var(--color-bg-input)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <i className="ri-search-line" />
          <span className="hidden sm:inline">Search...</span>
          <span
            className="hidden sm:inline text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            ⌘K
          </span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg transition-colors hover:bg-white/5">
          <i className="ri-notification-3-line text-base" style={{ color: 'var(--color-text-secondary)' }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: 'var(--color-red-500)' }}
          />
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg transition-colors hover:bg-white/5">
          <i className="ri-settings-3-line text-base" style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </header>
  )
}
