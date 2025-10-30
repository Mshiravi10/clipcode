# ClipCode

> A modern, full-featured code snippet manager built with Next.js 14. Organize, search, and share your code snippets with ease.

[![CI](https://github.com/Mshiravi10/clipcode/workflows/CI/badge.svg)](https://github.com/Mshiravi10/clipcode/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- **🔍 Powerful Search** - Full-text search with fuzzy matching powered by PostgreSQL
- **📁 Collections & Tags** - Organize snippets with collections and tags
- **⚡ Code Playground** - Execute JavaScript and Python code directly in the browser
- **🎨 Syntax Highlighting** - Monaco editor with support for 50+ languages
- **📝 Version Control** - Track changes and restore previous versions of your snippets
- **🔄 Import/Export** - Bulk import/export snippets in JSON or Markdown format
- **🔐 GitHub OAuth** - Secure authentication with GitHub
- **🎯 Smart Similarity** - Find similar snippets automatically
- **📊 Analytics** - Track snippet usage and trends
- **🌙 Modern UI** - Beautiful interface built with Tailwind CSS and Radix UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14 or higher
- pnpm 8.x or higher

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Mshiravi10/clipcode.git
cd clipcode
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up the database**

```bash
# Create the database
createdb clipcode

# Enable required PostgreSQL extension
psql clipcode -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

4. **Configure environment variables**

```bash
cd apps/web
cp env.example .env
```

Edit `.env` and update these values:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/clipcode"

# Authentication (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_ID="your-github-oauth-client-id"
GITHUB_SECRET="your-github-oauth-client-secret"
```

> **Note:** To create a GitHub OAuth app, visit [GitHub Developer Settings](https://github.com/settings/developers), create a new OAuth app, and set the callback URL to `http://localhost:3000/api/auth/callback/github`

5. **Run database migrations**

```bash
pnpm db:migrate
```

6. **Seed the database (optional)**

```bash
pnpm db:seed
```

This will create sample snippets, tags, and collections to help you get started.

7. **Start the development server**

```bash
cd ../..
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Tech Stack

### Core
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety throughout
- **PostgreSQL** - Robust relational database
- **Prisma** - Next-generation ORM

### Frontend
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautifully designed components
- **Monaco Editor** - VS Code's editor in the browser
- **React Hook Form** - Performant forms with validation

### Backend
- **NextAuth.js** - Authentication for Next.js
- **Zod** - TypeScript-first schema validation
- **Pyodide** - Python runtime in WebAssembly

### Search & Performance
- **PostgreSQL Full-Text Search** - Native `tsvector` search with GIN indexing
- **pg_trgm** - Fuzzy string matching and similarity search
- **Server Components** - React Server Components for optimal performance

## 📖 Documentation

- [API Documentation](docs/api.md) - Complete API reference
- [Architecture](docs/architecture.md) - System design and patterns
- [Roadmap](docs/roadmap.md) - Upcoming features and plans

## 🎯 Usage

### Creating a Snippet

1. Click "New Snippet" in the dashboard
2. Add your code and metadata (title, description, language)
3. Tag it for easy discovery
4. Optionally add it to a collection

### Searching

Use the search bar with powerful filters:
- **Text search**: Searches title, description, and code content
- **Language filter**: Filter by programming language
- **Tag filter**: Filter by tags
- **Collection filter**: View snippets in specific collections
- **Favorites**: Quick access to starred snippets

### Code Playground

Execute JavaScript and Python code directly in the browser:
1. Navigate to any snippet
2. Click "Playground"
3. Edit and run the code
4. View console output and results

### Import/Export

- **Import**: Upload JSON or Markdown files with snippets
- **Export**: Download all your snippets as JSON or Markdown

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:migrate   # Run database migrations
pnpm db:push      # Push schema changes
pnpm db:seed      # Seed with sample data
pnpm db:studio    # Open Prisma Studio

# Code Quality
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests with Playwright
```

### Project Structure

```
clipcode/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── app/
│       │   ├── (dashboard)/    # Dashboard pages
│       │   │   ├── snippets/   # Snippet management
│       │   │   ├── collections/# Collection management
│       │   │   ├── tags/       # Tag management
│       │   │   └── ...
│       │   ├── api/            # API routes
│       │   └── auth/           # Authentication pages
│       ├── components/         # React components
│       ├── lib/                # Utility functions
│       │   ├── auth.ts         # Authentication logic
│       │   ├── search.ts       # Search implementation
│       │   ├── prisma.ts       # Database client
│       │   └── ...
│       └── prisma/             # Database schema & migrations
├── docs/                       # Documentation
└── .github/                    # CI/CD workflows
```

## 🔒 Security

- All API endpoints require authentication
- SQL injection protection via Prisma
- XSS prevention with React
- CSRF protection with NextAuth
- Rate limiting on API endpoints
- Audit logging for all mutations

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

### Docker

```bash
# Coming soon
docker-compose up
```

### Manual Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Run migrations: `pnpm db:migrate`
4. Build: `pnpm build`
5. Start: `pnpm start`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for the web
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Vercel](https://vercel.com/) - Deployment and hosting platform

## 📧 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

Made with ❤️ by developers, for developers
