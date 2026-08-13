import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// Health check endpoint for Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Future routing will go here (e.g., K8s API proxy, Bedrock Agent integration)

app.listen(PORT, () => {
  console.log(`HealOps Backend API is running on port ${PORT}`)
})
