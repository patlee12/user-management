# Claude Code Context for User Management

This directory contains coding standards and workflows for the **user-management** monorepo.

## Structure

- **`frontend-standards.md`** - TypeScript/React/Next.js conventions
- **`backend-standards.md`** - NestJS/Prisma/PostgreSQL conventions
- **`workflows.md`** - Post-change review, testing, and commit processes

## How Claude Uses These Files

Claude Code automatically reads `.claude/` at conversation start and applies these standards when:

- Writing new code
- Refactoring existing code
- Reviewing changes
- Proposing tests and documentation updates

## Quick Reference

### Frontend
- **camelCase** everything (functions, variables)
- **PascalCase** for components and types
- **JSDoc required** for all exports
- **Import from `@user-management/types`** before defining new types
- **Pure functions first**, isolate side effects

### Backend
- **Module-based architecture** (NestJS modules per feature)
- **DTOs** with class-validator decorators
- **Services** for business logic, **Controllers** for routing
- **Prisma** for all database access
- **Guards** for auth, **Filters** for exceptions
- **Swagger decorators** for API docs

### Workflows
- **TodoWrite** tool tracks all multi-step tasks
- **Post-Change Review** proposes tests + README updates after code changes
- **Git commits** include descriptive messages with context

## Cross-Cutting Rules

1. **TypeScript everywhere** - no plain JS for new code
2. **Test business logic** - Jest with `.spec.ts` suffix
3. **No secrets in code** - use `.env` files
4. **Validate all inputs** - DTOs on backend, guards on frontend
5. **Accessibility matters** - ARIA labels, keyboard support
6. **Security first** - argon2 hashing, rate limiting, CORS

## When Standards Conflict

1. **Existing code patterns** take precedence (consistency over perfection)
2. **Security > convenience** (always validate, never trust inputs)
3. **Simplicity > cleverness** (readable code beats clever code)

## Updating These Standards

These files are living documents. Update them when:

- New patterns emerge in the codebase
- Team decides on new conventions
- Tools/frameworks change (Next.js updates, etc.)

Keep standards concise and actionable.
