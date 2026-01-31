#!/bin/bash

# Bondarys Development Environment Starter
# Runs Backend, Admin, and Mobile (Web) concurrently

# Cleanup function to kill all spawned processes on exit
cleanup() {
    echo -e "\n\033[1;31mShutting down all services...\033[0m"
    # Port-based cleanup as a safety net
    fuser -k 3000/tcp 2>/dev/null
    fuser -k 3001/tcp 2>/dev/null
    fuser -k 8081/tcp 2>/dev/null
    # Kill background jobs
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM EXIT

echo -e "\033[1;34m--- Bondarys Full Stack Developer Console ---\033[0m"

# 1. Start Backend
echo -e "\033[1;32m[1/3] Launching Backend Server...\033[0m"
(cd backend && npm run dev) &

# 2. Start Admin Dashboard
echo -e "\033[1;32m[2/3] Launching Admin Dashboard (Port 3001)...\033[0m"
(cd admin && npm run dev) &

# 3. Start Mobile Web
echo -e "\033[1;32m[3/3] Launching Mobile Web (Expo)...\033[0m"
(cd mobile && npm run web) &

echo -e "\033[1;36m--- Services are initializing ---\033[0m"
echo -e "Backend: http://localhost:3000"
echo -e "Admin:   http://localhost:3001"
echo -e "Mobile:  http://localhost:8081"
echo -e "\n\033[1;33mPress Ctrl+C to stop all services.\033[0m\n"

# Keep script alive
wait
