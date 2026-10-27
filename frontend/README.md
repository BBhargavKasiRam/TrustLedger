# VidyaKosh — Frontend Client (GIGW 3.0)

Frontend administrative user interface for **VidyaKosh (SIH26265)**, designed in strict adherence with the **Guidelines for Indian Government Websites (GIGW 3.0)** light theme and AICTE corporate identity standards.

---

## 🛠️ Technology Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Government GIGW 3.0 palette: AICTE Navy `#0F2942`, Tri-color accents, subtle border radials)
- **Icons**: Lucide React
- **Lineage Visualization**: Custom SVG & React-Flow DAG node renderer
- **API Client**: Axios

---

## 🏛️ Workbenches & Components

| Component | Purpose & Problem Statement Scenario |
| :--- | :--- |
| `DualTruthRegistry.tsx` | Centralized Security Deposit / FDR Repository with instrument-wise records distinguishing College Claim, AI Forensics, and Bank Confirmation. |
| `ForensicsIngestionLab.tsx` | Document Upload & Multi-Layer Forensics (PyMuPDF, OpenCV ELA heatmap overlay, Compound Math validation, Gemini OCR). |
| `BankGatewayWorkbench.tsx` | 3-Tier Bank Verification Gateway (NeSL Core Banking API simulation & Tier-2 Zero-Login OTP Magic Link). |
| `DAGLineageViewer.tsx` | Deposit History DAG Lineage Graph tracking renewals and bank merger instrument replacements. |
| `TemporalSLAWatchdog.tsx` | Temporal SLA Watchdog & Time-Travel Simulator testing T-90, T-60, T-30 notifications and overdue compliance soft-holds. |
| `FourGateReleaseDesk.tsx` | 4-Gate Release, Discharge, or Refund Workflow issuing QR-verifiable Discharge NOC and printable Scrutiny Case Summary (e-Note). |
| `DemoControlsDrawer.tsx` | SIH26265 Evaluation Scenarios Check matrix and demo navigation shortcuts for hackathon jury evaluation. |

---

## 🚀 Running the Frontend

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build production bundle
npm run build
```

The frontend server runs locally at `http://127.0.0.1:5173` and proxies API requests to the FastAPI backend running at `http://127.0.0.1:8000`.
