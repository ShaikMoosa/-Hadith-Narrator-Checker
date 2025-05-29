# Technical Context

## Core Technologies

### Frontend Stack
- **Next.js 15.1.7**: React framework with App Router
- **React 19.0.0**: Latest React with concurrent features
- **TypeScript 5**: Full type safety across the application
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 12.4.7**: Animation library for smooth interactions

### Backend & Database
- **Supabase**: PostgreSQL database with built-in auth and real-time features
- **NextAuth v5.0.0-beta.25**: Authentication library with OAuth providers
- **@auth/supabase-adapter 1.7.4**: Connects NextAuth with Supabase

### Payment Processing
- **Stripe 17.6.0**: Payment processing and subscription management
- **@stripe/stripe-js 5.6.0**: Client-side Stripe integration

### Email & Communication
- **Nodemailer 6.10.0**: Email sending capability
- **React Email 3.0.7**: Modern email templates with React
- **@react-email/components 0.0.33**: Pre-built email components

### Development Tools
- **Turbopack**: Fast bundler for development (Next.js built-in)
- **pnpm**: Package manager for efficient dependency management
- **ESLint 9**: Code linting and formatting
- **Prettier 3.4.2**: Code formatting

### Analytics & Monitoring
- **@next/third-parties 15.1.7**: Third-party script optimization
- **@openpanel/nextjs 1.0.7**: Privacy-focused analytics

## Environment Configuration

### Required Environment Variables

#### Database Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-secret-key
```

#### Authentication
```env
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_SECRET=your-nextauth-secret  # Generate with: openssl rand -base64 32
```

#### Payment Processing
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Email Configuration
```env
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_FROM=noreply@yourdomain.com
```

#### Analytics (Optional)
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## Development Setup

### Prerequisites
- **Node.js 18+**: Runtime environment
- **pnpm**: Package manager (faster than npm/yarn)
- **Git**: Version control

### Quick Start Commands
```bash
# Install dependencies
pnpm install

# Development server (with Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint

# TypeScript checking
pnpm lint:ts

# Email development (React Email)
pnpm email

# Stripe webhook listening (development)
pnpm stripe:listen
```

### Development Workflow
1. **Local Development**
   - Run `pnpm dev` for fast development with Turbopack
   - Hot reload for instant feedback
   - TypeScript checking in real-time

2. **Database Development**
   - Supabase Studio for database management
   - Local development against hosted Supabase instance
   - Migration scripts for schema changes

3. **Payment Testing**
   - Stripe CLI for webhook testing
   - Test mode credit cards for payment flows
   - Webhook forwarding to localhost

## Architecture Decisions

### Next.js App Router
**Why**: Modern React patterns, better performance, improved SEO
**Benefits**: 
- Server Components reduce client bundle size
- Nested layouts for better UX
- Built-in loading and error states
- Streaming and Suspense support

### Supabase vs Traditional Backend
**Why**: Rapid development without backend complexity
**Benefits**:
- Built-in authentication and authorization
- Real-time subscriptions out of the box
- PostgreSQL with modern features
- Row Level Security for data isolation

### NextAuth v5 Beta
**Why**: Most mature auth solution for Next.js
**Considerations**: 
- Beta version but stable for production
- Excellent OAuth provider support
- Seamless integration with Supabase
- Built-in CSRF protection

### TypeScript Everywhere
**Why**: Catch errors at compile time, better developer experience
**Implementation**:
- Strict TypeScript configuration
- Generated types from Supabase schema
- Type-safe API routes and server actions
- Component prop validation

### Tailwind CSS + Custom Components
**Why**: Rapid styling without CSS bloat
**Strategy**:
- Utility-first approach for consistency
- Custom component library for reusability
- CSS variables for theme customization
- Mobile-first responsive design

## Performance Considerations

### Bundle Optimization
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Automatic route-based splitting
- **Dynamic Imports**: Lazy loading for large components
- **Image Optimization**: Next.js built-in image optimization

### Runtime Performance
- **Server Components**: Reduce client-side JavaScript
- **Static Generation**: Pre-rendered pages where possible
- **Database Optimization**: Efficient queries and indexing
- **CDN Ready**: Static assets optimized for CDN delivery

### Core Web Vitals
- **LCP**: Optimized with image optimization and SSR
- **FID**: Minimal client-side JavaScript
- **CLS**: Stable layouts with proper sizing

## Security Implementation

### Authentication Security
- **OAuth Flow**: Secure third-party authentication
- **Session Management**: HTTP-only cookies
- **CSRF Protection**: Built-in token validation
- **Route Protection**: Middleware-based access control

### Data Security
- **Row Level Security**: Database-level access control
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **Environment Variables**: Secure credential management

### API Security
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Proper cross-origin settings
- **Webhook Verification**: Stripe signature validation
- **Error Handling**: No sensitive data in error messages

## Testing Strategy

### Current Testing Setup
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality and consistency
- **Manual Testing**: Key user flows verification

### Recommended Testing Additions
- **Jest + Testing Library**: Unit and integration tests
- **Playwright**: End-to-end testing
- **Stripe Test Mode**: Payment flow testing
- **Supabase Testing**: Database operation testing

## Deployment Architecture

### Recommended Platforms
1. **Vercel** (Primary recommendation)
   - Zero-config Next.js deployment
   - Automatic SSL certificates
   - Global CDN
   - Serverless functions
   - Preview deployments

2. **Netlify** (Alternative)
   - JAMstack optimized
   - Build plugins ecosystem
   - Branch previews

### Database Hosting
- **Supabase Cloud** (Recommended)
  - Managed PostgreSQL
  - Built-in auth and storage
  - Real-time capabilities
  - Automatic backups

### CI/CD Pipeline
```yaml
# Typical flow
Git Push → Build → Test → Deploy → Verify
```

**Features**:
- Automatic deployments on push
- Preview deployments for pull requests
- Environment-specific configurations
- Health checks and rollback capabilities

## Scalability Plan

### Immediate Scaling (0-1000 users)
- Current architecture sufficient
- Supabase free tier adequate
- Vercel hobby plan suitable

### Growth Scaling (1000-10000 users)
- Supabase Pro plan for better performance
- Vercel Pro for advanced features
- Database query optimization
- CDN optimization for static assets

### Enterprise Scaling (10000+ users)
- Supabase Team/Enterprise plans
- Advanced caching strategies
- Database read replicas
- Microservices consideration for specific features

## Monitoring & Observability

### Application Monitoring
- **Google Analytics**: User behavior tracking
- **OpenPanel**: Privacy-focused analytics alternative
- **Vercel Analytics**: Core Web Vitals monitoring

### Error Tracking (Ready for integration)
- **Sentry**: Error and performance monitoring
- **LogRocket**: Session replay for debugging
- **Datadog**: Application performance monitoring

### Database Monitoring
- **Supabase Dashboard**: Built-in query performance
- **Connection pooling**: Optimized database connections
- **Query optimization**: Regular performance reviews

## Migration & Upgrade Paths

### Technology Upgrades
- **Next.js**: Regular minor version updates
- **React**: Following stable releases
- **Dependencies**: Monthly security updates
- **Node.js**: LTS version alignment

### Feature Migration
- **Database Schema**: Supabase migration system
- **API Changes**: Versioned API endpoints
- **Component Updates**: Gradual UI improvements
- **Authentication**: Provider additions without disruption 