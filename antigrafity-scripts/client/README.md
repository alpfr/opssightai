# Sermon Slicer - Frontend Client

This is the frontend client for the Sermon Slicer application, built with React, Vite, and TailwindCSS.

## Tech Stack

- **React 19** - UI library with modern hooks
- **Vite 7** - Ultra-fast build tool with HMR (Hot Module Replacement)
- **TailwindCSS 4** - Modern utility-first CSS framework
- **Lucide React** - Elegant icon library

## Development

Run the development server:

```bash
npm run dev
```

The client will start at `http://localhost:7002` with hot reload enabled.

## Features

- **File Upload**: Drag-and-drop audio file upload interface
- **Real-time Status**: Visual feedback during transcription and content generation
- **Editable Content**: All generated content (transcription, summary, tweets, questions) is editable in real-time
- **Word Export**: Triggers server-side generation of optimized `.docx` files
- **API Proxy**: Vite proxy configuration forwards API requests to the backend (Port 7001)

## API Endpoints (Proxied)

The frontend communicates with the backend via these primary endpoints:

- `POST /upload` - Upload audio file for transcription and AI processing
- `POST /download-docx` - Request a generated Word document containing all assets
- `GET /health` - System health check

All requests are proxied through the Vite dev server to the backend at `http://localhost:7001`.

## Configuration

Edit `vite.config.js` to change:
- Backend proxy URL
- Port number (default: 7002)
- Build settings

Edit `client/package.json` to change:
- Dev server port: `"dev": "vite --port 7002"`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory, which is served by the Express backend when `NODE_ENV=production`.
