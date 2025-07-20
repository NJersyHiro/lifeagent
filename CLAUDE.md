# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LifeAgent is a Next.js 15 full-stack application that serves as a personal productivity assistant. It uses natural language processing to automatically create calendar events and todos, monitors Gmail for automatic replies, manages expenses with OCR receipt scanning, and integrates with Google services.

## Development Commands

```bash
# Install dependencies
npm install

# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Database operations
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes to database
npx prisma migrate dev  # Create and apply migrations
npx prisma studio       # Open Prisma Studio GUI
```

## Architecture & Key Components

### API Routes Structure (`/app/api`)
- **Authentication** (`/auth`): NextAuth.js with Google OAuth, includes token refresh mechanism
- **Calendar** (`/calendar`): Google Calendar integration for event creation
- **Email Management** (`/emails`): Fetch, send, and manage email drafts
- **Gmail** (`/gmail`): Automated email monitoring and AI-powered reply generation
- **Expense** (`/expense`): CRUD operations with CSV export functionality
- **OCR** (`/ocr`): Receipt parsing using Google Cloud Vision API
- **Parse** (`/parse`): Natural language parsing to extract events/todos using OpenAI
- **Todo** (`/todo`): Todo management with database persistence

### Core Features Implementation
1. **Natural Language Processing**: Uses OpenAI API to parse text into structured events/todos
2. **Gmail Integration**: Automated monitoring (via Vercel cron) and AI-generated replies
3. **Authentication**: Extended NextAuth session to include Google access tokens for API calls
4. **Database**: SQLite with Prisma ORM, models for Todo, Expense, Email, ReplyDraft
5. **PWA Support**: Service worker for offline functionality

### Environment Variables Required
Create `.env.local` with:
```
OPENAI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
DATABASE_URL="file:./dev.db"
```

### Important Technical Details
- **TypeScript**: Strict mode enabled, use type-safe patterns
- **Authentication Flow**: Access tokens are stored in session for Google API calls
- **Token Refresh**: Automatic refresh implemented for expired Google tokens
- **File Uploads**: Multer middleware used for receipt image uploads
- **Cron Jobs**: Vercel cron configured for hourly Gmail fetching

### Common Development Tasks
- When modifying Google API scopes, users must re-authenticate
- Database schema changes require running `npx prisma generate` and `npx prisma db push`
- Gmail authentication errors can be fixed by following README_AUTH_FIX.md guide
- Always check for existing components/patterns before creating new ones

### Testing
Currently no testing framework is configured. When implementing tests, consider adding Jest or Vitest first.