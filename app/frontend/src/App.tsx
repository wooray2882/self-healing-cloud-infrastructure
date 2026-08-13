import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import OverviewPage from './pages/OverviewPage'
import NodesPage from './pages/NodesPage'
import PodsPage from './pages/PodsPage'
import MetricsPage from './pages/MetricsPage'
import AlertsPage from './pages/AlertsPage'
import SelfHealingPage from './pages/SelfHealingPage'
import ChaosPage from './pages/ChaosPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/nodes" element={<NodesPage />} />
        <Route path="/pods" element={<PodsPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/self-healing" element={<SelfHealingPage />} />
        <Route path="/chaos" element={<ChaosPage />} />
      </Routes>
    </Layout>
  )
}

export default App
