# ONIX v2 Registration Microservice

A modern, secure, and accessible registration microservice built with Next.js 16, React 19, and TypeScript.

**Next.js Version**: 16.0.1 (Latest Stable)  
**Status**: In Development  
**License**: Proprietary

---

## 📋 Overview

The ONIX v2 Registration Microservice provides a complete user registration system with email/phone verification, secure authentication, and a modern user interface. Built with the latest web technologies, it prioritizes security, accessibility, and developer experience.

### Key Features

- 🔐 **Secure Authentication** - NextAuth.js v5 with JWT tokens
- 📧 **Email Verification** - SendGrid/Resend integration
- 📱 **SMS Verification** - Twilio/AWS SNS support
- ♿ **WCAG 2.1 Compliant** - Full accessibility support
- 🎨 **Modern UI** - Tailwind CSS + shadcn/ui components
- 🔒 **Security First** - Rate limiting, CSRF protection, input validation
- 🚀 **High Performance** - Next.js 16 with Cache Components
- 📱 **Mobile Responsive** - Mobile-first design
- 🧪 **Fully Tested** - Unit, integration, and E2E tests
- 📚 **Well Documented** - Comprehensive API and component docs

---

## 🛠️ Technology Stack

### Core Framework
- **Next.js 16.0.1** - React framework with App Router and Cache Components
- **React 19** - UI library with latest features
- **TypeScript 5+** - Type safety throughout

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **CSS Modules** - Scoped styles when needed

### Authentication & Security
- **NextAuth.js v5** - Authentication and session management
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation

### Database & ORM
- **Prisma** - Type-safe database toolkit
- **PostgreSQL** - Primary database
- **Redis** - Session store and caching

### Testing
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **MSW** - API mocking

### Form Handling
- **React Hook Form** - Form state management
- **Zod** - Client and server-side validation

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js 18.17+** or **Node.js 20+** (required for Next.js 16)
- **npm 9+**, **yarn 1.22+**, or **pnpm 8+**
- **PostgreSQL 14+** installed and running
- **Redis** (optional for development, required for production)
- **Git** for version control

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd onix-v2-register
```

### 2. Install Dependencies

```bash
# Install Next.js 16 and all dependencies
npm install next@latest react@latest react-dom@latest
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```bash
# Application Configuration
PORT=4500  # Optional: Application port (defaults to 3000 if not set)
# Note: npm scripts use dotenv-cli to load PORT from .env.local

# Database (Server-only)
DATABASE_URL="postgresql://user:password@localhost:5432/onix_registration"

# Authentication (Server-only)
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"  # Update if using custom PORT

# Email Service (Server-only)
EMAIL_API_KEY="your-email-api-key"
EMAIL_FROM="noreply@yourdomain.com"

# Client-accessible (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL="/api"
NEXT_PUBLIC_APP_NAME="ONIX Registration"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Start Development Server

```bash
# Start with port from .env.local (recommended)
npm run dev

# Or override with environment variable
PORT=4000 npm run dev
```

Visit `http://localhost:3000` (or your configured PORT) 🎉

**How PORT Configuration Works**:
- Set `PORT=4500` in `.env.local` (recommended for development)
- npm scripts use `dotenv-cli` to load `.env.local` before starting
- Or export PORT in your shell: `export PORT=4500`
- Defaults to 3000 if PORT is not set

---

## 📁 Project Structure

```
onix-v2-register/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── register/           # Registration endpoints
│   │   └── verify/             # Verification endpoints
│   ├── (auth)/                 # Auth route group
│   │   ├── register/          # Registration pages
│   │   ├── login/             # Login pages
│   │   └── verify/            # Verification pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
│
├── components/                  # React components
│   ├── forms/                  # Form components
│   ├── ui/                     # shadcn/ui components
│   └── auth/                   # Auth-specific components
│
├── lib/                        # Utility functions
│   ├── db/                    # Prisma client
│   ├── auth/                  # Auth utilities
│   ├── validation/            # Zod schemas
│   └── email/                 # Email service
│
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript types
├── tests/                      # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # E2E tests
│
├── docs/                       # Documentation
│   ├── api/                   # API docs
│   ├── components/            # Component docs
│   ├── deployment/            # Deployment guides
│   └── development/           # Development guides
│
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   └── tasks/                 # Task management
│
├── prisma/                     # Database schema
├── public/                     # Static assets
└── next.config.js              # Next.js config
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## 🔨 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Database studio
npx prisma studio
```

---

## 📚 Documentation

- **[Setup Guide](docs/development/SETUP.md)** - Complete setup instructions
- **[Next.js 16 Features](docs/development/NEXTJS-16-FEATURES.md)** - Next.js 16 migration guide
- **[API Documentation](docs/api/)** - API endpoint documentation
- **[Component Documentation](docs/components/)** - Component library docs
- **[Deployment Guide](docs/deployment/)** - Production deployment
- **[Copilot Instructions](.github/copilot-instructions.md)** - Development workflow

---

## 🔒 Security

### Built-in Security Features

- ✅ **Input Validation** - Client and server-side with Zod
- ✅ **CSRF Protection** - Cross-site request forgery prevention
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **SQL Injection Prevention** - Prisma ORM with parameterized queries
- ✅ **XSS Protection** - React's built-in escaping
- ✅ **Secure Sessions** - HTTP-only cookies with JWT
- ✅ **Password Hashing** - bcrypt with 12 rounds
- ✅ **Environment Variables** - Server-only secrets

### Security Best Practices

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Check for updates
npm outdated
```

---

## ♿ Accessibility

This application follows WCAG 2.1 Level AA standards:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Color contrast compliance
- ✅ Semantic HTML
- ✅ Skip navigation links

Test accessibility:
```bash
npm run test:a11y
```

---

## 🚀 Deployment

### Production Build

```bash
# Create production build
npm run build

# Test production build locally
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - 32+ character random string
- `NEXTAUTH_URL` - Production URL
- `EMAIL_API_KEY` - Email service API key
- `SMS_API_KEY` - SMS service API key

### Deployment Platforms

- **Vercel** - Recommended (zero-config deployment)
- **Docker** - See `Dockerfile`
- **Self-hosted** - Node.js server required

---

## 🤝 Contributing

### Development Workflow

1. **Create Task File** - Required for all work (see `.github/tasks/README.md`)
2. **Follow Guidelines** - See `.github/copilot-instructions.md`
3. **Write Tests** - All new features require tests
4. **Update Docs** - Keep documentation current
5. **Code Review** - All changes reviewed before merge

### Code Standards

- TypeScript for all code
- ESLint + Prettier for formatting
- Commit message convention: `type(scope): message`
- Test coverage minimum: 80%

---

## 📝 Task Management

All development work follows a systematic task management process:

1. Create task file in `.github/tasks/`
2. Update status during development
3. Archive completed tasks
4. See `.github/tasks/README.md` for full guidelines

---

## 🆕 Next.js 16 Features

This project uses the latest Next.js 16 features:

- **Cache Components** - Improved caching and rendering
- **Async Params** - All params/searchParams are Promises
- **Proxy Middleware** - Renamed from middleware
- **Dynamic by Default** - No force-dynamic needed
- **React 19** - Latest React features

See [Next.js 16 Features Guide](docs/development/NEXTJS-16-FEATURES.md) for details.

---

## 🐛 Troubleshooting

### Common Issues

**Port in use:**
```bash
# Kill process on default port
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env.local
# Edit .env.local and set: PORT=4500
npm run dev

# Or override with environment variable
PORT=4500 npm run dev
```

**Note on macOS**: Port 5000 is often used by AirPlay Receiver (Control Center).
To free it: System Settings → General → AirDrop & Handoff → Turn off AirPlay Receiver

**Database connection failed:**
```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL (macOS)
brew services restart postgresql@14
```

**Prisma issues:**
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

**Next.js cache issues:**
```bash
rm -rf .next
npm run build
```

See [Setup Guide](docs/development/SETUP.md) for more troubleshooting.

---

## 📞 Support

For questions or issues:
- Check documentation in `/docs`
- Review `.github/copilot-instructions.md`
- Check existing tasks in `.github/tasks/`
- Open an issue on GitHub

---

## 📄 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - The React Framework
- [React](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - Components

---

**Last Updated**: 2025-01-15  
**Next.js Version**: 16.0.1  
**Version**: 1.0.0