# TrustLedger — AICTE Centralized Security Deposit / FDR Management Portal

[![SIH Problem Statement](https://img.shields.io/badge/SIH%202024%2F2025-SIH26265-orange.svg?style=for-the-badge)](https://www.sih.gov.in/)
[![Organization](https://img.shields.io/badge/Organization-AICTE%20Regulation%20Bureau-1e3a8a.svg?style=for-the-badge)](https://www.aicte-india.org/)
[![GIGW Compliance](https://img.shields.io/badge/Standard-GIGW%203.0%20Compliant-green.svg?style=for-the-badge)](https://guidelines.india.gov.in/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20v2.0-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61dafb.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas%20Cloud-47a248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE)

> **Official Prototype for Problem Statement SIH26265**: Centralized Security Deposit / Fixed Deposit Receipt (FDR) Management, Anti-Fraud Pixel Forensics, Bank CBS Verification Gateway, Git-Style DAG Lineage Tracking, and 4-Gate Statutory Release Portal for the All India Council for Technical Education (AICTE), Ministry of Education, Government of India.

---

## 🏛️ Executive Background & Problem Context

Under Chapter IV and Clause 2.14 of the **AICTE Approval Process Handbook (APH)**, every technical and management institution in India must establish a mandatory Fixed Deposit Receipt (FDR) jointly held in the name of the **College Trust/Society** and the **Regional Officer / Member Secretary, AICTE** for a continuous lock-in period of **8 to 10 years** as financial surety.

### Current Regulatory Challenges
1. **Forgery & Tampered Certificates**: Scanned receipts altered in image editing software (e.g., modifying ₹15 Lakhs to ₹35 Lakhs).
2. **Missing Joint Lien Pledges**: Receipts created in the trust's name only without legal joint hypothecation in favor of AICTE.
3. **Unauthorized Encumbrance**: Collusive loans or overdraft facilities taken by colleges against security deposits without AICTE NOC.
4. **Lineage Disruption post Bank Mergers**: Over 10 years, scheduled commercial banks merge (e.g. Syndicate Bank $\rightarrow$ Canara Bank, Allahabad Bank $\rightarrow$ Indian Bank), causing paper trails to break.
5. **Silent Expiry & Compliance Risk**: FDRs lapse without timely renewal notifications, exposing institutional Extension of Approval (EoA) to regulatory penalties.

---

## ⚡ The 6 X-Factor Architectural Capabilities

TrustLedger solves these systemic challenges through six breakthrough subsystems:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TRUSTLEDGER CORE                                │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. Tri-Party Dual-Truth       │ Independent separation of College Claim,   │
│    Registry                   │ AI Forensics, and Authoritative Bank CBS.   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. Multimodal AI & Pixel      │ OpenCV Error Level Analysis (ELA), PyMuPDF  │
│    Forensics Lab              │ PDF parsing, Gemini OCR, pHash & Math ELA.  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. 3-Tier Bank Verification   │ NeSL API Webhook, Zero-Login OTP Magic Link │
│    Gateway                    │ for rural branches, and Nodal Bank Portal.  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. Git-Style DAG Lineage      │ Unbroken chronological Directed Acyclic     │
│    Graph                      │ Graph tracking 10-year renewals & mergers.  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 5. Temporal SLA Watchdog      │ Time-travel simulator triggering automated  │
│    (T-90, T-60, T-30, Lapsed) │ notices and EoA soft-holds upon maturity.   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 6. 4-Gate Statutory Release   │ Automated Tenure, Cross-Bureau ERP check,   │
│    & QR-Verifiable NOC        │ Scrutiny sign-off, and Competent Auth DSC.  │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 💻 Tech Stack & Frameworks

| Tier | Technologies / Libraries |
| :--- | :--- |
| **Frontend UI/UX** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React-Flow (DAG Lineage), Canvas ELA Heatmaps |
| **Design Standard** | **Guidelines for Indian Government Websites (GIGW 3.0)** — Light theme, official NIC header, tricolor accents |
| **Backend API** | FastAPI (Python 3.10+), Pydantic v2, Uvicorn, Python-Multipart |
| **NoSQL Database** | **MongoDB Atlas Cloud Cluster** with native BSON documents, dual-truth sub-objects, and index optimization |
| **Document Ingestion** | **PyMuPDF (`fitz`)** for high-resolution vector PDF rendering to in-memory buffers |
| **AI & Pixel Forensics** | **OpenCV** (Error Level Analysis), **Pillow**, **ImageHash** (pHash DCT), **Google Gemini GenAI** |
| **Cryptographic Ledger**| **SHA-256 Hash-Chained Audit Ledger** with mathematical Genesis link verification |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **MongoDB Atlas** or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/BBhargavKasiRam/TrustLedger.git
cd TrustLedger
```

### 2. Environment Configuration
Create a `.env` file in the repository root (or copy `.env.example`):
```bash
cp .env.example .env
```
Fill in your credentials:
```env
GEMINI_API_KEY="your-gemini-api-key"
MONGODB_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/"
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# Run initial seed and sample generator:
python seed.py

# Start the FastAPI daemon:
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 4. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://127.0.0.1:5173`.

---

## 🎯 SIH26265 Grand Finale Evaluation Scenarios

The portal contains built-in demo scenarios matching the exact evaluation criteria of the problem statement:

| Scenario # | Testing Mandate | Interactive Demonstration |
| :---: | :--- | :--- |
| **1** | **New FDR Submission** | Open *Document Upload & Verification*, select *1. Genuine SBI ₹35L*, run automated OCR + ELA + Math validation, and submit to registry. |
| **2** | **Validity & Tri-Party Tracking** | Inspect the *FDR Verification Log*. Columns clearly isolate Institution Claims vs. Machine Forensics vs. Authoritative Bank CBS. |
| **3** | **Approaching Maturity (SLA Watchdog)** | Open *Demo Controls* $\rightarrow$ *Temporal SLA Watchdog*. Simulate `+30 Days`: see automated WhatsApp/SMS dispatch notices; simulate `+180 Days`: see stark `[⚠ COMPLIANCE AT RISK]` soft-hold badge. |
| **4** | **Renewal & Bank Merger DAG** | Open *Deposit History*. Inspect the React-Flow graph tracking Syndicate Bank (2016) $\rightarrow$ Canara Bank post-merger replacement (2020) without breaking lineage. |
| **5** | **Discrepancy Identification** | Select *2. Tampered Principal ₹15L $\rightarrow$ ₹35L*. View the OpenCV Error Level Analysis heatmap overlay ($0.87$ score) and Compound Interest Math anomaly flag. |
| **6** | **Authorized 4-Gate Release** | Navigate to *Release, Discharge, or Refund Workflow*. Clear Gate 1 (Tenure), Gate 2 (Cross-Bureau ERP), Gate 3 (Scrutiny Sign-Off), and Gate 4 (Competent Authority DSC) to mint a QR-verifiable Discharge NOC. |

---

## 🛡️ Security, Forensics & Audit Guarantee

- **Zero-Downtime Guarantee**: If external networks or API services stall, the backend automatically engages deterministic offline parsers with zero HTTP 500 crashes.
- **Microsecond Precision Normalization**: All audit ledger timestamps are normalized to prevent BSON date rounding from corrupting cryptographic hash integrity.
- **Printable e-Note Summary**: Officers can click `[🖨️ Export Scrutiny e-Note (PDF)]` to generate formal A4 case summaries with officer signature blocks.

---

## 📂 Repository Structure

```
TrustLedger/
├── backend/
│   ├── main.py                 # FastAPI application & REST routing
│   ├── database.py             # MongoDB Atlas connection & collection refs
│   ├── models.py               # Pydantic BSON document models with Dual-Truth
│   ├── schemas.py              # Request & Response API schemas
│   ├── audit_service.py        # SHA-256 hash-chained audit engine
│   ├── forensics_engine.py     # OpenCV ELA, PyMuPDF, Gemini OCR, pHash
│   ├── bank_gateway.py         # NeSL Tier-1 CBS & Tier-2 Zero-Login OTP portal
│   ├── lineage_engine.py       # DAG lineage graph & Temporal SLA watchdog
│   ├── release_engine.py       # 4-Gate statutory release & QR NOC minter
│   ├── seed.py                 # MongoDB synthetic evaluation dataset seeder
│   ├── requirements.txt        # Python backend dependencies
│   └── static/                 # Static assets, uploads, and sample certificates
├── frontend/
│   ├── src/
│   │   ├── components/         # GIGW 3.0 Government UI workbenches
│   │   ├── services/api.ts     # Axios API client
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   ├── App.tsx             # Main portal application
│   │   └── main.tsx            # Application entry point
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.ts          # Vite build & reverse-proxy configuration
│   └── tailwind.config.js      # Government tricolor utility theme
├── .env.example                # Sanitized environment template
├── .gitignore                  # Production git ignore configuration
├── ARCHITECTURE.md             # In-depth architectural & mathematical manual
├── CONTRIBUTING.md             # Code contribution & commit standards
├── LICENSE                     # MIT Open Source License
├── SECURITY.md                 # Vulnerability disclosure policy
└── README.md                   # Project overview & documentation
```

---

## 📜 Regulatory Disclaimer

*TrustLedger is developed as an authentic technology prototype for the Smart India Hackathon (SIH26265) under the guidelines of the All India Council for Technical Education (AICTE). Simulated bank marks, IFSC registries, and college names are used solely for evaluation scenarios.*
