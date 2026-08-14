import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Bot, 
  ShieldCheck, 
  GitPullRequest, 
  AlertTriangle, 
  Check, 
  ExternalLink,
  Phone
} from 'lucide-react';
import SubscriptionModal from '../SubscriptionModal';

interface TopbarProps {
  title: string;
}

interface NotificationItem {
  id: string;
  type: 'incident' | 'security' | 'cicd' | 'alert';
  title: string;
  summary: string;
  time: string;
  link: string;
  unread: boolean;
}

export default function Topbar({ title }: TopbarProps) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'incident',
      title: 'Incident Remediated: High CPU Lock',
      summary: 'Amazon Bedrock AI resolved thread lock in 4.2s via rolling restart.',
      time: 'Just now',
      link: '/self-healing',
      unread: true
    },
    {
      id: 'notif-2',
      type: 'security',
      title: 'AquaSecurity Trivy Audit: Clean',
      summary: '0 Critical / 0 High CVEs detected on node:22-alpine base layer.',
      time: '14m ago',
      link: '/security',
      unread: true
    },
    {
      id: 'notif-3',
      type: 'cicd',
      title: 'GitOps Rollout Passed',
      summary: 'GitHub Actions run #run-1043 deployed to Amazon EKS in 49s.',
      time: '45m ago',
      link: '/cicd',
      unread: true
    },
    {
      id: 'notif-4',
      type: 'alert',
      title: 'Prometheus Rule Evaluated',
      summary: 'Alertmanager rule HighCPUUsage active across 2 EC2 worker nodes.',
      time: '1h ago',
      link: '/alerts',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Close flyout when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setIsNotifOpen(false);
    navigate(item.link);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'incident': return <Bot className="h-4 w-4 text-cyan-400" />;
      case 'security': return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
      case 'cicd': return <GitPullRequest className="h-4 w-4 text-indigo-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <>
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />

      <header
        className="flex items-center justify-between px-6 h-14 shrink-0 border-b relative z-30"
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
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399' }}
          >
            <span className="live-dot" />
            Live Cluster
          </div>

          {/* Notification Bell & Alert Subscription Dropdown */}
          <div className="relative" ref={flyoutRef}>
            <button 
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative p-2 rounded-xl transition-all hover:bg-slate-800/80 active:scale-95 border border-transparent hover:border-slate-700/60"
              title="Notifications & Alert Subscriptions"
            >
              <Bell className="h-5 w-5 text-slate-300 hover:text-white transition-colors" />
              
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-md border border-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Flyout Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsSubModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all active:scale-95 shadow-sm"
                  >
                    <Phone className="h-3 w-3" /> Subscribe
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="space-y-1 max-h-72 overflow-y-auto divide-y divide-slate-800/40">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-start gap-3 group ${
                        item.unread ? 'bg-slate-800/50 hover:bg-slate-800' : 'hover:bg-slate-800/30 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        {getNotifIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={markAllAsRead}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>

                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsSubModalOpen(true);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] underline underline-offset-2"
                  >
                    Manage SMS/Email Alerts
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
