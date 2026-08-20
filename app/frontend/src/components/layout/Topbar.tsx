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
  Menu,
  CheckCircle2,
  Flame,
  Settings
} from 'lucide-react';
import SubscriptionModal from '../SubscriptionModal';
import QuickChaosModal from '../chaos/QuickChaosModal';
import { useNotifications } from '../../context/NotificationContext';
import { useUser } from '../../context/UserContext';
import type { NotificationItem } from '../../context/NotificationContext';

interface TopbarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const navigate = useNavigate();
  const { notifications, dismissNotification, clearAllNotifications } = useNotifications();
  const { userName } = useUser();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isChaosModalOpen, setIsChaosModalOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSubModalOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    dismissNotification(item.id);
    setIsNotifOpen(false);
    navigate(item.link);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'incident': return <Bot className="h-3.5 w-3.5 text-sky-400" />;
      case 'security': return <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />;
      case 'cicd': return <GitPullRequest className="h-3.5 w-3.5 text-indigo-400" />;
      default: return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'R';

  return (
    <>
      <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
      <QuickChaosModal isOpen={isChaosModalOpen} onClose={() => setIsChaosModalOpen(false)} />

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
          {/* Global Inject Chaos Button */}
          <button
            onClick={() => setIsChaosModalOpen(true)}
            className="btn-danger text-xs flex items-center gap-1.5"
            title="Inject Chaos Fault into EKS Cluster"
          >
            <Flame className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Inject Chaos</span>
            <span className="xs:hidden">Chaos</span>
          </button>

          {/* Direct Email Alerts Button */}
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="btn-primary text-xs hidden sm:inline-flex"
          >
            <Mail className="h-3.5 w-3.5" /> Email Alerts
          </button>

          {/* User Profile Avatar Pill */}
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="flex items-center gap-1.5 p-1 px-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 rounded-md transition-colors text-xs text-slate-200"
            title="Edit User Profile & Notification Settings"
          >
            <div className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[10px]">
              {userInitial}
            </div>
            <span className="font-semibold hidden sm:inline truncate max-w-[100px]">
              {userName}
            </span>
            <Settings className="h-3 w-3 text-slate-400" />
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
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse shadow-sm">
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
                    {unreadCount > 0 ? (
                      <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-semibold">
                        All Caught Up
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
                    <Mail className="h-3 w-3" /> Profile & Alerts
                  </button>
                </div>

                {/* Notification Items List */}
                {notifications.length === 0 ? (
                  <div className="py-8 px-2 text-center flex flex-col items-center justify-center gap-2">
                    <div className="p-2 bg-emerald-600 text-white rounded-md">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">No Unread Notifications</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                        All incident alerts acknowledged. New alerts will appear here in real time.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 max-h-72 overflow-y-auto divide-y divide-slate-800/40">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className="p-2 rounded-md cursor-pointer transition-colors flex items-start gap-2.5 group bg-slate-800/40 hover:bg-slate-800/80"
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
                )}

                {/* Footer Actions */}
                <div className="pt-2.5 mt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  {notifications.length > 0 ? (
                    <button
                      onClick={clearAllNotifications}
                      className="btn-tertiary text-[11px] py-1 px-2"
                    >
                      <Check className="h-3 w-3" /> Dismiss all
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500">System Healthy</span>
                  )}

                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/incidents');
                    }}
                    className="btn-secondary text-[11px] py-1 px-2.5"
                  >
                    View All Incidents
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
