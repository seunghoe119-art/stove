# 캠핑난로 (Camping Heater Rental Service)

## Overview

A Korean camping heater rental service web application. Users can browse heater options, learn usage instructions, and submit rental applications through a single-page application with smooth scroll navigation. The service emphasizes warmth, trust, and simplicity with a mobile-first design approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with custom warm color palette (beige/brown theme)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful JSON API
- **Development**: tsx for TypeScript execution without compilation
- **Production Build**: esbuild for server bundling, Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: drizzle-zod for automatic Zod schema generation
- **Current Storage**: In-memory storage (MemStorage class) as default implementation
- **Database Ready**: Schema defined for PostgreSQL migration when DATABASE_URL is provided

### Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Shared Types**: Common schema definitions in `/shared` directory used by both frontend and backend
- **API Client**: Centralized fetch wrapper with error handling in queryClient.ts
- **Mobile-First**: Responsive design starting from 375px viewport

### Directory Structure
```
client/           # React frontend application
  src/
    components/ui/  # shadcn/ui components
    pages/          # Page components
    hooks/          # Custom React hooks
    lib/            # Utilities and API client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Data access layer
  static.ts       # Production static file serving
  vite.ts         # Development HMR setup
shared/           # Shared types and schemas
  schema.ts       # Drizzle schema + Zod validation
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle Kit**: Database migrations via `npm run db:push`

### UI/UX Libraries
- **Radix UI**: Accessible component primitives (dialog, select, toast, etc.)
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel functionality
- **Vaul**: Drawer component

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner for Replit environment
- **PostCSS/Autoprefixer**: CSS processing pipeline

### Fonts
- **Noto Sans KR**: Korean-optimized font loaded from Google Fonts