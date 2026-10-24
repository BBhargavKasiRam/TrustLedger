# TrustLedger — AICTE Centralized Security Deposit / FDR Management Portal

**Smart India Hackathon Prototype | Problem Statement ID: SIH26265**  
*Organization: All India Council for Technical Education (AICTE), Ministry of Education, Government of India*

---

| Regulatory Category | Details |
| :--- | :--- |
| **Problem Statement ID** | **SIH26265** |
| **Organization** | All India Council for Technical Education (AICTE) — Regulation & Approval Bureau |
| **Mandate** | AICTE Approval Process Handbook (APH), Clause 2.14 & Chapter IV Norms |
| **Design Standard** | Guidelines for Indian Government Websites (GIGW 3.0) — Official light theme |
| **Architecture** | FastAPI + React 19 TypeScript + Cloud MongoDB NoSQL + OpenCV Pixel Forensics |

---

## 🏛️ Problem Statement Context & Regulatory Challenge

Under Chapter IV of the **AICTE Approval Process Handbook (APH)**, technical and higher education institutions in India are statutorily required to establish a mandatory Fixed Deposit Receipt (FDR) held **jointly with the Regional Officer / Member Secretary, AICTE** for a continuous lock-in duration of **8 to 10 years** as financial surety.

Historically, the manual processing of thousands of physical and scanned FDR certificates has exposed the regulatory council to significant operational vulnerabilities:

1. **Digital Document Forgery**: Institutions submitting scanned certificates where deposit figures have been altered using image editing tools (e.g., modifying ₹15 Lakhs to ₹35 Lakhs).
2. **Missing Joint Lien Mandates**: Certificates created in the sole name of the institution's trust without legal joint hypothecation in favor of AICTE.
3. **Unauthorized Third-Party Encumbrance**: Collusive loans or overdraft credit lines sanctioned against statutory deposits without AICTE clearance.
4. **Lineage Disruption Across Bank Mergers**: Over 10-year lock-in terms, public sector banks merge (e.g., Syndicate Bank amalgamating into Canara Bank), breaking manual paper trails.
5. **Silent Expiry & Compliance Risk**: Deposits maturing without automated alerts, leaving institutional Extension of Approval (EoA) in regulatory jeopardy.

---

## ⚡ Core Technical Architecture & Features

TrustLedger addresses the mandate of SIH26265 through six integrated subsystems:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TRUSTLEDGER ARCHITECTURE                         │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ 1. Centralized Repository     │ Tri-Party data model isolating College      │
│    (Instrument-wise Records)  │ Claim, Machine Forensics, and Bank Truth.   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 2. Document Upload &          │ PyMuPDF vector rendering, OpenCV Error Level│
│    Multi-Layer AI Forensics   │ Analysis (ELA), Gemini OCR, and Math Check. │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 3. 3-Tier Bank Verification   │ NeSL API Webhook, Zero-Login OTP Magic Link │
│    Gateway                    │ for rural branches, and Nodal Bank Portal.  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 4. Deposit History DAG        │ Unbroken chronological Directed Acyclic     │
│    Lineage Graph              │ Graph tracking renewals and bank mergers.   │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 5. Temporal SLA Watchdog      │ Automated maturity alerts (T-90, T-60, T-30)│
│    & Notice Engine            │ and compliance soft-holds on overdue FDRs.  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ 6. Release, Discharge &       │ 4-Gate Clearance (Tenure, ERP, Scrutiny,    │
│    Refund Workflow            │ Authority DSC) with QR-verifiable NOC.      │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

### 1. Centralized Security Deposit / FDR Repository
- Strict separation of data streams:
  - **College Claimed Information**: Particulars submitted by the institution's nodal officer.
  - **AI & Forensics Extraction**: Verified parameters extracted directly from document pixels and text streams.
  - **Authoritative Bank Confirmation**: Live Core Banking ledger attestation.

### 2. Document Upload & Multi-Layer Forensics Lab
- **PyMuPDF Ingestion**: High-resolution vector PDF rendering to in-memory buffers for forensic scanning.
- **OpenCV Error Level Analysis (ELA)**: Detects compression rate disparities across image pixel grids, generating visual tamper heatmaps for edited amounts.
- **Quarterly Compound Interest Verification**: Mathematically recalculates expected maturity:
  $$A = P \times \left(1 + \frac{r}{400}\right)^{4 \times t}$$
  Identifies discrepancies where declared principal contradicts actual certificate maturity yield.
- **Perceptual Hashing (pHash)**: 64-bit DCT fingerprint comparison flagging recycled duplicate scans across different institutions.
- **Resilient AI Extraction**: Google Gemini multimodal document ingestion backed by instant deterministic regex parsing fallbacks for 100% demo uptime.

### 3. 3-Tier Hybrid Bank Verification Gateway
- **Tier 1 (Core Banking / NeSL API)**: Direct API link simulating scheduled commercial bank core banking ledger verification.
- **Tier 2 (Zero-Login Cryptographic Magic Link)**: Dispatches a signed, time-limited token with 2FA OTP to branch managers of rural cooperative branches without API infrastructure.
- **Domain Whitelisting**: Strict verification ensuring communications route exclusively to official bank domains (`@sbi.co.in`, `@canarabank.com`, `@hdfcbank.com`, `@pnb.co.in`).

### 4. Deposit History (Git-Style DAG Lineage)
- Models renewals and bank mergers as Directed Acyclic Graphs (DAG).
- When a bank merges (e.g. Syndicate Bank $\rightarrow$ Canara Bank) or an FDR is renewed, parent nodes transition to `RENEWED_SUPERSEDED` while maintaining permanent historical traceability back to the initial Genesis deposit.
- Rendered using clean government document card nodes and directional blue lineage arrows.

### 5. Temporal SLA Watchdog & Time-Travel Simulator
- Monitors lock-in maturity countdowns.
- Automatic escalation triggers:
  - **T-90 / T-60 Days**: Early warning advisories dispatched to college dashboards.
  - **T-30 Days**: Automated SMS and WhatsApp urgent advisories dispatched to College Principal.
  - **T=0 (Lapsed / Overdue)**: Applies an automated regulatory compliance soft-hold to the institution's annual Extension of Approval (EoA).

### 6. Release, Discharge, or Refund Workflow
- Enforces 4 sequential approval gates before releasing the AICTE joint lien:
  - **Gate 1**: Continuous Statutory Lock-in (8–10 continuous years verified across lineage + clean bank lien).
  - **Gate 2**: Cross-Bureau ERP Compliance (Verifies zero unpaid faculty salary grievances, zero student fee ombudsman penalties, and zero active court cases).
  - **Gate 3**: Regional Scrutiny Officer formal verification.
  - **Gate 4**: Competent Authority (Member Secretary) Digital Signature Certificate (DSC) sign-off.
- Generates a cryptographically signed Discharge NOC certificate with an embedded verification QR code and SHA-256 certificate digest.
- Printable A4 **Scrutiny Case Summary (e-Note)** with dedicated officer signature and official seal blocks.

---

## 🛠️ Technology Stack

| Layer | Component |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite, Tailwind CSS |
| **Lineage Visualization**| React-Flow Directed Acyclic Graph canvas |
| **Backend Framework** | FastAPI (Python 3.10+), Pydantic v2, Uvicorn |
| **Database** | MongoDB Atlas Cloud (NoSQL document store with Dual-Truth schema) |
| **PDF & Imaging** | PyMuPDF (`fitz`), Pillow, OpenCV Headless, ImageHash |
| **AI Extraction** | Google Gemini Multimodal GenAI with offline fallback engines |
| **Audit Security** | SHA-256 Cryptographically Hash-Chained Audit Ledger |

---

## 🚀 Running the Prototype Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **MongoDB**: MongoDB Atlas Cloud cluster or local MongoDB instance

### 2. Environment Configuration
Create a `.env` file in the root folder (reference [`.env.example`](./.env.example)):
```env
GEMINI_API_KEY="your-gemini-api-key"
MONGODB_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/"
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment:
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt

# Seed MongoDB database with AICTE test institutions and evaluation FDRs:
python seed.py

# Launch the FastAPI backend:
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API docs are available at `http://127.0.0.1:8000/docs`.

### 4. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://127.0.0.1:5173` in your browser.

---

## 📋 SIH26265 Evaluation Scenarios Check

The prototype includes built-in scenarios directly aligned with the Smart India Hackathon problem statement mandate:

1. **New FDR Submission**: Open *Document Upload & Verification*, upload or pick a preset receipt, execute automated OCR extraction, verify compound interest math, and submit to the central repository.
2. **Validity & Tri-Party Tracking**: Inspect the *Centralized Security Deposit/FDR Repository*. Clear column headers isolate institution-submitted information, machine forensics, and bank-confirmed data.
3. **Approaching Maturity (SLA Watchdog)**: In *Demo Controls* $\rightarrow$ *Temporal SLA Watchdog*, simulate `+30 Days` to inspect automated alerts, or simulate `+180 Days` to observe the `[⚠ COMPLIANCE AT RISK]` soft-hold badge on the institution profile.
4. **Renewal & Replacement Lineage**: Open *Deposit History* to view the unbroken DAG lineage graph tracking Syndicate Bank (2016) $\rightarrow$ Canara Bank (2020) replacement without losing historical deposit continuity.
5. **Discrepancy Identification**: Select the tampered preset (*Vanguard College*). Inspect the OpenCV Error Level Analysis heatmap overlay ($0.87$ tamper score) and the mathematical yield discrepancy warning.
6. **Authorized Release Processing**: Navigate to *Release, Discharge, or Refund Workflow*. Clear Gate 1 (Tenure), Gate 2 (Cross-Bureau ERP), Gate 3 (Scrutiny Sign-Off), and Gate 4 (Authority DSC) to issue the official QR-verifiable Discharge NOC.

---

## 📁 Repository Structure

```
TrustLedger/
├── backend/
│   ├── main.py                 # FastAPI application routes & endpoints
│   ├── database.py             # MongoDB Atlas connection & collection refs
│   ├── models.py               # Pydantic BSON document models with Dual-Truth
│   ├── schemas.py              # Pydantic request/response validation schemas
│   ├── audit_service.py        # SHA-256 hash-chained audit ledger service
│   ├── forensics_engine.py     # OpenCV ELA, PyMuPDF, Gemini OCR, pHash
│   ├── bank_gateway.py         # NeSL Tier-1 CBS & Tier-2 Zero-Login OTP portal
│   ├── lineage_engine.py       # DAG lineage graph & Temporal SLA watchdog
│   ├── release_engine.py       # 4-Gate statutory release & QR NOC engine
│   ├── seed.py                 # MongoDB synthetic evaluation dataset seeder
│   ├── requirements.txt        # Python backend dependencies
│   └── static/                 # Sample certificates, uploads, and assets
├── frontend/
│   ├── src/
│   │   ├── components/         # GIGW 3.0 Government UI workbenches
│   │   ├── services/api.ts     # Axios API client
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   ├── App.tsx             # Main portal application
│   │   └── main.tsx            # React application entry point
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.ts          # Vite build configuration
│   └── tailwind.config.js      # GIGW 3.0 government styling
├── .env.example                # Sanitized environment template
├── .gitignore                  # Production git ignore configuration
├── ARCHITECTURE.md             # Technical architecture manual
├── LICENSE                     # MIT Open Source License
├── SECURITY.md                 # Security & audit integrity overview
└── README.md                   # Project documentation
```

---

*This application was built as a solution prototype for Smart India Hackathon (SIH26265) to modernize the All India Council for Technical Education (AICTE) Fixed Deposit Receipt and Security Deposit regulatory infrastructure.*
