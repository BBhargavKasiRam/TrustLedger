# Security Policy & Governance

## Overview
**TrustLedger** manages statutory fixed deposit instruments (FDRs) locked for 10-year lock-in periods under Chapter IV of the AICTE Approval Process Handbook (APH). Security, integrity, and anti-tampering are fundamental architectural tenets.

## Core Security Pillars
1. **Immutable Cryptographic Audit Trail**:
   - Every mutation (submission, CBS attestation, SLA transition, 4-gate release) is sealed in a sequential SHA-256 hash-chained block.
   - Any historical tampering immediately breaks the chain and flags the compromised block ID.
2. **Tri-Party Dual-Truth Isolation**:
   - Strictly separates Institution Claimed Data, AI OCR Forensics Extraction, and Bank Core Banking Confirmation.
   - Neither the institution nor a rogue officer can unilaterally mark an unconfirmed FDR as verified.
3. **Zero-Trust Magic Link Verification**:
   - Rural bank managers receive signed single-use cryptographic tokens with 2FA OTP codes.
   - Bank manager email addresses are strictly validated against RBI official scheduled commercial bank domain whitelists.
4. **Multimodal Pixel Forensics**:
   - OpenCV Error Level Analysis (ELA) identifies digital image doctoring (Photoshop manipulation).
   - Perceptual Hashing (`imagehash.phash`) detects duplicate scan attacks across different colleges.

## Reporting a Vulnerability
If you discover a security vulnerability, please submit an advisory directly to the project maintainers rather than opening a public issue.
