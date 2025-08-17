# CyberMoriarty - AI-Powered Cybersecurity Platform

## Overview

CyberMoriarty is a comprehensive AI-powered cybersecurity platform designed to help security professionals identify, assess, and manage vulnerabilities. The application integrates multiple data sources including the NIST National Vulnerability Database (NVD) and leverages OpenAI's GPT models to provide intelligent risk assessments and recommendations.

The platform features a modern React frontend with a dark cybersecurity theme, built on a Node.js/Express backend with PostgreSQL database storage. It provides vulnerability search capabilities, AI-driven risk assessments, testing environments, and comprehensive reporting functionality.

## Recent Changes (Latest Session)

- **Fixed SelectItem Component Errors**: Resolved all empty value prop errors in Select components across all pages by using proper non-empty string values
- **Resolved TypeScript Type Issues**: Fixed type mismatches in server storage layer, CVE service null safety, and routes type handling
- **Improved Code Stability**: All LSP errors cleared, server running without compilation errors
- **Enhanced Data Integrity**: Proper null safety handling throughout the storage and API layers
- **GitHub Preparation**: Created comprehensive README.md with security guidelines and setup instructions

## Roadmap (Next 6 Months)

### Phase 1: Exploit Development Framework (Months 1-2)
- Custom exploit builder interface with drag-and-drop functionality
- Template-based exploit generation for common vulnerability types
- AI-powered payload customization and optimization
- Multi-platform exploit support (Windows, Linux, macOS, Web)

### Phase 2: Advanced Testing & Research (Months 3-4)
- Proof-of-Concept (PoC) generator with AI assistance
- Sandboxed exploitation environment for safe testing
- Vulnerability research assistant with ML-powered pattern recognition
- Exploit chaining capabilities for complex attack scenarios

### Phase 3: Compliance & Professional Tools (Months 5-6)
- Ethical hacking compliance framework
- Legal authorization workflow integration
- Professional penetration testing report templates
- Advanced audit trails and evidence collection

### Key Safety & Legal Considerations
- All exploit development features will include mandatory ethical use agreements
- Built-in authorization verification before exploit execution
- Comprehensive audit logging for compliance and accountability
- Integration with responsible disclosure workflows

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme variables for cybersecurity aesthetic
- **State Management**: TanStack Query for server state management and data fetching
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with centralized route registration
- **Middleware**: Custom logging middleware for API request tracking
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Data Storage
- **Primary Database**: PostgreSQL using Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless PostgreSQL for cloud database hosting
- **Data Models**: Three main entities - vulnerabilities, assessments, and reports
- **Validation**: Drizzle-Zod integration for runtime schema validation

### Authentication & Session Management
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Session Security**: Secure session configuration with HTTP-only cookies

### External Dependencies

#### AI Services
- **OpenAI GPT-4**: Core AI engine for vulnerability risk assessment and analysis
- **Model**: GPT-4o for advanced reasoning capabilities
- **Use Cases**: Risk scoring, exploitability analysis, remediation recommendations

#### Vulnerability Data Sources
- **NIST NVD API**: Official National Vulnerability Database for CVE information
- **Data Types**: CVE details, CVSS scores, severity ratings, reference links
- **Rate Limiting**: Respectful API usage with proper error handling

#### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Hot Reload**: Development server with HMR support
- **Error Handling**: Runtime error overlay for development debugging

#### UI Component Libraries
- **Radix UI**: Headless UI components for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe CSS class composition
- **Embla Carousel**: Carousel component for data presentation

#### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **nanoid**: Secure unique ID generation
- **cmdk**: Command palette functionality

The architecture follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the full stack. The application is designed for scalability with proper separation of concerns and modular component architecture.