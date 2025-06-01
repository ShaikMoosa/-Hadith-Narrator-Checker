# 🚀 Hadith Narrator Checker - Deployment Guide

## 🎯 Overview

This guide covers the complete deployment setup for the **Hadith Narrator Checker** using GitHub Actions + Vercel CI/CD pipeline. This production-ready Islamic scholarship platform features AI-powered hadith analysis, Arabic text processing, and comprehensive narrator evaluation.

---

## 📋 Prerequisites

### 🔧 Required Accounts & Services
- ✅ GitHub Repository (with admin access)
- ✅ Vercel Account (connected to GitHub)
- ✅ Supabase Project (PostgreSQL database)
- ✅ Stripe Account (for payments)
- ✅ Resend Account (for emails)

### 🏗️ Local Development Setup
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd hadith-narrator-checker

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your development credentials

# 4. Start development server
npm run dev
```

---

## 🌍 Vercel Setup

### 1. **Project Configuration**
```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login to Vercel
vercel login

# Link your project
vercel link
```

### 2. **Environment Variables Setup**
In your Vercel dashboard, add these environment variables:

#### 🔑 **Required Secrets**
```bash
# Authentication
NEXTAUTH_SECRET=your_32_char_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=your_service_role_key

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@your-domain.com
```

### 3. **Domain Configuration**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `hadith-checker.com`)
3. Configure DNS records as shown in Vercel
4. Enable automatic HTTPS

---

## 🤖 GitHub Actions Setup

### 1. **Repository Secrets**
Go to GitHub → Settings → Secrets and Variables → Actions

Add these **Repository Secrets**:

```bash
# Vercel Integration
VERCEL_TOKEN=your_vercel_deploy_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SECRET_KEY=your_service_role_key
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_PROJECT_REF=your_project_ref_id

# Authentication & Security
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LIGHTHOUSE_CI_TOKEN=your_lighthouse_token
```

### 2. **Workflow Files**
The following workflows are automatically configured:

#### 🧪 **Staging Pipeline** (`.github/workflows/staging.yml`)
- **Trigger**: Pull Requests to `main`
- **Features**:
  - ✅ Security audit & validation
  - ✅ TypeScript compilation check
  - ✅ AI components testing
  - ✅ Cross-browser E2E testing
  - ✅ Vercel preview deployment
  - ✅ Performance monitoring
  - ✅ Automated PR comments with preview links

#### 🌟 **Production Pipeline** (`.github/workflows/production.yml`)
- **Trigger**: Push to `main` branch
- **Features**:
  - ✅ Comprehensive security validation
  - ✅ Full test suite execution
  - ✅ Database migration support
  - ✅ Production deployment
  - ✅ Health checks & monitoring
  - ✅ Performance validation
  - ✅ Global CDN testing

---

## 🗄️ Database Setup

### 1. **Supabase Configuration**
```sql
-- Run these migrations in Supabase SQL Editor
-- (Files are in /supabase/migrations/)

-- Core tables: narrators, hadith collections, opinions
-- Refer to existing migration files
```

### 2. **Row Level Security**
Ensure RLS policies are enabled:
```sql
-- Example RLS policy for narrator bookmarks
CREATE POLICY "Users can manage own bookmarks" ON bookmark
FOR ALL USING (auth.uid() = user_id);
```

### 3. **Database Indexing**
```sql
-- Performance indexes for Arabic text search
CREATE INDEX CONCURRENTLY idx_narrator_name_arabic 
ON narrator USING gin (name_arabic gin_trgm_ops);

CREATE INDEX CONCURRENTLY idx_narrator_search_vector 
ON narrator USING gin (search_vector);
```

---

## 🔒 Security Configuration

### 1. **Environment Security**
- ✅ All secrets stored in GitHub Secrets
- ✅ No hardcoded credentials in code
- ✅ Separate staging/production environments
- ✅ Regular secret rotation schedule

### 2. **Application Security**
- ✅ Content Security Policy (CSP) headers
- ✅ Security monitoring active
- ✅ Rate limiting implemented
- ✅ SQL injection protection
- ✅ XSS prevention

### 3. **Security Validation**
```bash
# Run security audit locally
npm run security:validate

# Check security headers
curl -I https://your-domain.com | grep -E "(CSP|X-Frame|X-Content)"
```

---

## 🧪 Testing Strategy

### 1. **Local Testing**
```bash
# Type checking
npm run lint:ts

# Security validation
npm run security:validate

# End-to-end testing
npm run test

# Specific test suites
npm run test:ai         # AI components
npm run test:browsers   # Cross-browser
npm run test:mobile     # Mobile optimization
```

### 2. **Staging Testing**
- Every PR triggers automated testing
- Preview deployments for manual testing
- Performance monitoring via Lighthouse
- Security header validation

### 3. **Production Testing**
- Comprehensive test suite before deployment
- Health check validation
- Performance monitoring
- Global CDN testing

---

## 📊 Monitoring & Analytics

### 1. **Health Monitoring**
```bash
# Health check endpoint
GET /api/health

# Response includes:
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy", "responseTime": 45 },
    "ai": { "status": "healthy", "responseTime": 120 },
    "security": { "status": "healthy", "responseTime": 30 },
    "memory": { "status": "healthy", "usage": 245 }
  },
  "message": "الحمد لله - System is running smoothly"
}
```

### 2. **Performance Monitoring**
- Lighthouse CI integration
- Core Web Vitals tracking
- Arabic text rendering performance
- AI component response times

### 3. **Error Monitoring**
- Comprehensive error logging
- Security incident tracking
- Performance degradation alerts
- Database connection monitoring

---

## 🚀 Deployment Process

### 1. **Staging Deployment**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: implement new hadith analysis feature"

# Push and create PR
git push origin feature/new-feature
# Create PR in GitHub - this triggers staging pipeline
```

### 2. **Production Deployment**
```bash
# Merge PR to main (after review and tests pass)
git checkout main
git merge feature/new-feature
git push origin main
# This automatically triggers production deployment
```

### 3. **Manual Deployment** (if needed)
```bash
# Deploy to staging
npm run staging:deploy

# Deploy to production
npm run production:deploy

# Health check
npm run health:check
```

---

## 🛠️ Troubleshooting

### Common Issues

#### 🔧 **Build Failures**
```bash
# TypeScript errors
npm run lint:ts
# Fix type issues and commit

# Dependency issues
npm ci
npm run build
```

#### 🔧 **Deployment Issues**
```bash
# Check Vercel logs
vercel logs

# Validate environment variables
vercel env ls

# Check health endpoint
curl https://your-domain.com/api/health
```

#### 🔧 **Performance Issues**
```bash
# Run performance audit
npm run test:performance

# Check bundle size
npm run build:analyze

# Monitor metrics
curl https://your-domain.com/api/health
```

#### 🔧 **Security Issues**
```bash
# Run security validation
npm run security:validate

# Check security headers
curl -I https://your-domain.com

# Review security logs
# Check monitoring dashboard
```

---

## 📱 Mobile & Arabic Support

### 1. **Arabic Text Optimization**
- ✅ RTL text direction support
- ✅ Arabic font optimization
- ✅ Unicode normalization
- ✅ Typography enhancements

### 2. **Mobile Performance**
- ✅ Responsive design
- ✅ Touch gesture support
- ✅ Mobile-optimized AI components
- ✅ Offline capabilities

---

## 🎯 Go-Live Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates active
- [ ] CDN configured and tested
- [ ] Security headers validated
- [ ] Performance metrics within targets
- [ ] Mobile responsiveness verified
- [ ] Arabic text rendering tested
- [ ] AI components validated
- [ ] Monitoring and alerts active

### Launch Day
- [ ] Final security scan
- [ ] Health check validation
- [ ] Performance monitoring active
- [ ] Error tracking enabled
- [ ] Backup systems verified
- [ ] Team notifications configured

### Post-Launch
- [ ] Monitor performance metrics
- [ ] Track user engagement
- [ ] Review error logs
- [ ] Security monitoring active
- [ ] Plan regular updates

---

## 🎉 Success Metrics

### Performance Targets
- ⚡ **Page Load**: < 2 seconds
- ⚡ **AI Analysis**: < 1.5 seconds
- ⚡ **Database Queries**: < 500ms
- ⚡ **Mobile Performance**: 90+ Lighthouse score

### Islamic Scholarship Goals
- 🕌 **Arabic Text Accuracy**: 99%+
- 🕌 **Narrator Database**: Complete coverage
- 🕌 **Scholarly Opinions**: Comprehensive collection
- 🕌 **User Experience**: Intuitive and respectful

---

## 📞 Support

### Technical Support
- **Documentation**: `/TECHNICAL_DOCS.md`
- **API Reference**: `/API_DOCS.md`
- **GitHub Issues**: [Repository Issues](https://github.com/your-repo/issues)

### Islamic Scholarship Support
- **Hadith Database**: Verified by Islamic scholars
- **Narrator Profiles**: Authenticated sources
- **Scholarly Opinions**: Peer-reviewed content

---

## 🤲 Conclusion

**الحمد لله** - By Allah's grace, your Hadith Narrator Checker is now ready for production deployment. This platform will serve the global Islamic scholarship community with:

- ✅ **Advanced AI-powered hadith analysis**
- ✅ **Comprehensive narrator verification**
- ✅ **Beautiful Arabic typography**
- ✅ **Secure and scalable architecture**
- ✅ **World-class performance**

May this platform benefit scholars and students of Islamic knowledge worldwide.

**بارك الله فيكم** - May Allah bless your efforts in serving the Ummah through technology.

---

*Last updated: January 2025*  
*Platform: Next.js 15 + Supabase + Vercel + GitHub Actions* 