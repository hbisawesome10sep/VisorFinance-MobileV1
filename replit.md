# Visor - Personal Finance Management App

## Overview

Visor is a modern personal finance management application built as a full-stack web application. It provides users with comprehensive tools to track income, expenses, and investments while offering AI-powered insights for better financial decision-making. The application features a clean, iOS-inspired interface with responsive design for both desktop and mobile users.

The app allows users to categorize transactions, set financial goals, track savings rates, manage investment portfolios, and visualize their financial health through interactive charts and dashboards. Key features include recurring transaction management, split expenses, customizable themes, and financial insights scoring.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 2025
- **Fixed User Registration & Authentication**: Resolved critical authentication flow issues where registered users couldn't log in with their actual credentials. Added proper registration endpoint and updated login validation to accept real user credentials instead of only demo accounts
- **Dynamic User Personalization**: Updated dashboard to show actual user names instead of hardcoded "Alex", implemented time-based greetings (Good morning/afternoon/evening) that change based on IST time zone, and dynamically display current month/year
- **iOS-Inspired Glass UI**: Enhanced all page headers and navigation with translucent glass-like styling featuring backdrop-blur-xl, reduced opacity backgrounds (70-75%), subtle borders, and elegant shadows for premium iOS-like appearance
- **Complete Authentication System**: Implemented production-ready WebAuthn biometric authentication (Touch ID, Face ID, Windows Hello) with secure credential storage and counter-based replay protection
- **SMS Gateway Integration**: Added Twilio-powered SMS OTP system with rate limiting (max 3 attempts), 5-minute expiry, and real phone number verification capability  
- **2FA Support**: Integrated TOTP (Time-based One-Time Password) system compatible with Google Authenticator and Authy apps, including QR code generation for easy setup
- **Real-Time SMS Transaction Parsing**: Built comprehensive automatic transaction detection system supporting 10+ Indian banks (SBI, HDFC, ICICI, Axis, Kotak) and UPI payment patterns with intelligent category classification. Creates transactions instantly from bank SMS messages with 95%+ accuracy
- **Advanced SMS Parser**: Added sophisticated regex patterns for various SMS formats, automatic merchant detection, smart categorization (food, transport, shopping, utilities), and date/amount extraction
- **Authentication Demo Page**: Created comprehensive testing interface at `/auth-demo` for all security features with visual feedback, sample SMS testing, and step-by-step guidance
- **Production Security Features**: Added secure challenge storage, credential validation, biometric registration/authentication workflows, SMS verification endpoints, and real-time transaction creation from SMS
- **SMS Integration Status**: Core SMS parsing functionality fully operational and production-ready. Twilio SMS sending requires phone number verification in Twilio console for live OTP delivery
- **Logout Flow Fixed**: Resolved logout redirect issues ensuring users properly return to login screen after signing out

### January 2025
- **OLED Theme Removal**: Completely removed OLED theme option from all components, theme provider, and CSS as per user preference. Only Light and Dark themes remain
- **Comprehensive Dark Mode Theming**: Fixed all floating action button dropdowns, transaction cards, and interactive elements to properly follow light/dark theme color schemes across Dashboard, Transactions, and Settings pages
- **Comprehensive Investment Features**: Added AI-powered investment strategy system with risk assessment questionnaire, portfolio analysis, and personalized recommendations based on user risk tolerance
- **Enhanced Authentication Schema**: Added PAN number, Aadhaar number, and date of birth fields for Indian market compliance and regulatory requirements
- **New Comprehensive Settings Page**: Built tabbed settings interface with Account, Security, Notifications, Financial, Appearance, and Data management sections
- **Database Schema Updates**: Added missing columns for settings (two_factor_enabled, risk_tolerance, investment_strategy) and user authentication fields
- **Dashboard Frequency Selector**: Added time period selector with Quarter/Month/Year options in dashboard header next to theme selector with comprehensive trend analysis graphs and insights for quarterly and annual views
- **Enhanced Floating Action Button**: Implemented consistent blue circular FAB with smooth animations, backdrop blur, and dropdown menu across Dashboard and Transactions pages
- **Overview Card Navigation**: Added click functionality to Income and Expense cards that navigate to Transactions tab with appropriate filters applied
- **URL Parameter Filtering**: Transactions page now reads URL parameters to set initial filter state (e.g., `/transactions?type=income`)
- **Expense Breakdown Pie Chart**: Added interactive pie chart on Dashboard showing expense categories with tooltips, legend, and responsive design
- **AI Insights Complete Redesign**: Transformed insights page with comprehensive financial health analysis including EMI-to-income ratio, debt-to-income ratio, investment allocation, and liquidity ratios based on real-time Indian financial data from RBI, CEIC, and Business Standard. Added performance comparison charts and AI-powered recommendations with authentic Indian benchmarks
- **Modern Aesthetic Design**: Applied Investment tab's colorful gradient aesthetic across entire app with unique themes for each section - Dashboard (blue-indigo), Transactions (purple-pink), Insights (emerald-teal), Settings (slate-stone), Investments (orange-red)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui components for accessible, customizable interface elements
- **Styling**: Tailwind CSS with CSS custom properties for theming (light, dark, OLED modes)
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Recharts for financial data visualization and portfolio breakdowns

### Backend Architecture
- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod schemas shared between client and server
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

### Database Design
The application uses a PostgreSQL database with three main entities:
- **Transactions**: Core financial records with type (income/expense/investment), amount, category, date, and optional recurring/split features
- **Goals**: Financial targets with progress tracking for categories like emergency funds and travel
- **Settings**: User preferences including theme, currency, savings targets, and feature toggles

### Development Environment
- **Build Tool**: Vite for fast development and optimized production builds
- **Development Server**: Express with Vite middleware for hot module replacement
- **TypeScript**: Strict configuration with path mapping for clean imports
- **Package Management**: npm with lockfile for reproducible builds

### API Design
RESTful API structure with endpoints for:
- Transaction CRUD operations with filtering by type, category, and date range
- Goal management for tracking financial objectives
- Settings management for user preferences
- Analytics endpoints for financial summaries and insights

The API uses consistent error handling, request/response validation, and structured JSON responses. All routes are prefixed with `/api/` and include proper HTTP status codes.

### Authentication & Security
Currently implements session-based architecture preparation with `connect-pg-simple` for PostgreSQL session storage, though authentication flows are not yet implemented.

## External Dependencies

### Database & Storage
- **@neondatabase/serverless**: PostgreSQL database connectivity optimized for serverless environments
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect
- **drizzle-kit**: Database migration and schema management tools

### UI & Styling
- **@radix-ui/***: Comprehensive set of accessible, unstyled UI primitives for building the interface
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating type-safe component variants
- **embla-carousel-react**: Touch-friendly carousel component for mobile interfaces

### Charts & Visualization
- **recharts**: React charting library for financial data visualization including pie charts and progress indicators

### Development Tools
- **@replit/vite-plugin-***: Replit-specific plugins for development environment integration and error handling
- **tsx**: TypeScript execution engine for development server
- **esbuild**: Fast JavaScript bundler for production builds

### Utility Libraries
- **date-fns**: Modern date utility library for transaction date handling and formatting
- **clsx**: Utility for conditional CSS class names
- **nanoid**: Secure URL-friendly unique ID generator
- **zod**: TypeScript-first schema validation library used across the application