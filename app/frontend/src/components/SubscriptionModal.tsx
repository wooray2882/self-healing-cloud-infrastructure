import React, { useState } from 'react';
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
  Clock,
  Smartphone
} from 'lucide-react';
import { fetchApi } from '../api/client';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetchApi('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: 'email', endpoint: email }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to submit subscription request');
      }

      setStatus('success');
      
      // Auto close after 4.5 seconds
      setTimeout(() => {
        setStatus('idle');
        setEmail('');
        onClose();
      }, 4500);
      
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-lg p-5 sm:p-7 border shadow-2xl bg-slate-900/95 border-slate-700/80 rounded-3xl relative overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Interactive SRE Alerting Demo
              </span>
              <button 
                onClick={onClose} 
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 rounded-2xl">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Connect Live Email Alerts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Receive real-time 2-phase AWS SNS notifications directly to your inbox
                </p>
              </div>
            </div>

            {/* What you will experience */}
            <div className="my-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-cyan-400" /> What you will receive in your inbox:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Phase 1: Triage Alert
                  </span>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Instant alert as soon as Prometheus catches an anomaly, with Incident ID, root cause, and timestamps.
                  </p>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Phase 2: MTTR Resolution
                  </span>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Follow-up email when Bedrock AI executes remediation with exact MTTR duration (e.g. 4.2s).
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Your Work or Personal Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="engineer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-white transition-all bg-slate-950/80 border rounded-xl border-slate-700/70 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-600"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  AWS SNS will send an instant confirmation email. Click <strong>Confirm subscription</strong> to activate alerts.
                </span>
              </div>

              {/* Privacy Guarantee */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-2.5 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-semibold">100% Privacy Guarantee:</strong> Your email is used exclusively for this interactive AWS incident demonstration during your session. Zero marketing, zero data selling, and 1-click unsubscribe anytime.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {status === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Confirmation Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Enable Live Email Alerts
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
                >
                  Explore Dashboard First
                </button>
              </div>
            </form>

            {/* Status Messages */}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>
                  Success! Check your inbox for the AWS SNS confirmation email, click <strong>Confirm</strong>, then test a fault in the <strong>Chaos Lab</strong>!
                </span>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Future Roadmap Note */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-3 w-3 text-slate-600" /> Mobile SMS & PagerDuty Integration
              </span>
              <span className="text-cyan-500 font-medium">Enterprise Roadmap</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
