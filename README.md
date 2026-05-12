# Lumina

Premium local media explorer and organizer built with Electron + React.

Browse, organize, and explore your local photo and video library with a cinematic, dark-mode UI.

## Features

- **Virtualized Media Grid** — Smoothly renders thousands of images & videos without lag (react-virtuoso)
- **Video Thumbnails** — Auto-generated via Canvas API or FFmpeg
- **Folder Scanning** — Recursively index any folder on your machine
- **Persistent Settings** — Remembers your preferences between sessions via electron-store
- **Premium UI** — Glassmorphism, Framer Motion animations, cinematic dark theme

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Shell | Electron |
| UI Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| State Management | Zustand |
| Video Processing | fluent-ffmpeg + ffmpeg-static |
| Icons | Lucide React |
| Virtualization | react-virtuoso |
| Packaging | electron-builder |

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Install & Run

```bash
npm install
npm run dev
```

Starts Vite dev server and Electron concurrently. Hot-reloads on source changes.

### Build

```bash
npm run build
```

Outputs a packaged installer to `dist-electron/`.

## Project Structure

```
lumina/
├── electron/          # Main process (Node.js / Electron)
│   ├── main.js       # App entry, window creation, IPC handlers
│   ├── preload.js    # Context bridge (safe APIs for renderer)
│   ├── scanner.js    # Recursive media folder scanner
│   ├── thumbnails.js # FFmpeg thumbnail generation
│   └── fileServer.js # Local HTTP server for media assets
├── src/              # Renderer process (React)
│   ├── components/   # Reusable UI components
│   ├── pages/        # Top-level page views
│   ├── store/        # Zustand global state
│   ├── utils/        # Helper utilities
│   ├── App.jsx       # Root component & routing
│   ├── main.jsx      # React entry point
│   └── index.css     # Global styles & design tokens
├── index.html        # Vite HTML template
├── vite.config.js    # Vite configuration
├── tailwind.config.js# Tailwind CSS configuration
└── package.json
```
