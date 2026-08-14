import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { NotificationProvider } from './context/NotificationContext'
import OverviewPage from './pages/OverviewPage'
import NodesPage from './pages/NodesPage'
import PodsPage from './pages/PodsPage'
import MetricsPage from './pages/MetricsPage'
import IncidentsPage from './pages/IncidentsPage'
import SelfHealingPage from './pages/SelfHealingPage'
import ChaosPage from './pages/ChaosPage'
import CICDPage from './pages/CICDPage'
import SecurityPage from './pages/SecurityPage'

function App() {
  return (
    <NotificationProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/nodes" element={<NodesPage />} />
          <Route path="/pods" element={<PodsPage />} />
          <Route path="/metrics" element={<MetricsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/alerts" element={<Navigate to="/incidents" replace />} />
          <Route path="/self-healing" element={<SelfHealingPage />} />
          <Route path="/chaos" element={<ChaosPage />} />
          <Route path="/cicd" element={<CICDPage />} />
          <Route path="/security" element={<SecurityPage />} />
        </Routes>
      </Layout>
    </NotificationProvider>
  )
}

export default App
