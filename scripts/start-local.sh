#!/bin/bash

# A script to start both the Frontend and Backend locally for testing

echo "========================================="
echo " Starting HealOps Portfolio Project"
echo "========================================="

# Start the Node.js Backend in the background
echo "[1/2] Starting Node.js Backend (Port 4000)..."
cd app/backend
npm run dev &
BACKEND_PID=$!
cd ../..

# Wait a second for backend to spin up
sleep 2

# Start the React Frontend in the background
echo "[2/2] Starting React Frontend (Port 5173)..."
cd app/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo "========================================="
echo " Everything is running!"
echo " Frontend: http://localhost:5173"
echo " Backend: http://localhost:4000"
echo "========================================="
echo "Press [CTRL+C] to stop both servers."

# Wait for user to press CTRL+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID; kill $FRONTEND_PID; exit" INT
wait
