# How to Run TranquilMind Locally

## Problem

If you're seeing a different website (like "Calmora") when accessing localhost, it means another application is using the default port.

## Solution

Use a specific port (3000) for your TranquilMind project.

## Quick Start Options

### Option 1: Using npm serve (Recommended)

```bash
npm start
```

Then open: **http://localhost:3000**

### Option 2: Using live-server (Auto-refresh)

```bash
npm run dev
```

Then open: **http://localhost:3000**

### Option 3: Windows Batch File

Double-click `start-server.bat`

### Option 4: PowerShell Script

Right-click `start-server.ps1` → Run with PowerShell

## Important URLs

- **Home Page:** http://localhost:3000/index.html
- **Mood Tracker:** http://localhost:3000/mood.html
- **Chat:** http://localhost:3000/chat.html
- **Journal:** http://localhost:3000/journal.html
- **Resources:** http://localhost:3000/resources.html
- **Helpline:** http://localhost:3000/helpline.html

## Troubleshooting

### Port 3000 is already in use?

Change the port in `package.json` to another number (e.g., 3002, 9000, 4000)

### Still seeing the wrong site?

1. Clear your browser cache
2. Use an incognito/private window
3. Try a different browser
4. Make sure you're accessing the correct port (3000)

### npm not working?

Make sure Node.js is installed from https://nodejs.org/
Then run: `npm install -g serve` (optional, npx will use it automatically)
