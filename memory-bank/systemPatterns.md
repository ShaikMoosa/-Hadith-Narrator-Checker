# System Patterns & Architecture

## Overall Architecture

### Tech Stack Foundation
```
Frontend: Next.js 15 + React 19 + TypeScript
Styling: Tailwind CSS + Custom Component System
Backend: Next.js API Routes + Server Actions
Database: Supabase (PostgreSQL)
Auth: NextAuth v5 + Supabase Adapter
Payments: Stripe + Webhooks
Email: Nodemailer + React Email
Analytics: Google Analytics + OpenPanel
Development: Turbopack + pnpm
```

### Application Structure Pattern
```
next-saas-starter/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (landing, pricing)
│   ├── app/               # Protected app routes
│   ├── api/               # API endpoints
│   └── actions/           # Server actions
├── components/            # UI components
│   ├── ui/               # Base UI components
│   ├── app/              # Feature-specific components
│   └── [feature]/        # Grouped by feature
├── lib/                  # Utility libraries
├── types/                # TypeScript definitions
└── utils/                # Helper functions
```

## Core Design Patterns

### 1. Configuration-Driven Development
**Pattern**: Centralized configuration in `config.ts`
- **Purpose**: Easy customization without code changes
- **Implementation**: Single source of truth for branding, pricing, features
- **Benefits**: Non-technical users can modify settings

```typescript
// config.ts pattern
const config = {
  metadata: { /* SEO and branding */ },
  stripe: { /* pricing tiers */ },
  theme: { /* colors and styling */ },
  socialLinks: { /* external links */ }
}
```

### 2. Feature-Based Component Organization
**Pattern**: Components grouped by domain/feature
- **Purpose**: Maintainable, scalable component structure
- **Implementation**: `/components/app/[feature]/` structure
- **Benefits**: Clear ownership, easy to find related code

```
components/
├── app/
│   ├── billing/          # Subscription management
│   ├── notes/            # Notes feature
│   └── profile/          # User profile
├── ui/                   # Reusable UI primitives
└── [shared]/             # Cross-cutting components
```

### 3. Full-Stack Type Safety
**Pattern**: End-to-end TypeScript with Supabase types
- **Purpose**: Catch errors at compile time
- **Implementation**: Generated types from database schema
- **Benefits**: Reduced runtime errors, better DX

### 4. Server-First Architecture
**Pattern**: Leverage Next.js Server Components and Actions
- **Purpose**: Optimal performance and SEO
- **Implementation**: Database queries in Server Components, mutations via Server Actions
- **Benefits**: Reduced client bundle, better Core Web Vitals

## Authentication Architecture

### NextAuth v5 + Supabase Pattern
```
User Login → NextAuth → Supabase Adapter → PostgreSQL
                ↓
            JWT Token → Middleware → Protected Routes
```

**Key Components**:
- `middleware.ts`: Route protection and session validation
- `app/api/auth/[...nextauth]/route.ts`: NextAuth configuration
- Supabase Adapter: Sync sessions with database

**Security Features**:
- CSRF protection built-in
- Secure cookie handling
- Session rotation
- OAuth state validation

## Payment Processing Architecture

### Stripe Integration Pattern
```
Frontend → Stripe Checkout → Webhook → Database Update
    ↓
Customer Portal ← Subscription Status ← Stripe Dashboard
```

**Key Components**:
- `CheckoutButton.tsx`: Stripe Checkout integration
- `app/api/webhook/stripe/route.ts`: Webhook handler
- Customer Portal: Self-service billing

**Webhook Events Handled**:
- `checkout.session.completed`: New subscriptions
- `customer.subscription.updated`: Plan changes
- `customer.subscription.deleted`: Cancellations

## Database Patterns

### Supabase Schema Strategy
```sql
-- Core tables
users              # NextAuth user data
accounts            # OAuth provider data
sessions            # Active sessions
notes              # Application data
```

**Row Level Security (RLS)**:
- Enabled on all user data tables
- Policies based on authenticated user ID
- Automatic data isolation

**Type Generation**:
- `supabase gen types typescript` for type safety
- Regular regeneration as schema evolves

## UI Component Architecture

### Design System Pattern
**Base Layer**: Tailwind CSS utility classes
**Component Layer**: Reusable UI primitives (Button, Input, Card)
**Feature Layer**: Business logic components
**Page Layer**: Route-specific compositions

**Styling Strategy**:
- Utility-first with Tailwind
- Custom CSS variables for theme consistency
- Component variants using `class-variance-authority`
- Responsive design mobile-first

## API Design Patterns

### RESTful Endpoints
```
GET    /api/profile        # User profile data
PUT    /api/profile        # Update profile
POST   /api/checkout       # Create Stripe session
POST   /api/webhook/stripe # Handle Stripe events
```

### Server Actions for Mutations
```typescript
// Form submissions and data mutations
async function updateProfile(data: FormData) {
  'use server'
  // Validation and database update
}
```

## Error Handling Patterns

### Client-Side Error Handling
- React Error Boundaries for component errors
- Toast notifications for user feedback
- Graceful degradation for network issues

### Server-Side Error Handling
- Try-catch blocks in all API routes
- Structured error responses
- Logging for debugging

### Development vs Production
- Detailed errors in development
- Generic messages in production
- Error tracking integration ready

## Performance Patterns

### Next.js Optimizations
- Server Components by default
- Dynamic imports for code splitting
- Image optimization with `next/image`
- Font optimization with `next/font`

### Database Optimizations
- Supabase connection pooling
- Proper indexing on query columns
- RLS policies optimized for performance

### Bundle Optimization
- Tree shaking enabled
- Dynamic imports for large dependencies
- Minimal client-side JavaScript

## Security Patterns

### Authentication Security
- NextAuth handles OAuth flows
- Secure session management
- CSRF protection enabled
- HTTP-only cookies

### API Security
- Authentication middleware on protected routes
- Input validation on all endpoints
- Rate limiting considerations
- Environment variable security

### Database Security
- Row Level Security (RLS) enabled
- Parameterized queries prevent SQL injection
- Service role keys secured
- Connection encryption

## Deployment Patterns

### Environment Strategy
```
Development: Local with .env.local
Staging: Vercel Preview with branch deploys
Production: Vercel Production with environment variables
```

### CI/CD Pattern
- GitHub integration with Vercel
- Automatic deployments on push
- Preview deployments for PRs
- Environment-specific configurations

### Monitoring & Analytics
- Google Analytics for user behavior
- OpenPanel for privacy-focused analytics
- Error tracking integration points
- Performance monitoring hooks

## Scalability Considerations

### Horizontal Scaling
- Stateless server architecture
- Database connection pooling
- CDN for static assets
- Serverless function deployment

### Vertical Scaling
- Supabase auto-scaling database
- Optimized queries and indexing
- Efficient component rendering
- Memory usage optimization

### Future-Proofing
- Modular architecture allows feature addition
- Type-safe refactoring capabilities
- Clear separation of concerns
- Plugin-ready architecture 