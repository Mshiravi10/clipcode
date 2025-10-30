# Contributing to ClipCode

First off, thank you for considering contributing to ClipCode! It's people like you that make ClipCode such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. We pledge to make participation in our project a harassment-free experience for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed** and what you expected
- **Include details about your environment** (OS, Node version, browser)

### Suggesting Features

Feature suggestions are welcome! Please:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the proposed feature
- **Explain why this feature would be useful** to most users
- **List any alternatives** you've considered

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Add tests** if applicable
4. **Update documentation** if you changed APIs
5. **Ensure tests pass** by running `pnpm test`
6. **Ensure code is formatted** by running `pnpm format`
7. **Create a pull request** with a clear description

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14 or higher
- pnpm 8.x or higher

### Getting Started

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/clipcode.git
cd clipcode

# Install dependencies
pnpm install

# Set up environment variables
cd apps/web
cp env.example .env
# Edit .env with your values

# Set up database
createdb clipcode
psql clipcode -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
pnpm db:migrate
pnpm db:seed

# Start development server
cd ../..
pnpm dev
```

Visit http://localhost:3000

## Project Structure

```
clipcode/
├── apps/web/              # Main Next.js application
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   ├── lib/             # Utility functions
│   └── prisma/          # Database schema
├── docs/                 # Documentation
└── .github/             # GitHub workflows
```

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Enable strict mode
- Avoid `any` types
- Use proper type annotations

### React

- Use functional components
- Prefer Server Components when possible
- Use React hooks appropriately
- Follow React best practices

### Naming Conventions

- **Files**: kebab-case (e.g., `snippet-card.tsx`)
- **Components**: PascalCase (e.g., `SnippetCard`)
- **Functions**: camelCase (e.g., `fetchSnippets`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_SNIPPETS`)

### Code Style

We use Prettier for code formatting. Run before committing:

```bash
pnpm format
```

We use ESLint for linting. Check with:

```bash
pnpm lint
```

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests after the first line

Examples:
```
Add snippet version history feature

- Implement version tracking in Prisma schema
- Add API endpoints for version CRUD
- Create UI for viewing version history
- Add tests for version functionality

Fixes #123
```

### Branch Naming

- `feature/` - New features (e.g., `feature/add-tags`)
- `fix/` - Bug fixes (e.g., `fix/search-crash`)
- `docs/` - Documentation (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-logic`)
- `test/` - Adding tests (e.g., `test/search-service`)

## Testing

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing features
- Aim for high test coverage
- Use descriptive test names

Example:
```typescript
describe('searchSnippets', () => {
  it('should return snippets matching the search query', async () => {
    // Arrange
    const query = 'react hooks';
    
    // Act
    const results = await searchSnippets(query);
    
    // Assert
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('react');
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Update API docs for API changes
- Add JSDoc comments for complex functions
- Include examples in documentation

## Database Changes

When modifying the database schema:

1. Update `prisma/schema.prisma`
2. Create a migration: `pnpm prisma migrate dev --name your_migration_name`
3. Update seed data if necessary
4. Test migrations on a fresh database

## Performance Considerations

- Avoid N+1 queries (use Prisma `include` or `select`)
- Use pagination for large datasets
- Optimize images and assets
- Monitor bundle size
- Use React Server Components when possible

## Security

- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries (Prisma handles this)
- Follow OWASP best practices
- Report security issues privately

## Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by at least one maintainer
3. **Discussion** of approach and implementation
4. **Approval** before merging

## Questions?

- Check the [documentation](docs/)
- Search [existing issues](https://github.com/Mshiravi10/clipcode/issues)
- Ask in [discussions](https://github.com/Mshiravi10/clipcode/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ClipCode! 🎉

