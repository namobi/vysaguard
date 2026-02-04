# VysaGuard

> Your trusted guide for visa applications

VysaGuard is a comprehensive visa application management platform that connects visa applicants with verified immigration professionals. The platform provides intelligent checklists, document management, and a marketplace for immigration services.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Design Decisions](#design-decisions)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

### For Visa Applicants
- **Smart Checklists**: Dynamic document checklists based on destination country and visa type
- **Document Upload & Management**: Secure file uploads with progress tracking
- **Version Sync**: Automatic notifications when visa requirements are updated
- **Provider Marketplace**: Find and connect with verified immigration professionals
- **Playbooks**: Country-specific visa guides with step-by-step instructions
- **Real-time Notifications**: Stay updated on checklist changes and provider responses

### For Immigration Providers
- **Provider Dashboard**: Manage service areas, credentials, and client requests
- **Onboarding Flow**: Streamlined registration with credential verification
- **Assistance Requests**: Receive and respond to applicant inquiries
- **Reviews System**: Build reputation through verified client reviews

### Platform Features
- **Mobile Responsive**: Fully responsive design optimized for all screen sizes
- **AI Integration**: Google GenAI-powered assistance for visa questions
- **Row-Level Security**: Supabase RLS for secure multi-tenant data access

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.5.7 (App Router) |
| **Language** | TypeScript 5.x |
| **Styling** | Tailwind CSS 4.x |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma 7.3.0 |
| **Authentication** | Supabase Auth |
| **File Storage** | Supabase Storage |
| **AI** | Google GenAI |
| **Icons** | Lucide React |
| **Runtime** | Node.js 20.x |

---

## Project Structure

```
apps/web/
├── app/                          # Next.js App Router
│   ├── api/                      # API Route Handlers
│   │   ├── ai/ask/               # AI assistance endpoint
│   │   ├── assistance-requests/  # Provider assistance API
│   │   ├── checklist/sync/       # Checklist sync endpoint
│   │   ├── notifications/        # Notifications API
│   │   ├── providers/            # Provider registration & listing
│   │   └── reviews/              # Provider reviews API
│   │
│   ├── checklist/                # Checklist management pages
│   │   ├── components/           # Route-specific components
│   │   ├── ChecklistClient.tsx   # Client-side checklist logic
│   │   └── page.tsx
│   │
│   ├── dashboard/                # Applicant dashboard
│   ├── find/                     # Provider search
│   ├── login/                    # Authentication
│   ├── notifications/            # User notifications
│   ├── playbook/                 # Visa guides
│   │   ├── [country]/[visa]/     # Dynamic playbook routes
│   │   └── components/           # Playbook-specific components
│   │
│   ├── provider/                 # Provider portal
│   │   ├── dashboard/            # Provider dashboard
│   │   └── onboarding/           # Provider registration
│   │
│   ├── providers/                # Provider listing & profiles
│   │   └── [id]/                 # Individual provider pages
│   │
│   ├── signup/                   # User registration
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # Shared React components
│   ├── features/                 # Feature-specific components
│   │   ├── AgencyDashboard.tsx
│   │   ├── ApplicantDashboard.tsx
│   │   ├── Audience.tsx
│   │   ├── Destinations.tsx
│   │   ├── FinalCTA.tsx
│   │   ├── Hero.tsx
│   │   ├── Marketplace.tsx
│   │   ├── Problem.tsx
│   │   ├── Professionals.tsx
│   │   ├── Solution.tsx
│   │   └── Trust.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── DashboardLayout.tsx   # Responsive sidebar layout
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   │
│   └── ui/                       # Reusable UI components
│       ├── Button.tsx
│       └── NotificationBell.tsx
│
├── hooks/                        # Custom React hooks (empty, ready for use)
│
├── lib/                          # Utilities and configurations
│   ├── generated/prisma/         # Prisma generated client
│   ├── constants.ts              # App-wide constants
│   ├── prisma.ts                 # Prisma client instance
│   ├── providerUtils.ts          # Provider helper functions
│   ├── supabase.ts               # Supabase client (browser)
│   ├── supabaseServer.ts         # Supabase client (server)
│   └── utils.ts                  # General utility functions
│
├── prisma/
│   └── schema.prisma             # Database schema
│
├── scripts/
│   └── populate-profiles.ts      # Database seeding script
│
├── types/                        # TypeScript type definitions
│   ├── api.ts                    # API request/response types
│   ├── database.ts               # Database entity types
│   └── index.ts                  # Barrel export
│
├── misc/                         # Legacy/reference files (excluded from build)
│
├── .env.example                  # Environment template
├── .vscode/settings.json         # VS Code configuration
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- PostgreSQL database (or Supabase project)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/vysaguard.git
   cd vysaguard/apps/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials (see [Environment Variables](#environment-variables))

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes Prisma generate) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Configuration (Prisma)
DATABASE_URL=postgresql://user:password@host:port/database

# Optional
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |

---

## Database Schema

The database uses PostgreSQL with two schemas:

### `auth` Schema (Supabase Auth)
Managed by Supabase for authentication:
- `users` - User accounts
- `sessions` - Active sessions
- `identities` - OAuth identities
- `mfa_factors` - Multi-factor authentication

### `public` Schema (Application Data)

#### Core Entities

| Table | Description |
|-------|-------------|
| `profiles` | User profile information |
| `countries` | Supported destination countries |
| `visa_types` | Available visa categories |
| `regions` | Geographic regions |

#### Checklists

| Table | Description |
|-------|-------------|
| `checklists` | User visa checklists |
| `checklist_items` | Individual checklist requirements |
| `checklist_uploads` | Uploaded documents |
| `requirement_templates` | Master templates for checklists |
| `requirement_template_items` | Template requirement items |

#### Providers

| Table | Description |
|-------|-------------|
| `providers` | Immigration service providers |
| `provider_credentials` | Provider certifications |
| `provider_service_areas` | Countries/visas providers handle |
| `provider_reviews` | Client reviews |
| `assistance_requests` | Provider-applicant communication |

#### Playbooks

| Table | Description |
|-------|-------------|
| `playbook_sections` | Visa guide content sections |
| `playbook_meta` | Processing times, costs, etc. |
| `playbook_assets` | Downloadable resources |

#### System

| Table | Description |
|-------|-------------|
| `notifications` | User notifications |
| `activity_log` | User activity tracking |

### Row-Level Security (RLS)

All tables in the `public` schema use Supabase RLS policies:
- Users can only access their own data
- Providers can view applicant requests assigned to them
- Public data (countries, visa types, templates) is readable by all authenticated users

---

## API Routes

### AI Assistance
- `POST /api/ai/ask` - Get AI-powered visa guidance

### Assistance Requests
- `GET /api/assistance-requests` - List user's requests
- `POST /api/assistance-requests` - Create new request
- `POST /api/assistance-requests/[id]/respond` - Provider response

### Checklist
- `POST /api/checklist/sync` - Sync checklist with latest template

### Notifications
- `GET /api/notifications` - Fetch user notifications

### Providers
- `GET /api/providers/list` - List approved providers
- `POST /api/providers/register` - Register as provider

### Reviews
- `GET /api/reviews` - Get provider reviews
- `POST /api/reviews` - Submit a review

---

## Design Decisions

### 1. Next.js 15 App Router

**Decision**: Use App Router with root-level `app/` directory instead of `src/app/`.

**Rationale**:
- Simpler import paths (`@/components/` vs `@/src/components/`)
- Standard Next.js 15 convention
- Better compatibility with existing tooling

### 2. Component Organization

**Decision**: Three-tier component structure: `ui/`, `layout/`, `features/`.

**Rationale**:
- `ui/` - Atomic, reusable components (Button, Input, Modal)
- `layout/` - Page structure components (Navbar, Footer, DashboardLayout)
- `features/` - Business-logic components (ApplicantDashboard, Marketplace)

### 3. Route-Specific Components Colocated

**Decision**: Keep route-specific components in route folders (e.g., `app/checklist/components/`).

**Rationale**:
- Clear ownership and discoverability
- Prevents shared components folder from bloating
- Easier to understand component scope

### 4. Centralized Type Definitions

**Decision**: Create `types/` folder with barrel exports.

**Rationale**:
- Single source of truth for TypeScript interfaces
- Prevents duplicate type definitions
- Easy imports via `@/types`

### 5. Mobile-First Responsive Design

**Decision**: Implement responsive design using Tailwind CSS breakpoints.

**Rationale**:
- 375px (mobile), 768px (tablet), 1024px+ (desktop)
- Sidebar collapses to hamburger menu on mobile
- Tables become scrollable on small screens
- Minimum touch targets of 44px (h-10/py-3)

### 6. Supabase + Prisma Hybrid

**Decision**: Use Supabase for auth/realtime, Prisma for type-safe queries.

**Rationale**:
- Supabase provides managed auth, storage, and realtime
- Prisma provides type-safe database queries
- RLS policies handle authorization at database level

### 7. Utility File Naming

**Decision**: Rename `supabaseClient.ts` to `supabase.ts`.

**Rationale**:
- Cleaner, more concise naming
- Consistent with `supabaseServer.ts` pattern
- Easier to type in imports

---

## Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Select the `apps/web` directory as the root

2. **Configure Environment Variables**
   Add all environment variables from `.env.example` to Vercel project settings

3. **Build Settings**
   ```
   Build Command: prisma generate && next build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   Push to main branch to trigger automatic deployment

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

### Docker (Optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### Supabase Setup

1. Create a new Supabase project
2. Run the schema migrations (from `prisma/schema.prisma`)
3. Enable Row-Level Security on all tables
4. Configure Storage buckets for document uploads
5. Set up authentication providers as needed

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [app/layout.tsx](app/layout.tsx) | Root layout with global providers |
| [app/page.tsx](app/page.tsx) | Landing page |
| [components/layout/DashboardLayout.tsx](components/layout/DashboardLayout.tsx) | Responsive dashboard shell |
| [components/features/ApplicantDashboard.tsx](components/features/ApplicantDashboard.tsx) | Main applicant interface |
| [lib/supabase.ts](lib/supabase.ts) | Browser Supabase client |
| [lib/supabaseServer.ts](lib/supabaseServer.ts) | Server Supabase client |
| [lib/constants.ts](lib/constants.ts) | Application constants |
| [types/database.ts](types/database.ts) | Database type definitions |
| [prisma/schema.prisma](prisma/schema.prisma) | Database schema |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow existing Tailwind CSS patterns for styling
- Use absolute imports with `@/` prefix
- Run `npm run lint` before committing

---

## License

Private - All rights reserved

---

## Support

For issues and feature requests, please use the GitHub Issues tab.
