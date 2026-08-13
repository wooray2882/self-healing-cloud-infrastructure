import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Send, Phone, Mail } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [endpoint, setEndpoint] = useState('');
  const [protocol, setProtocol] = useState<'sms' | 'email'>('sms');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('http://localhost:4000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol, endpoint }),
      });

      if (!res.ok) throw new Error('Failed to subscribe');
      setStatus('success');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setEndpoint('');
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md p-6 border shadow-2xl bg-gray-900/90 border-gray-700/50 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-cyan-400">
                <Bell className="w-6 h-6" />
                <h2 className="text-xl font-semibold text-white">Alert Notifications</h2>
              </div>
              <button onClick={onClose} className="p-1 text-gray-400 transition-colors hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mb-6 text-sm text-gray-300">
              Subscribe to receive real-time alerts when the self-healing AI agent automatically remediates a cluster failure.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setProtocol('sms')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${protocol === 'sms' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Phone className="w-4 h-4" /> SMS Text
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${protocol === 'email' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
              </div>

              <div>
                <label className="block mb-2 text-xs font-medium text-gray-400 uppercase">
                  {protocol === 'sms' ? 'Phone Number (with country code)' : 'Email Address'}
                </label>
                <input
                  type={protocol === 'sms' ? 'tel' : 'email'}
                  placeholder={protocol === 'sms' ? '+1234567890' : 'you@example.com'}
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  required
                  className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border rounded-xl border-gray-700/50 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-all shadow-lg bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                ) : status === 'success' ? (
                  'Subscription Sent!'
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Subscribe
                  </>
                )}
              </button>
            </form>

            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-center text-green-400"
              >
                Success! Please check your {protocol === 'sms' ? 'phone' : 'email'} to confirm the AWS SNS subscription.
              </motion.p>
            )}
            
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-center text-red-400"
              >
                Failed to subscribe. Is the backend running?
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;
