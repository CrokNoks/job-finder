# Job Finder

🚀 **Job search automation tool** with Puppeteer and Firebase Functions

## 🏗️ Architecture

- **Frontend**: Next.js 15 + PWA (mobile-first)
- **Backend**: Firebase Functions 2nd Gen + Puppeteer
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (frontend) + Firebase Hosting

## 📁 Structure

```
job-finder/
├── apps/
│   ├── web/              # Next.js PWA application
│   └── functions/        # Firebase Functions backend
├── packages/
│   ├── shared/          # Types and utilities
│   └── config/          # Shared configuration
└── turbo.json          # Build system
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI
- Supabase CLI

### Installation

```bash
# Clone and install
git clone git@github.com:CrokNoks/job-finder.git
cd job-finder
npm install

# Start services
npm run dev:web          # Frontend
npm run dev:functions     # Backend
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure Firebase and Supabase credentials
3. Run `turbo run build`

## 📖 Features

- **Multi-source search**: LinkedIn, Indeed, Welcome to the Jungle
- **PWA**: Mobile-first with offline support
- **Smart alerts**: Automated job notifications
- **Social login**: Google & GitHub OAuth

## 🛠️ Development

```bash
# Development
turbo run dev

# Build
turbo run build

# Lint & Type-check
turbo run lint
turbo run type-check

# Deploy
npm run deploy:functions
npm run deploy:web
```

## 📄 License

MIT
