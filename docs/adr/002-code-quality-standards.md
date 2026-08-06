# ADR-002: Code Quality Standards

**Status:** Accepted  
**Date:** 2026-08-06  
**Decision Makers:** Arpan Mandal

## Context

Codebases without enforced standards drift toward large files, untyped code, and inconsistent patterns. The previous monolith had a 627-line content.ts and 120+ `any` types before cleanup.

## Decision

Enforce the following as ESLint errors (CI blocks on violation):

| Rule | Value | Rationale |
|------|-------|-----------|
| max-lines | 300 | Forces decomposition into focused modules |
| max-lines-per-function | 75 | Keeps functions testable and readable |
| max-params | 4 | Forces options objects for complex signatures |
| no-explicit-any | error | Zero type holes |
| no-console | error | Use Logger class instead |
| no-unused-vars | error | No dead code |
| import/order | error | Consistent import grouping |
| explicit-function-return-type | error (exports) | Documented public API |
| max-depth | 4 | No deeply nested logic |

## Documentation Requirements

- **CODEMAP.md** per app — architecture map with file responsibilities
- **OpenAPI/Swagger** — auto-generated from swagger-jsdoc annotations at `/api-docs`
- **JSDoc** — all exported functions documented
- **ADR** — major architectural decisions recorded

## Consequences

- **Positive:** Consistent, maintainable codebase. New contributors can onboard via CODEMAP. API consumers get Swagger docs.
- **Negative:** Stricter rules slow down initial development. Some refactoring needed to stay under limits.
- **Tooling:** Turborepo for build orchestration. No service workers ever (past incident with stale caches).
