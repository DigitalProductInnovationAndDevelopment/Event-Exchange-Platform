# Event Exchange Platform Frontend

## Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── routes/        # Route configurations
│   ├── services/      # API services
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── index.html         # HTML template
```

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Common Issues
- If you get node version errors, use: `nvm use 18`
- If port 5173 is in use, run: `npm run dev -- --port 3000`
- If you have dependency issues, try: `rm -rf node_modules && npm install`
