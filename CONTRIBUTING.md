# Contributing to TrustLedger

Thank you for your interest in contributing to **TrustLedger** (AICTE Security Deposit / FDR Regulatory Management Portal).

## Development Philosophy
TrustLedger is engineered under the Guidelines for Indian Government Websites (GIGW 3.0) and adheres to strict FinTech regulatory standards for statutory security deposit tracking.

## Code Structure
- `/backend`: Python FastAPI application utilizing MongoDB NoSQL, OpenCV pixel forensics, PyMuPDF, and Google Gemini GenAI.
- `/frontend`: React 19 + TypeScript single-page application built on Vite and Tailwind CSS.

## Branching Strategy
- `main`: Production-ready release branch evaluated during SIH competitions.
- `feat/*`: Feature additions.
- `fix/*`: Bug and edge-case resolution.

## Commit Message Conventions
Follow the Conventional Commits specification:
- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix or discrepancy resolution.
- `docs`: Documentation updates.
- `refactor`: Code restructuring without API contract changes.
- `test`: Adding or updating test suites.

## Quality Standards
1. **Frontend**: Must pass `npm run build` (`tsc -b && vite build`) with zero type errors.
2. **Backend**: Endpoints must return consistent Pydantic models with normalized IDs.
3. **Audit Ledger Integrity**: Any mutation to FDR instruments must commit a cryptographically valid SHA-256 block via `record_audit_log()`.
