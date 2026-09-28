# Enterprise ERP Accounting and Manufacturing System

This repository is the foundation for a genuine enterprise ERP focused on accounting, manufacturing, inventory, and tax operations with a strong emphasis on auditability and financial integrity.

## Phase 1 status

The repository includes the initial implementation for Phase 1:

- Authentication model and role structure
- Company setup
- Chart of accounts
- Double-entry journal engine
- Accounting period controls
- Audit trail service
- Financial calculation utilities
- Automated tests covering critical accounting scenarios

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

## Recommended next actions

1. Run `npm install`
2. Run `npx prisma generate`
3. Run `npm test`
4. Create the next phase implementation for suppliers/customers/purchasing/sales

## Naming and regulatory direction

This Phase 1 foundation is deliberately designed to support enterprise manufacturing operations in Nigeria and to be extensible to IFRS-based reporting requirements, tax compliance, and manufacturing cost control.
