# Hadith Narrator Checker

A specialized Islamic scholarship tool for verifying hadith narrator authenticity and credibility through automated text analysis. Built on a modern Next.js SaaS foundation with comprehensive narrator biographical data and scholarly opinion management.

## 🎯 Project Overview

**Transform traditional hadith authentication into a streamlined digital workflow**

This application assists Islamic scholars, researchers, and students in:
- **Automated Isnād Extraction**: Extract narrator chains from hadith text
- **Narrator Credibility Analysis**: Access comprehensive biographical data and scholarly assessments
- **Research Management**: Bookmark narrators and maintain search history
- **Scholarly Reference**: Cross-reference multiple scholarly opinions with proper source attribution

## ✨ Key Features

### 🔍 Hadith Analysis Engine
- **Text Processing**: Advanced Arabic text normalization and analysis
- **Isnād Extraction**: Automated narrator chain identification
- **Narrator Identification**: Match narrators to comprehensive biographical database
- **Credibility Assessment**: Clear indicators of narrator trustworthiness

### 📚 Scholarly Database
- **Comprehensive Narrator Profiles**: Biography, dates, regions, credibility
- **Scholarly Opinions**: Multiple expert assessments with source references
- **Source Attribution**: Proper academic citations for all information
- **Historical Context**: Islamic calendar dates and geographical data

### 👤 User Management
- **Authentication**: Secure Google OAuth integration
- **Bookmarking**: Save important narrators for future reference
- **Search History**: Track and revisit previous analyses
- **Personal Dashboard**: Manage research workflow

## 🛠 Tech Stack

### Core Foundation
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first CSS framework with custom theming

### Backend & Database
- **Supabase**: PostgreSQL database with built-in auth and real-time features
- **NextAuth v5**: Authentication with OAuth providers
- **Row Level Security**: Database-level user data isolation

### Specialized Libraries
- **hadith-api**: Canonical hadith identification and matching
- **isnad-parser**: Advanced narrator chain extraction
- **camel-tools**: Arabic text normalization and processing

### Development Tools
- **Turbopack**: Fast development builds
- **ESLint & Prettier**: Code quality and formatting
- **pnpm**: Efficient package management

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**: Runtime environment
- **pnpm**: Package manager (install with `npm install -g pnpm`)
- **Supabase Account**: For database and authentication

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/ShaikMoosa/-Hadith-Narrator-Checker.git
cd -Hadith-Narrator-Checker
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Environment Configuration**
Copy `.env.example` to `.env.local` and configure:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SECRET_KEY=your_secret_key

# Authentication
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
AUTH_SECRET=your_nextauth_secret

# Optional: Analytics
GOOGLE_ANALYTICS_ID=your_analytics_id
```

4. **Database Setup**
The database schema includes specialized tables for hadith analysis:
- `narrator`: Core narrator biographical data
- `opinion`: Scholarly assessments and verdicts
- `bookmark`: User bookmarking system
- `search`: Search history tracking

5. **Start Development Server**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 📁 Project Structure

```
hadith-narrator-checker/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (landing, pricing)
│   ├── app/               # Protected hadith analysis interface
│   ├── api/               # API endpoints and webhooks
│   └── actions/           # Server actions for hadith processing
├── components/            # UI components
│   ├── ui/               # shadcn/ui base components
│   ├── app/              # Application-specific components
│   └── user/             # User management components
├── memory-bank/          # Project documentation and context
├── lib/                  # Utility libraries and hooks
├── types/                # TypeScript type definitions
├── utils/                # Helper functions and utilities
└── supabase/             # Database migrations and types
```

## 🎨 Component Architecture

### Main Application Flow
```
HomePage → HadithSearchInput → BackendProcessing → NarratorList → NarratorProfile
```

### Key Components (Planned Implementation)
- **HadithSearchInput**: Central textarea for hadith text submission
- **NarratorList**: Display extracted narrator chains with credibility indicators
- **NarratorProfile**: Detailed narrator information with tabbed interface
- **RecentSearches**: Horizontal scroll of user search history
- **BookmarkButton**: Save/unsave functionality for narrators

## 🗄 Database Schema

### Core Tables
```sql
-- Narrator biographical information
CREATE TABLE narrator (
  id SERIAL PRIMARY KEY,
  name_arabic TEXT NOT NULL,
  name_transliteration TEXT,
  credibility TEXT NOT NULL,
  biography TEXT,
  birth_year INTEGER,
  death_year INTEGER,
  region TEXT
);

-- Scholarly opinions and assessments
CREATE TABLE opinion (
  id SERIAL PRIMARY KEY,
  narrator_id INTEGER REFERENCES narrator(id),
  scholar TEXT NOT NULL,
  verdict TEXT NOT NULL,
  reason TEXT,
  source_ref TEXT
);

-- User bookmarking system
CREATE TABLE bookmark (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  narrator_id INTEGER REFERENCES narrator(id)
);

-- Search history tracking
CREATE TABLE search (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  result_found BOOLEAN NOT NULL,
  searched_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Development Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # ESLint code checking
pnpm lint:ts          # TypeScript type checking

# Email Development
pnpm email            # React Email development server

# Database
# Note: Supabase CLI commands for schema management
```

## 📈 Current Implementation Status

### ✅ Completed (Foundation)
- Next.js 15 application with App Router
- Authentication system (NextAuth v5 + Supabase)
- Database schema with hadith-specific tables
- Row Level Security policies
- UI component system (shadcn/ui + Tailwind CSS)
- Development environment and tooling

### 🔄 In Development
- Hadith text processing and analysis
- Narrator extraction and identification
- UI components for narrator display
- Search history and bookmarking features

### 📋 Planned Features
- Advanced Arabic text processing
- Scholarly opinion sorting and filtering
- Export functionality for research data
- Mobile optimization for Arabic content
- API access for third-party integrations

## 🤝 Contributing

This project serves the Islamic scholarship community. Contributions should maintain:
- **Academic Accuracy**: All narrator information must be scholarly verified
- **Source Attribution**: Proper citations for all scholarly opinions
- **Cultural Sensitivity**: Respectful handling of Islamic content
- **Quality Standards**: Clean, documented, and tested code

## 📚 Documentation

Comprehensive project documentation is maintained in the `memory-bank/` directory:
- **Project Brief**: Overview and objectives
- **Technical Context**: Detailed technology specifications
- **Hadith App Context**: Specialized Islamic scholarship requirements
- **Progress Tracking**: Implementation status and roadmap

## 🔗 Related Projects

Built on the foundation of modern SaaS development patterns while specializing in Islamic scholarship tools. This project demonstrates how domain-specific applications can leverage general-purpose technical foundations.

## 📄 License

This project is designed to serve the Islamic scholarship community. Please ensure any usage aligns with academic and religious principles.

---

**For the Islamic scholarly community worldwide** 🕌

*Streamlining hadith authentication through modern technology while preserving traditional academic rigor.*
