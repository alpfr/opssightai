# AI Compliance Platform - Management Guide

## 🚀 Quick Start

Your AI Compliance Platform is now running continuously! Here are the essential commands:

### Current Status
- **Frontend**: http://localhost:3001 ✅ RUNNING
- **Backend**: http://localhost:8000 ✅ RUNNING  
- **Login**: admin/admin123

## 📋 Management Scripts

### 1. Interactive Manager (Recommended)
```bash
./platform-manager.sh
```
- Interactive menu with all management options
- Real-time status display
- One-click service management

### 2. Keep-Alive Script
```bash
./keep-alive.sh [command]
```

**Commands:**
- `start` - Start both services
- `stop` - Stop both services  
- `restart` - Restart both services
- `status` - Show current status
- `monitor` - Keep services running continuously
- `logs` - Show recent logs

### 3. Health Check
```bash
./health-check.sh
```
Quick health check for both services

### 4. System Service Setup
```bash
./setup-system-service.sh
```
Configure auto-start on system boot

## 🔄 Continuous Operation

### Option 1: Manual Monitoring
```bash
./keep-alive.sh monitor
```
- Monitors services every 30 seconds
- Automatically restarts failed services
- Press Ctrl+C to stop

### Option 2: System Service (Auto-start)
```bash
./setup-system-service.sh
```
- Starts automatically on login
- Runs in background
- Survives system restarts

## 📊 Service Management

### Start Services
```bash
./keep-alive.sh start
```

### Stop Services  
```bash
./keep-alive.sh stop
```

### Check Status
```bash
./keep-alive.sh status
```

### View Logs
```bash
./keep-alive.sh logs
```

## 🔧 Troubleshooting

### Services Won't Start
1. Check if ports are available:
   ```bash
   lsof -i :8000  # Backend
   lsof -i :3001  # Frontend
   ```

2. Check logs:
   ```bash
   ./keep-alive.sh logs
   ```

3. Restart services:
   ```bash
   ./keep-alive.sh restart
   ```

### System Service Issues
```bash
# Check service status
launchctl list | grep ai-compliance

# Restart system service
launchctl stop com.ai-compliance-platform
launchctl start com.ai-compliance-platform

# Remove system service
launchctl unload ~/Library/LaunchAgents/com.ai-compliance-platform.plist
```

## 📁 Log Files

- `keep-alive.log` - Keep-alive script logs
- `backend.log` - Backend service logs
- `frontend.log` - Frontend service logs
- `system.log` - System service logs
- `system.error.log` - System service errors

## 🌐 Access URLs

- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **Login Credentials**: admin/admin123

## 🎯 Features Available

### Executive Dashboard
1. Go to http://localhost:3001
2. Login with admin/admin123
3. Click "Dashboard"
4. Toggle between "Standard" and "Executive" views

### LLM Assessment
1. Go to http://localhost:3001
2. Login with admin/admin123
3. Click "Guardrails"
4. Click "Test LLM & Content" button
5. Select AI model and test content

## 🔒 Security Notes

- Default credentials: admin/admin123
- Services run on localhost only
- No external network access by default
- Change default credentials in production

## 📈 Performance

- Backend: FastAPI with SQLite
- Frontend: React development server
- Memory usage: ~200MB total
- CPU usage: Low when idle

## 🆘 Emergency Commands

### Kill All Services
```bash
pkill -f "python main.py"
pkill -f "npm start"
pkill -f "react-scripts start"
```

### Reset Everything
```bash
./keep-alive.sh stop
sleep 5
./keep-alive.sh start
```

### Check What's Running
```bash
ps aux | grep -E "(python|node|npm)" | grep -v grep
```

## 📞 Support

If you encounter issues:
1. Run `./health-check.sh` to diagnose
2. Check logs with `./keep-alive.sh logs`
3. Try restarting with `./keep-alive.sh restart`
4. Use the interactive manager: `./platform-manager.sh`

---

**Your AI Compliance Platform is now running continuously and ready for use!** 🎉