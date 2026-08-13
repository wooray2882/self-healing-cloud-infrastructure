import React, { useState } from 'react'
import { Activity, Server, Cpu, ShieldAlert, Zap, Bell, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { clusterKPIs, cpuMemoryHistory, podsAtRisk, recentAlerts, healingEvents } from '../data/mockData'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import SubscriptionModal from '../components/SubscriptionModal'

export default function OverviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  const handleInjectChaos = async () => {
    setIsInjecting(true);
    try {
      await fetch('http://localhost:4000/api/chaos/inject', { method: 'POST' });
      setTimeout(() => setIsInjecting(false), 3000);
    } catch (error) {
      console.error(error);
      setIsInjecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SubscriptionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Header with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Cluster Overview</h1>
          <p className="text-gray-400 mt-1">Real-time health and AI remediation metrics</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 font-medium text-cyan-400 transition-colors bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20"
          >
            <Bell className="w-4 h-4" /> Subscribe to Alerts
          </button>
          
          <button 
            onClick={handleInjectChaos}
            disabled={isInjecting}
            className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all bg-red-500/80 border border-red-500 rounded-xl hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
          >
            <AlertTriangle className={`w-4 h-4 ${isInjecting ? 'animate-pulse' : ''}`} /> 
            {isInjecting ? 'Injecting Chaos...' : 'Inject Chaos (Test AI)'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Cluster Health" data={clusterKPIs.health} />
        <KPICard title="Active Nodes" data={clusterKPIs.activeNodes} />
        <KPICard title="Running Pods" data={clusterKPIs.runningPods} />
        <KPICard title="CPU Usage" data={clusterKPIs.cpuUsage} />
        <KPICard title="Memory Usage" data={clusterKPIs.memUsage} />
        <KPICard title="Active Alerts" data={clusterKPIs.activeAlerts} />
      </div>

      {/* Middle row: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* We'll fill this with real charts later. For now, a placeholder block. */}
        <div className="card col-span-2">
           <h2 className="text-lg font-medium mb-4">CPU & Memory Over Time</h2>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuMemoryHistory}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06D6F0" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06D6F0" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141628', borderColor: '#1E2344', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#06D6F0" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                  <Area type="monotone" dataKey="mem" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Cluster Score</h2>
          <div className="h-64 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
             [Radar Chart Placeholder]
          </div>
        </div>
      </div>

      {/* Bottom row: Tables & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2">
           <h2 className="text-lg font-medium mb-4">Pods at Risk</h2>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs uppercase bg-[#0F1122] text-[#9CA3AF]">
                 <tr>
                   <th className="px-4 py-3 rounded-tl-lg">Pod Name</th>
                   <th className="px-4 py-3">Namespace</th>
                   <th className="px-4 py-3">CPU</th>
                   <th className="px-4 py-3">Memory</th>
                   <th className="px-4 py-3">Status</th>
                   <th className="px-4 py-3 rounded-tr-lg">Risk</th>
                 </tr>
               </thead>
               <tbody>
                 {podsAtRisk.map(pod => (
                   <tr key={pod.name} className="border-b border-[#1E2344]">
                     <td className="px-4 py-3 font-medium text-white">{pod.name}</td>
                     <td className="px-4 py-3 text-[#9CA3AF]">{pod.namespace}</td>
                     <td className="px-4 py-3">{pod.cpu}</td>
                     <td className="px-4 py-3">{pod.mem}</td>
                     <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pod.status === 'healthy' ? 'badge-healthy' :
                          pod.status === 'warning' ? 'badge-warning' : 'badge-critical'
                        }`}>
                          {pod.status}
                        </span>
                     </td>
                     <td className="px-4 py-3 text-[#9CA3AF]">{pod.risk}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
        
        <div className="card flex flex-col gap-6">
           <div>
             <h2 className="text-lg font-medium mb-4">Self-Healing Events</h2>
             <div className="space-y-4">
               {healingEvents.slice(0,3).map(event => (
                 <div key={event.id} className="flex justify-between items-center text-sm border-b border-[#1E2344] pb-2 last:border-0">
                   <div className="flex items-center gap-2">
                     <i className="ri-checkbox-circle-fill text-[#10B981]"></i>
                     <span className="text-[#F9FAFB]">{event.action}</span>
                   </div>
                   <span className="text-[#6B7280]">{event.time}</span>
                 </div>
               ))}
             </div>
           </div>
           
           <div>
             <h2 className="text-lg font-medium mb-4">Recent Alerts</h2>
             <div className="space-y-4">
               {recentAlerts.slice(0,3).map(alert => (
                 <div key={alert.id} className="flex flex-col gap-1 text-sm border-b border-[#1E2344] pb-2 last:border-0">
                   <div className="flex justify-between items-start">
                      <span className="text-[#F9FAFB] font-medium">{alert.title}</span>
                      <span className="text-[#6B7280] text-xs">{alert.time}</span>
                   </div>
                   <span className={`text-xs w-max px-1.5 rounded ${
                     alert.severity === 'resolved' ? 'badge-healthy' :
                     alert.severity === 'warning' ? 'badge-warning' : 'badge-info'
                   }`}>
                     {alert.severity}
                   </span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, data }: { title: string, data: any }) {
  const isUp = data.trendUp
  return (
    <div className="card flex flex-col justify-between h-32">
      <h3 className="text-sm font-medium text-[#9CA3AF]">{title}</h3>
      <div className="flex items-end justify-between mt-2">
        <div>
          <span className="text-3xl font-bold">{data.value}</span>
          {data.max && <span className="text-[#6B7280] text-lg">/{data.max}</span>}
          {data.unit && <span className="text-lg ml-1">{data.unit}</span>}
        </div>
        <div className={`flex items-center text-sm font-medium ${isUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
          <i className={isUp ? "ri-arrow-up-line" : "ri-arrow-down-line"}></i>
          <span>{data.trend}</span>
        </div>
      </div>
    </div>
  )
}
