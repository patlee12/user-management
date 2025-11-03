# Workflows — Post-Change Review, Testing, Commits

> **Purpose**: Consistent processes for reviewing changes, proposing tests, and creating commits.
> **Goal**: Ensure code quality, comprehensive testing, and clear git history.

---

## Post-Change Review Process

After making **code changes** (edits, new files, refactors), follow this workflow:

### Step 1: Complete Code Changes

- Make all necessary edits to implement the feature/fix
- Ensure code follows standards (frontend or backend)
- Run linter/formatter if applicable
- **Do NOT write tests or update README yet**

### Step 2: Create Post-Change Review (Auto-Prompt)

Use the **TodoWrite** tool to track the review process:

```
Todos:
1. ✅ Implement feature X
2. 🔄 Generate Post-Change Review
3. ⏳ Write proposed tests
4. ⏳ Update README
5. ⏳ Create git commit
```

Generate a **Post-Change Review** section that includes:

#### A. Proposed Unit Tests

**Format:**
```
File: path/to/test-file.spec.ts

Tests to add:
- ✓ should compute price per sqft correctly
- ✓ should return undefined for invalid inputs
- ✓ should round to nearest whole number
- ✓ should handle zero sqft edge case
```

**What to propose:**
- File path where tests should be added
- List of test cases (describe what each asserts)
- Edge cases and guard clauses to test
- Mock requirements (if testing services/API calls)

#### B. Proposed README Updates

**Format:**
```
Section: "API Endpoints"

Add:
- POST /api/users - Create new user (requires auth)

Update:
- Authentication section - mention new MFA flow
```

**What to propose:**
- Which sections to update/add
- Concise snippets of what changed
- Examples if new features added
- Migration notes if breaking changes

#### C. Proposed Changelog Entry

**Format:**
```
2025-11-01: Add price-per-sqft calculator with rounding logic
```

**What to include:**
- Today's date (YYYY-MM-DD)
- Concise description of what changed
- Type of change (feature, fix, refactor, docs)

#### D. Type Reuse Check

**Format:**
```
New types added in this change:
- EditableUser (src/types/user.ts)
  ✓ Extends User from @user-management/types (correct pattern)

- LoginFormData (src/components/login-form.tsx)
  ✗ Duplicates LoginRequest from @user-management/types
  → Recommendation: Import LoginRequest instead
```

**What to check:**
- List all new types/interfaces added
- Check if equivalent exists in `@user-management/types`
- Propose replacing duplicates with imports
- Note valid extensions (when local UI state needed)

### Step 3: Wait for Approval

**Stop and present the Post-Change Review to the user.**

Do NOT proceed with:
- Writing test files
- Editing README
- Creating git commits

The user will:
- Approve the review as-is
- Request modifications
- Ask for specific tests to be prioritized

### Step 4: Implement Approved Changes

After user approval:

1. **Write tests** (use proposed test cases)
2. **Run tests** to ensure they pass
3. **Update README** (apply proposed edits)
4. **Create git commit** (see commit process below)

---

## Testing Workflow

### Frontend Tests (Jest + React Testing Library)

**File naming:** `component-name.test.tsx` or `utility.test.ts`

**Location:** Colocate with source (`app/components/login-form.test.tsx`)

**Example test structure:**

```ts
// compute-price-per-sqft.test.ts
import { computePricePerSqFt } from './compute-price-per-sqft';

describe('computePricePerSqFt', () => {
  describe('valid inputs', () => {
    it('should compute and round correctly', () => {
      expect(computePricePerSqFt(250000, 1200)).toBe(208);
    });

    it('should round up when >= 0.5', () => {
      expect(computePricePerSqFt(250500, 1200)).toBe(209);
    });
  });

  describe('invalid inputs', () => {
    it('should return undefined for undefined numerator', () => {
      expect(computePricePerSqFt(undefined, 1200)).toBeUndefined();
    });

    it('should return undefined for zero sqft', () => {
      expect(computePricePerSqFt(250000, 0)).toBeUndefined();
    });

    it('should return undefined for negative values', () => {
      expect(computePricePerSqFt(-1000, 1200)).toBeUndefined();
    });
  });
});
```

**Component tests:**

```tsx
// login-form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('should render email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should call onSubmit with form data', () => {
    const handleSubmit = jest.fn();
    render(<LoginForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Backend Tests (Jest + NestJS Testing)

**File naming:** `service-name.service.spec.ts` or `controller-name.controller.spec.ts`

**Location:** Colocate with source (`modules/users/users.service.spec.ts`)

**Example service test:**

```ts
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Running Tests

```bash
# Frontend tests (from apps/frontend/homepage-app)
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report

# Backend tests (from apps/backend)
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- users.service  # Run specific test file
```

### Test Coverage Goals

- **Unit tests**: Pure functions, services, calculations (aim for 80%+)
- **Component tests**: User interactions, state changes (critical paths)
- **E2E tests**: Auth flows, critical user journeys (smoke tests)

**Don't test:**
- Third-party libraries
- Trivial getters/setters
- Generated code (Prisma client)
- Configuration files

---

## Git Commit Process

### When to Commit

Only create commits when:
1. **User explicitly requests it** ("create a commit", "commit these changes")
2. **Feature is complete** and tests pass
3. **README/docs updated** if applicable

**Never commit:**
- Partial implementations
- Failing tests
- Secrets or sensitive data
- Generated files (in `.gitignore`)

### Commit Message Format

```
<type>: <concise summary>

<optional body with context>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactor (no functional change)
- `docs:` - Documentation only
- `test:` - Test additions/fixes
- `chore:` - Build, config, deps updates
- `perf:` - Performance improvement
- `style:` - Code style (formatting, linting)

**Examples:**

```
feat: add price-per-sqft calculator with rounding logic

Implements computePricePerSqFt helper that rounds to nearest whole
number for consistent UI display. Includes guard clauses for invalid
inputs (undefined, zero, negative values).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
fix: handle undefined user in profile component

Adds guard clause to return loading state when user is undefined.
Prevents runtime error when user data hasn't loaded yet.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Workflow

1. **Review changes** with `git status` and `git diff`
2. **Run tests** to ensure they pass
3. **Stage files** with `git add`
4. **Create commit** with descriptive message
5. **Verify** with `git log` and `git show`

**Use TodoWrite to track:**

```
Todos:
1. ✅ Implement feature
2. ✅ Write tests
3. ✅ Update README
4. 🔄 Create git commit
5. ⏳ Push to remote (if requested)
```

---

## README Update Guidelines

### What to Update

Update README when:
- **New features** added (document usage)
- **API changes** (endpoints, params, responses)
- **Configuration changes** (new env vars, settings)
- **Setup steps change** (new dependencies, migration steps)
- **Breaking changes** (document migration path)

### Sections to Maintain

**apps/frontend/homepage-app/README.md:**
- Features
- Getting Started
- Environment Variables
- Project Structure
- Development Scripts
- Deployment

**apps/backend/README.md:**
- API Endpoints
- Authentication
- Environment Variables
- Database Schema
- Running Locally
- Testing
- Deployment

**Root README.md:**
- Project Overview
- Monorepo Structure
- Quick Start
- Development Workflow
- Deployment Options

### README Style

- **Concise** - one sentence per concept
- **Examples** - show don't tell
- **Current** - remove outdated info
- **Scannable** - use headings, lists, code blocks

---

## Type Reuse Enforcement

### Why Type Reuse Matters

- **Single source of truth** - API contracts defined once
- **Automatic updates** - regenerate types when backend changes
- **Fewer bugs** - type mismatches caught at compile time
- **Less maintenance** - don't update types in two places

### Check Before Defining Types

**Before creating a new type:**

1. Search `@user-management/types`:
   ```ts
   import type { User, LoginRequest, LoginResponse } from '@user-management/types';
   ```

2. If ≈80% match exists, **extend** instead of redefine:
   ```ts
   import type { User } from '@user-management/types';

   type EditableUser = User & {
     isEditing: boolean;
   };
   ```

3. If no match, **define locally** but document why:
   ```ts
   /**
    * LocalFilterState
    * ---------------------------------------------------------------------------
    * UI-only state for table filters. Not part of API contract.
    * Backend doesn't know about this shape.
    */
   type LocalFilterState = {
     searchQuery: string;
     selectedTags: string[];
   };
   ```

### Post-Change Type Audit

In the **Post-Change Review**, always include:

```
Type Reuse Check:
- ✓ EditableUser: extends User from @types (valid)
- ✗ LoginFormData: duplicates LoginRequest from @types
  → Replace with: import type { LoginRequest } from '@user-management/types'
```

---

## Checklist Before Requesting Review

Use this checklist before presenting code for review:

### Code Quality
- [ ] Follows naming conventions (camelCase, PascalCase)
- [ ] JSDoc on all exported functions/types
- [ ] No `any` types (unless truly necessary)
- [ ] No magic numbers (use named constants)
- [ ] Guard clauses for invalid inputs
- [ ] Immutable patterns (no param mutation)

### Type Safety
- [ ] Checked `@user-management/types` for existing types
- [ ] Used `import type` for type-only imports
- [ ] Extended types instead of redefining
- [ ] Documented local types with JSDoc

### Testing
- [ ] Unit tests for business logic
- [ ] Component tests for user interactions
- [ ] Edge cases covered (undefined, empty, invalid)
- [ ] Tests pass locally

### Documentation
- [ ] README updated (if feature/API changed)
- [ ] JSDoc explains "why" not just "what"
- [ ] Examples in JSDoc for complex functions
- [ ] Swagger decorators on backend endpoints

### Security
- [ ] No secrets in code
- [ ] Inputs validated (DTOs on backend, guards on frontend)
- [ ] Passwords hashed with argon2
- [ ] Auth guards on protected routes

### Git
- [ ] No generated files staged
- [ ] Commit message follows format
- [ ] Only staging relevant files
- [ ] Pre-commit hooks pass

---

## When in Doubt

1. **Ask before committing** - if unclear, ask user first
2. **Test before proposing** - run code to verify it works
3. **Document decisions** - explain why in JSDoc/comments
4. **Keep it simple** - readable beats clever
5. **Consistency wins** - follow existing patterns in codebase
