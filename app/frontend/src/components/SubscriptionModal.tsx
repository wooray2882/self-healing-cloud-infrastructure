import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  X, 
  Send, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Radio, 
  AlertCircle,
  Smartphone,
  User
} from 'lucide-react';
import { fetchApi } from '../api/client';
import { useUser } from '../context/UserContext';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { userName, userEmail, updateProfile } = useUser();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setName(userName);
    setEmail(userEmail);
  }, [userName, userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Save personalized profile name & email to context + localStorage
    updateProfile(name, email);

    try {
      const res = await fetchApi('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: 'email', endpoint: email, userName: name }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to submit subscription request');
      }

      setStatus('success');
      
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 4000);
      
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to subscribe. Please verify backend connection.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            className="w-full max-w-lg p-5 border shadow-2xl bg-slate-900 border-slate-800 rounded-md relative overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-sky-400" /> Personalize & Alerting Settings
              </span>
              <button 
                onClick={onClose} 
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Title */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-md">
                <Radio className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  User Profile & Live Alert Settings
                </h2>
                <p className="text-[11px] text-slate-400">
                  Personalize the platform with your SRE handle and connect live AWS SNS email alerts
                </p>
              </div>
            </div>

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="space-y-3 mt-3">
              {/* User Full Name Input */}
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Your Full Name / SRE Handle
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ray Woo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs text-white transition-all bg-slate-950 border rounded-md border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-600 font-medium"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The Bedrock AI Assistant, Chaos Engine, and SRE logs will address you personally as <strong>{name || 'Ray Woo'}</strong>.
                </span>
              </div>

              {/* Email Address Input */}
              <div>
                <label className="block mb-1 text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Email Address for SNS Alerts
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs text-white transition-all bg-slate-950 border rounded-md border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:text-slate-600 font-medium"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  AWS SNS sends real-time incident reports directly to your inbox.
                </span>
              </div>

              {/* Privacy Guarantee */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-md p-2.5 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-medium">Privacy Guarantee:</strong> Profile name and email are stored locally in your browser for this session. Zero spam, zero marketing.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="btn-primary text-xs py-2 flex-1"
                >
                  {status === 'loading' ? (
                    <div className="w-3.5 h-3.5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Profile & Alerts Saved!
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" /> Save Profile & Enable Alerts
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs py-2"
                >
                  Close
                </button>
              </div>
            </form>

            {/* Status Messages */}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2 text-xs text-emerald-300"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-[11px]">
                  Welcome <strong>{name}</strong>! Profile updated and AWS SNS confirmation email requested for <strong>{email}</strong>.
                </span>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center gap-2 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="text-[11px]">{errorMessage}</span>
              </motion.div>
            )}

            {/* Future Roadmap Note */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-slate-600" /> Mobile SMS & PagerDuty Integration
              </span>
              <span className="text-sky-500 font-medium">Enterprise Roadmap</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
