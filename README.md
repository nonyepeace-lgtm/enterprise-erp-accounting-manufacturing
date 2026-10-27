# Enterprise ERP Accounting and Manufacturing System

A TypeScript/Express starter backend for an enterprise ERP concept focused on accounting, manufacturing, inventory, and tax operations. The current code is an early-stage prototype; several endpoints use in-memory calculations and do not yet persist financial transactions through Prisma.

## Phase 1 status

The repository includes the initial implementation for Phase 1:

- Authentication model and role structure
- Company setup
- Chart of accounts
- Double-entry journal engine
- Accounting period controls
- Audit trail service
- Financial calculation utilities
- Test cases written for critical accounting scenarios (execution status must be verified locally or in CI)

## Architectural principles

1. The accounting ledger is the system of record.
2. Every financial event must flow through the general ledger.
3. Accounting periods enforce control and close processes.
4. Auditability is built into every transaction.
5. Tax rules are configuration-driven, never hardcoded in UI.
6. Each phase must be functionally complete before moving forward.

## Project structure

- `src/app.ts` — Express application bootstrap
- `src/routes/*.ts` — API route entry points
- `src/services/accounting/*.ts` — accounting services and calculations
- `prisma/schema.prisma` — core database schema for entities, journal entries, and audit trail
- `tests/accounting.phase1.test.ts` — critical financial logic tests

## Core flows implemented

- Chart of accounts starter pack for a Nigerian manufacturing business
- Journal validation for debit = credit
- Reversal entries
- Period close checklist enforcement
- Permission checks for approval and close actions
- Financial calculations for:
  - inventory valuation
  - cost of goods sold
  - production cost
  - payroll net pay
  - VAT, PAYE, WHT
  - depreciation

## Run locally

1. Install Node.js (LTS) and a supported npm version.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` (for SQLite, for example `file:./dev.db`).
4. Run `npx prisma generate`.
5. Run `npm run build` and `npm test`.
6. Start the server with `npm start` and check `GET /health`.

**Status note:** these commands are the intended verification path. Do not treat the project as production-ready until build, tests, database migrations, authentication, authorization, persistence, and security review have been run and confirmed.

## Naming and regulatory direction

This Phase 1 foundation is deliberately designed to support enterprise manufacturing operations in Nigeria and to be extensible to IFRS-based reporting requirements, tax compliance, and manufacturing cost control.
