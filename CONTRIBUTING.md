# Contributing

Thanks for your interest in contributing to `@flyrank/dna`.

## Development Setup

1. Install dependencies:
   ```bash
   bun install
   ```
2. Build once:
   ```bash
   bun run build
   ```
3. Run tests:
   ```bash
   bun run test
   ```
4. Run lint:
   ```bash
   bun run lint
   ```

## Contribution Guidelines

- Keep changes focused and small.
- Prefer robust, typed TypeScript with clear interfaces.
- Reuse existing helpers instead of duplicating logic.
- Add or update tests when behavior changes.
- Update `README.md` when public API changes.

## Pull Request Checklist

- [ ] Code builds successfully (`bun run build`)
- [ ] Lint passes (`bun run lint`)
- [ ] Tests pass (`bun run test`)
- [ ] Documentation updated if needed
- [ ] No unrelated files changed

## Commit Style

Use clear commit messages, for example:

- `feat: add combined AI wrapper method`
- `fix: harden markdown formatter against undefined arrays`
- `docs: update SDK method examples`

## Reporting Issues

When opening an issue, include:

- package version (`@flyrank/dna`)
- Node version
- OS/runtime (local, Vercel, etc.)
- minimal reproduction steps
- expected vs actual behavior
- full error output
