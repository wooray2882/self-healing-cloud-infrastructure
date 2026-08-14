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
  Mail,
  Menu
} from 'lucide-react';
import SubscriptionModal from '../SubscriptionModal';

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
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

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'incident',
      title: 'Incident INC-4921 Resolved',
      summary: 'Amazon Bedrock AI autonomously scaled deployment/healops-backend to 5 replicas.',
      time: '2m ago',
      link: '/self-healing',
      unread: true,
    },
    {
      id: 'notif-2',
      type: 'security',
      title: 'DevSecOps Vulnerability Scan Passed',
      summary: 'Trivy container audit passed with 0 Critical/High CVEs.',
      time: '14m ago',
      link: '/security',
      unread: true,
    },
    {
      id: 'notif-3',
      type: 'cicd',
      title: 'GitOps Continuous Deployment',
      summary: 'Commit 538346b rolled out to Amazon EKS cluster with 0 downtime.',
      time: '28m ago',
      link: '/cicd',
      unread: true,
    },
    {
      id: 'notif-4',
      type: 'alert',
      title: 'Prometheus Alertmanager Active',
      summary: 'Target CPU threshold 80% rule active and firing into AWS SNS topic.',
      time: '1h ago',
      link: '/alerts',
      unread: false,
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

  // Auto-launch Alert Subscription modal on page load / refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSubModalOpen(true);
    }, 500);
    return () => clearTimeout(timer);
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
      case 'incident': return <Bot className="h-3.5 w-3.5 text-sky-400" />;
      case 'security': return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case 'cicd': return <GitPullRequest className="h-3.5 w-3.5 text-indigo-400" />;
      default: return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <>
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />

      <header
        className="flex items-center justify-between px-3 sm:px-5 h-12 shrink-0 border-b relative z-30"
        style={{
          background: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-1 md:hidden text-slate-300 hover:text-white bg-slate-800 border border-slate-700/60 rounded-md transition-all active:scale-95 shrink-0"
              title="Open Navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <h1 className="text-xs sm:text-sm font-semibold tracking-tight truncate text-slate-200">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live indicator */}
          <div 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium shrink-0 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          >
            <span className="live-dot" />
            <span className="hidden xs:inline">Live Cluster</span>
            <span className="xs:hidden">Live</span>
          </div>

          {/* Direct Email Alerts Button */}
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="btn-primary text-xs hidden sm:inline-flex"
          >
            <Mail className="h-3.5 w-3.5" /> Email Alerts
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={flyoutRef}>
            <button 
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative p-1.5 rounded-md transition-colors hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white"
              title="Notifications & Alert Subscriptions"
            >
              <Bell className="h-4 w-4" />
              
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Flyout Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-slate-900 border border-slate-800 rounded-md shadow-2xl p-3.5 z-50 animate-in fade-in duration-100">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-200">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsSubModalOpen(true);
                    }}
                    className="btn-secondary text-[11px] py-1 px-2"
                  >
                    <Mail className="h-3 w-3" /> Email Alerts
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="space-y-1 max-h-72 overflow-y-auto divide-y divide-slate-800/40">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-2 rounded-md cursor-pointer transition-colors flex items-start gap-2.5 group ${
                        item.unread ? 'bg-slate-800/40 hover:bg-slate-800/70' : 'hover:bg-slate-800/20 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="p-1.5 bg-slate-950 rounded-md border border-slate-800 shrink-0 mt-0.5">
                        {getNotifIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-sky-400 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 shrink-0 font-mono">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-sky-400 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-2.5 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={markAllAsRead}
                    className="btn-tertiary text-[11px] py-1 px-2"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>

                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      setIsSubModalOpen(true);
                    }}
                    className="btn-secondary text-[11px] py-1 px-2.5"
                  >
                    Manage Alerts
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
