# Active Context

## Current State
**Date**: January 29, 2025
**Status**: Project Evolution - Hadith Narrator Checker Application Development

## Project Evolution Discovery
✅ **Major Update**: Project has evolved from generic SaaS starter kit to a specific **Hadith Narrator Checker** application built on the starter kit foundation.

## Current Project Focus: Hadith Narrator Checker MVP

### Application Purpose
A specialized Islamic scholarship tool that:
- **Processes Hadith Text**: Users paste/type hadith text for analysis
- **Extracts Narrator Chains**: Identifies and extracts isnād (chain of narrators) from hadith
- **Provides Narrator Analysis**: Shows detailed profiles, credibility, scholarly opinions
- **Manages User Features**: Bookmarking, search history, user authentication

### Tech Stack Integration
- **Base**: Next.js SaaS Starter Kit (auth, payments, database already functional)
- **Specialized Libraries**: 
  - `hadith-api` for hadith identification
  - `isnad-parser` for narrator chain extraction
  - `camel-tools` for Arabic text processing
- **Database Schema**: Extended Supabase with hadith-specific tables

## Current Implementation Status

### Database Schema (Implemented)
✅ **Core Tables**:
- `narrator`: Narrator details (Arabic names, credibility, biography)
- `opinion`: Scholarly opinions about narrators
- `bookmark`: User bookmarking system
- `search`: Search history tracking

### Planned Features (From Prompts)
🔄 **In Development**:
1. **Homepage Hadith Search Input** - Central textarea for hadith submission
2. **Backend Integration** - Server actions for hadith processing
3. **Narrator Extraction & Listing** - Display extracted narrator chains
4. **Narrator Profile Panel** - Detailed narrator information with tabs
5. **Scholarly Opinions Integration** - Sortable opinions and references
6. **Bookmarking & Search History** - User-specific features
7. **Final Integration & Polish** - Complete user experience

## Development Approach

### Component Architecture
```
app/app/page.tsx (Main application page)
├── HadithSearchInput (Central search functionality)
├── NarratorList (Display extracted narrators)
├── NarratorProfile (Detailed narrator information)
│   ├── Biography Tab
│   ├── Opinions Tab
│   └── Source References Tab
├── RecentSearches (Search history carousel)
└── BookmarkButton (Save narrator functionality)
```

### Server Actions
```
app/actions/hadith.ts
├── processHadithText() - Main hadith processing
├── toggleBookmark() - Bookmark management
└── fetchRecentSearches() - Search history
```

## Technical Implementation Rules

### Frontend Requirements
- ✅ Use 'use client' directive for client components
- ✅ shadcn/ui components with Tailwind CSS
- ✅ Lucide React icons
- ✅ Responsive design with mobile-first approach
- ✅ Debug logging for all features
- ✅ Proper import practices with @/ aliases

### Styling Standards
- ✅ shadcn/ui library priority
- ✅ Tailwind CSS variable-based colors (bg-primary, text-primary-foreground)
- ✅ No indigo/blue colors unless specified
- ✅ White background with wrapper elements for different backgrounds

### Development Standards
- ✅ No dynamic imports or lazy loading
- ✅ Native Web APIs when possible
- ✅ No fetch requests in components (use server actions)
- ✅ Comprehensive debug logging with timestamps

## Immediate Next Steps

### Priority 1: Core Functionality Verification
1. **Verify Starter Kit Foundation**
   - Confirm auth, payments, database still functional
   - Test existing user management features

2. **Implement Hadith-Specific Features**
   - Build the main search input component
   - Integrate hadith processing server actions
   - Create narrator listing and profile components

### Priority 2: Database Integration
1. **Verify Supabase Schema**
   - Confirm narrator, opinion, bookmark, search tables exist
   - Test Row Level Security policies
   - Validate data relationships

2. **Test Specialized Libraries**
   - Verify hadith-api integration capability
   - Test isnad-parser functionality
   - Confirm camel-tools for Arabic processing

### Priority 3: User Experience Polish
1. **Authentication Integration**
   - Secure bookmarking features with user sessions
   - Implement search history per user
   - Test protected routes for app functionality

2. **UI/UX Refinement**
   - Mobile-responsive design verification
   - Arabic text rendering optimization
   - Performance testing with hadith processing

## Context for Development

### This is Now a Specialized Islamic App
- **Target Users**: Islamic scholars, students, researchers
- **Core Value**: Hadith authenticity verification through narrator analysis
- **Unique Features**: Arabic text processing, scholarly opinion aggregation
- **Technical Challenge**: Complex text analysis and database relationships

### Development Philosophy
- **Build on Proven Foundation**: Leverage existing auth/payment infrastructure
- **Domain-Specific Excellence**: Focus on Islamic scholarship tools
- **User-Centric Design**: Streamlined workflow for hadith research
- **Academic Rigor**: Accurate data representation and source attribution

## Communication Notes

The user has provided comprehensive implementation prompts indicating:
- **Active Development**: Detailed task breakdown suggests immediate implementation
- **Complete Vision**: Full feature specification from search to profile management
- **Technical Specificity**: Exact component structure and styling requirements
- **Quality Focus**: Emphasis on debugging, responsive design, and user experience

## Questions to Address

### Technical Questions
1. Are the specialized libraries (hadith-api, isnad-parser, camel-tools) already integrated?
2. Is the Supabase schema fully implemented with the hadith-specific tables?
3. What's the current state of the main app/app/page.tsx file?

### Product Questions  
1. What's the target deployment timeline for the MVP?
2. Are there specific Islamic scholarly standards to follow?
3. What's the user authentication flow for Islamic scholars/researchers?

### Implementation Questions
1. Should we start with the search input component first?
2. Are there any existing hadith datasets to populate the narrator table?
3. What's the priority order for the component implementation?

This represents a significant evolution from a generic starter kit to a specialized Islamic scholarship application with complex text processing and academic data management requirements. 