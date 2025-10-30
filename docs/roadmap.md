# clipcode Roadmap

## Sprint 1 (MVP) - ✅ COMPLETED

### Core Infrastructure
- [x] Monorepo setup with Turborepo + pnpm
- [x] Next.js 14 with App Router and TypeScript (strict)
- [x] PostgreSQL + Prisma with migrations
- [x] NextAuth with GitHub OAuth
- [x] Tailwind CSS + shadcn/ui components

### Database & Search
- [x] Complete Prisma schema with all models
- [x] Full-text search with tsvector + GIN indexes
- [x] Fuzzy search with pg_trgm
- [x] Database triggers for automatic search vector updates
- [x] Seed script with sample data

### API Layer
- [x] RESTful API endpoints
- [x] Zod validation for all inputs
- [x] Audit logging for all mutations
- [x] Session-based authentication
- [x] Error handling and consistent response format

### Features
- [x] CRUD operations for snippets
- [x] Advanced search with multiple filters
- [x] Favorites system
- [x] Usage tracking (copy count)
- [x] Import/Export (JSON + Markdown)
- [x] Tag management
- [x] Collection support

### UI Components
- [x] Dashboard layout with navigation
- [x] Monaco Editor integration (SSR-safe)
- [x] Snippet cards
- [x] Filter sidebar
- [x] Empty states
- [x] Loading skeletons
- [x] Toast notifications

### Documentation
- [x] README with setup instructions
- [x] Architecture documentation
- [x] API documentation with examples
- [x] Roadmap (this document)

### CI/CD
- [x] GitHub Actions workflow
- [x] Automated linting
- [x] Build verification

## Sprint 1 Remaining Tasks

### Pages (In Progress)
- [ ] Snippet create form page with Monaco editor
- [ ] Snippet edit page
- [ ] Collections management page
- [ ] Tags management page
- [ ] Import UI page with file upload
- [ ] Export UI page with format selection

### Testing
- [ ] Unit tests for search service
- [ ] Unit tests for slug generation
- [ ] Unit tests for validators
- [ ] E2E test for authentication flow
- [ ] E2E test for snippet CRUD
- [ ] E2E test for search functionality
- [ ] E2E test for copy operation

### Polish
- [ ] Keyboard shortcuts (n, /, f, c, s)
- [ ] Command palette (⌘K)
- [ ] Better loading states
- [ ] Accessibility improvements (ARIA labels)
- [ ] Mobile responsive refinements

## Sprint 2 (Advanced Features)

### Template Engine
- [ ] Integrate liquidjs for variable substitution
- [ ] Template helpers: `slug`, `pascal`, `camel`, `kebab`, `upper`, `lower`, `now`, `guid`
- [ ] Variable extraction from code
- [ ] Render API endpoint
- [ ] Variables panel in UI
- [ ] Preview pane for rendered output
- [ ] Download rendered snippet

### Encryption at Rest
- [ ] AES-GCM encryption service
- [ ] PBKDF2 key derivation from user passphrase
- [ ] Per-session key storage
- [ ] Encrypt code field on save
- [ ] Decrypt for viewing/editing
- [ ] Re-encryption on passphrase change
- [ ] Search strategy for encrypted content
- [ ] Settings page for encryption

### Duplicate Detection
- [ ] SimHash/MinHash implementation
- [ ] Similarity scoring
- [ ] Configurable threshold
- [ ] Warning on duplicate upload
- [ ] Optional block duplicate creation
- [ ] "Similar snippets" feature

### GitHub Gist Sync
- [ ] Gist token management (user settings)
- [ ] Push snippet to Gist
- [ ] Pull Gists as snippets
- [ ] Bidirectional sync
- [ ] Conflict resolution (latest updatedAt wins)
- [ ] Diff view for conflicts
- [ ] Sync status indicators
- [ ] Audit logging for sync actions

### UX Enhancements
- [ ] Global command palette (⌘K)
  - Quick actions: New, Search, Navigate
  - Fuzzy search
  - Keyboard navigation
- [ ] Advanced keyboard shortcuts
  - `⌘K` - Command palette
  - `⌘N` - New snippet
  - `/` - Focus search
  - `⌘F` - Toggle favorite
  - `⌘C` - Copy code
  - `⌘S` - Save
  - `Esc` - Close dialogs
- [ ] Recent items history
- [ ] Breadcrumb navigation
- [ ] Snippet versioning (history)

### Testing & Quality
- [ ] Comprehensive unit test coverage (>80%)
- [ ] E2E tests for all major flows
- [ ] Performance testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security audit
- [ ] Load testing

### Documentation
- [ ] Deployment guide (Vercel, Railway, self-hosted)
- [ ] Video tutorials
- [ ] Contributing guidelines
- [ ] API client libraries (TypeScript, Python)

## Future Enhancements (Post-Sprint 2)

### Collaboration
- [ ] Share snippets via public links
- [ ] Team workspaces
- [ ] Snippet comments
- [ ] Real-time collaboration
- [ ] Version control integration (Git)

### AI Features
- [ ] AI-powered code suggestions
- [ ] Code explanation
- [ ] Auto-tagging
- [ ] Similarity-based recommendations
- [ ] Code quality analysis

### Advanced Search
- [ ] Search by code structure (AST-based)
- [ ] Regex search
- [ ] Saved searches
- [ ] Search history
- [ ] Advanced query builder UI

### Import/Export
- [ ] Import from VS Code snippets
- [ ] Import from GitHub repositories
- [ ] Import from Stack Overflow
- [ ] Export to VS Code extension
- [ ] Export to Alfred/Raycast

### Editor Features
- [ ] Multiple file support
- [ ] Embedded terminal
- [ ] Code execution sandbox
- [ ] Live preview for HTML/CSS/JS
- [ ] Diff view for edits
- [ ] Split view for comparison

### Organization
- [ ] Nested collections
- [ ] Smart collections (dynamic filters)
- [ ] Snippet templates
- [ ] Snippets pinning
- [ ] Archive feature

### Integrations
- [ ] VS Code extension
- [ ] Alfred workflow
- [ ] Raycast extension
- [ ] Slack integration
- [ ] Discord bot
- [ ] CLI tool

### Analytics
- [ ] Usage analytics dashboard
- [ ] Popular snippets
- [ ] Language trends
- [ ] Search analytics
- [ ] Export reports

### Mobile
- [ ] Progressive Web App (PWA)
- [ ] React Native mobile app
- [ ] Offline support
- [ ] Mobile-optimized editor

### Performance
- [ ] Redis caching layer
- [ ] Read replicas for search
- [ ] CDN for static assets
- [ ] Background job queue (Bull/BullMQ)
- [ ] Elasticsearch for advanced search

### Administration
- [ ] Admin dashboard
- [ ] User management
- [ ] System health monitoring
- [ ] Backup/restore tools
- [ ] Rate limiting
- [ ] Analytics

### Monetization (Optional)
- [ ] Free tier with limits
- [ ] Pro plan with advanced features
- [ ] Team plans
- [ ] API access tiers

## Technical Debt & Improvements

### Code Quality
- [ ] Increase test coverage
- [ ] Refactor large components
- [ ] Extract shared hooks
- [ ] Optimize bundle size
- [ ] Remove unused dependencies

### Performance
- [ ] Implement React Query for all data fetching
- [ ] Add request deduplication
- [ ] Optimize database queries
- [ ] Add database query logging
- [ ] Implement caching strategy

### Security
- [ ] Add rate limiting
- [ ] Implement CAPTCHA for auth
- [ ] Add 2FA support
- [ ] Security headers (CSP, etc.)
- [ ] Regular dependency audits

### DevOps
- [ ] Docker Compose for local dev
- [ ] Kubernetes deployment config
- [ ] Monitoring with Sentry/DataDog
- [ ] Log aggregation
- [ ] Automated backups

### Documentation
- [ ] API versioning strategy
- [ ] Changelog automation
- [ ] Architecture decision records (ADRs)
- [ ] Performance benchmarks

## Release Strategy

### Version Numbers
- Sprint 1: v1.0.0 (MVP)
- Sprint 2: v2.0.0 (Advanced Features)
- Future: Semantic versioning (major.minor.patch)

### Release Process
1. Feature development in branches
2. Pull request with tests
3. Code review
4. Merge to `develop`
5. QA testing
6. Merge to `main`
7. Tag release
8. Deploy to production
9. Update changelog
10. Announce release

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## Feedback

We'd love to hear your feedback! Please open an issue on GitHub with:
- Feature requests
- Bug reports
- General feedback
- Documentation improvements

---

**Last Updated**: October 27, 2025
**Current Version**: v1.0.0-beta (Sprint 1 in progress)


