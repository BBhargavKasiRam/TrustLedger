import os
import sys
import datetime
import fitz
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Load environment configuration
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv()

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "dsptqi2w3")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY") or os.getenv("CLAUDINARY_API_KEY", "419553366225425")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "AltvUd1yCfxvaLd5Gwn6AjjxMFo")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
VAULT_DIR = os.path.join(STATIC_DIR, "vault")
SAMPLE_FDRS_DIR = os.path.join(STATIC_DIR, "sample_fdrs")

def create_bank_attestation_pdf(fdr_uid, bank_name, ifsc, manager_email, principal, mat_date, lien_status, remarks):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    outer_rect = fitz.Rect(20, 20, 575, 822)
    page.draw_rect(outer_rect, color=(0.06, 0.25, 0.45), width=2)
    inner_rect = fitz.Rect(25, 25, 570, 817)
    page.draw_rect(inner_rect, color=(0.7, 0.55, 0.2), width=1)
    
    page.insert_text((130, 60), f"{bank_name.upper()} • CORE BANKING SYSTEM", fontsize=13, fontname="helv", color=(0.06, 0.2, 0.4))
    page.insert_text((170, 78), "STATUTORY DEPOSIT VERIFICATION & ATTESTATION CERTIFICATE", fontsize=8, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text((180, 92), f"Branch IFSC: {ifsc} • CBS Gateway Tier-2 Stamped", fontsize=8, fontname="helv", color=(0.5, 0.5, 0.5))
    
    title_box = fitz.Rect(40, 110, 555, 138)
    page.draw_rect(title_box, color=(0.06, 0.2, 0.4), fill=(0.06, 0.2, 0.4))
    page.insert_text((75, 128), "OFFICIAL CORE BANKING ATTESTATION & LIEN ENDORSEMENT", fontsize=11, fontname="helv", color=(1, 1, 1))

    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%d-%b-%Y %H:%M:%S UTC")
    y = 168
    fields = [
        ("Security Deposit UID:", fdr_uid),
        ("Depository Bank & Branch:", f"{bank_name} (IFSC: {ifsc})"),
        ("Attesting Branch Officer:", manager_email),
        ("CBS Confirmed Principal Corpus:", f"INR {principal:,.2f}"),
        ("CBS Confirmed Maturity Date:", str(mat_date)),
        ("Statutory Joint Lien Status:", lien_status),
        ("AICTE Joint Holder Clause:", "Confirmed active joint holder 'Member Secretary, AICTE'"),
        ("Lock-in Encumbrance State:", "Strict 10-Year Lock-in Norms Enforced • No Premature Withdrawal Allowed"),
        ("CBS Digital Verification Date:", now_utc),
        ("Branch Officer Comments:", remarks),
    ]

    for label, val in fields:
        page.insert_text((45, y), label, fontsize=8.5, fontname="helv", color=(0.25, 0.25, 0.25))
        page.insert_text((220, y), val, fontsize=8.5, fontname="helv", color=(0.05, 0.05, 0.05))
        y += 24

    directive_box = fitz.Rect(40, y + 20, 555, y + 80)
    page.draw_rect(directive_box, color=(0.8, 0.8, 0.8), fill=(0.96, 0.98, 0.99))
    page.insert_text((50, y + 38), "BANK CBS MANDATE & LIEN UNDERTAKING:", fontsize=8.5, fontname="helv", color=(0.06, 0.2, 0.4))
    page.insert_text((50, y + 54), "This certificate confirms that the statutory deposit is maintained under strict regulatory lock-in.", fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text((50, y + 68), "No loans, advances, or premature liquidation can be executed without AICTE Member Secretary DSC NOC.", fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))

    page.insert_text((45, 800), "GENERATED VIA CORE BANKING SYSTEM SECURE ZERO-LOGIN ATTESTATION GATEWAY", fontsize=7, fontname="helv", color=(0.4, 0.4, 0.4))
    return doc.write()

def create_noc_pdf(fdr_uid, inst_name, inst_pid, principal, bank_name, ifsc):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    outer_rect = fitz.Rect(20, 20, 575, 822)
    page.draw_rect(outer_rect, color=(0.1, 0.22, 0.45), width=2.5)
    inner_rect = fitz.Rect(25, 25, 570, 817)
    page.draw_rect(inner_rect, color=(0.7, 0.55, 0.2), width=1)
    
    page.insert_text((130, 60), "ALL INDIA COUNCIL FOR TECHNICAL EDUCATION", fontsize=13, fontname="helv", color=(0.06, 0.15, 0.35))
    page.insert_text((170, 78), "STATUTORY REGULATORY BODY • GOVERNMENT OF INDIA", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))
    page.insert_text((185, 92), "Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070", fontsize=7.5, fontname="helv", color=(0.5, 0.5, 0.5))
    
    title_box = fitz.Rect(40, 110, 555, 138)
    page.draw_rect(title_box, color=(0.06, 0.15, 0.35), fill=(0.06, 0.15, 0.35))
    page.insert_text((75, 128), "OFFICIAL STATUTORY DISCHARGE NOC & LIEN RELEASE ORDER", fontsize=11, fontname="helv", color=(1, 1, 1))

    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%d-%b-%Y %H:%M:%S UTC")
    y = 168
    fields = [
        ("NOC Reference No:", f"AICTE/REG/NOC/{fdr_uid}/{datetime.datetime.now().year}"),
        ("Beneficiary Institution:", f"{inst_name}"),
        ("AICTE Permanent ID (PID):", f"{inst_pid}"),
        ("Security Deposit UID:", f"{fdr_uid}"),
        ("Depository Bank & Branch:", f"{bank_name} (IFSC: {ifsc})"),
        ("Released Principal Corpus:", f"INR {principal:,.2f}"),
        ("Lock-in Compliance Status:", "Satisfied continuous statutory 10-year lock-in tenure (Gate 1 Passed)"),
        ("Cross-Bureau Clearances:", "ERP Defaulter Registry Clear: 0 Court Cases, 0 PGRC Violations (Gate 2 Passed)"),
        ("Scrutiny Sign-Off:", "Regional Scrutiny Officer Verification Complete (Gate 3 Passed)"),
        ("Executive Authority Mandate:", "Exercising statutory power under Section 10(1) AICTE Act (Gate 4 Approved)"),
        ("Issuing Competent Authority:", "Prof. Rajive Kumar (Member Secretary, AICTE)"),
        ("DSC Verification Timestamp:", now_utc),
    ]

    for label, val in fields:
        page.insert_text((45, y), label, fontsize=8.5, fontname="helv", color=(0.25, 0.25, 0.25))
        page.insert_text((220, y), val, fontsize=8.5, fontname="helv", color=(0.05, 0.05, 0.05))
        y += 24

    directive_box = fitz.Rect(40, y + 20, 555, y + 80)
    page.draw_rect(directive_box, color=(0.8, 0.8, 0.8), fill=(0.97, 0.98, 0.99))
    page.insert_text((50, y + 38), "STATUTORY MANDATE TO ISSUING BANK:", fontsize=8.5, fontname="helv", color=(0.06, 0.15, 0.35))
    page.insert_text((50, y + 54), "The Depository Bank is hereby directed to unconditionally lift AICTE joint lien and refund the matured", fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))
    page.insert_text((50, y + 68), "corpus directly into the verified institution bank account in compliance with AICTE APH.", fontsize=8, fontname="helv", color=(0.2, 0.2, 0.2))

    page.insert_text((45, 800), "ISSUED UNDER DIGITAL SIGNATURE (DSC) OF THE COMPETENT AUTHORITY • VIDYAKOSH REGULATION BUREAU", fontsize=7, fontname="helv", color=(0.4, 0.4, 0.4))
    return doc.write()

def create_forensic_report_pdf(fdr_uid, inst_name, inst_pid, flags):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    outer_rect = fitz.Rect(20, 20, 575, 822)
    page.draw_rect(outer_rect, color=(0.6, 0.15, 0.15), width=2)
    
    page.insert_text((130, 60), "AICTE FORENSIC DOCUMENT VERIFICATION BUREAU", fontsize=13, fontname="helv", color=(0.6, 0.15, 0.15))
    page.insert_text((180, 78), "AUTOMATED TAMPER DETECTION & ELA AUDIT REPORT", fontsize=8.5, fontname="helv", color=(0.4, 0.4, 0.4))
    
    title_box = fitz.Rect(40, 100, 555, 128)
    page.draw_rect(title_box, color=(0.6, 0.15, 0.15), fill=(0.6, 0.15, 0.15))
    page.insert_text((120, 118), "DISCREPANCY FLAGGED • FORENSIC INTEGRITY AUDIT", fontsize=11, fontname="helv", color=(1, 1, 1))

    now_utc = datetime.datetime.now(datetime.timezone.utc).strftime("%d-%b-%Y %H:%M:%S UTC")
    y = 158
    fields = [
        ("Security Deposit UID:", fdr_uid),
        ("Target Institution:", inst_name),
        ("AICTE Permanent ID:", inst_pid),
        ("Analysis Engine Version:", "AICTE Forensic Vision v2.4 (ELA + OCR Math)"),
        ("Pixel Tamper Score (ELA):", "0.84 (CRITICAL ANOMALY DETECTED)"),
        ("Mathematical Consistency:", "MISMATCH: Principal ₹35,00,000 declared vs ₹15,00,000 bank ledger"),
        ("Detected Anomaly Type:", "Pixel Artifacts & Local Resampling on Principal Amount Numeric Field"),
        ("Audit Timestamp:", now_utc),
    ]

    for label, val in fields:
        page.insert_text((45, y), label, fontsize=8.5, fontname="helv", color=(0.25, 0.25, 0.25))
        page.insert_text((220, y), val, fontsize=8.5, fontname="helv", color=(0.05, 0.05, 0.05))
        y += 24

    page.insert_text((45, y + 20), "Active Forensic Flags:", fontsize=9, fontname="helv", color=(0.6, 0.15, 0.15))
    y += 40
    for f in flags:
        page.insert_text((55, y), f"• {f}", fontsize=8.5, fontname="helv", color=(0.2, 0.2, 0.2))
        y += 18

    page.insert_text((45, 800), "CONFIDENTIAL FORENSIC AUDIT RECORD • FOR OFFICIAL AICTE SCRUTINY BUREAU REVIEW ONLY", fontsize=7, fontname="helv", color=(0.4, 0.4, 0.4))
    return doc.write()

def upload_file(file_bytes, filename, fdr_uid, doc_type, is_pdf=False):
    # 1. Save local copy in vault
    folder_dir = os.path.join(VAULT_DIR, fdr_uid)
    os.makedirs(folder_dir, exist_ok=True)
    local_path = os.path.join(folder_dir, filename)
    with open(local_path, "wb") as f:
        f.write(file_bytes)
    
    # 2. Upload to Cloudinary
    cld_folder = f"vidyakosh_fdrs/{fdr_uid}"
    clean_name = os.path.splitext(filename)[0]
    res_type = "raw" if is_pdf else "auto"
    pub_id = f"{filename}" if is_pdf else clean_name

    print(f"Uploading {filename} to {cld_folder} (type={res_type})...")
    res = cloudinary.uploader.upload(
        file_bytes,
        folder=cld_folder,
        public_id=pub_id,
        resource_type=res_type,
        overwrite=True
    )
    url = res.get("secure_url") or res.get("url")
    print(f"  -> SUCCESS: {url}")
    return url

def main():
    print("=== POPULATING CLOUDINARY VAULT REPOSITORY ===")
    
    # Manifest of all 5 FDRs
    fdr_manifest = [
        {
            "uid": "FDR-2016-101",
            "inst_name": "Apex Institute of Technology, Lucknow",
            "inst_pid": "1-100200301",
            "bank_name": "Syndicate Bank",
            "ifsc": "SYNB0001234",
            "manager_email": "cbs.verifier@syndicatebank.in",
            "principal": 3500000.0,
            "mat_date": "2020-04-14",
            "sample_img": "sample_1_genuine_sbi.jpg",
            "docs": [
                {"type": "CERTIFICATE", "file": "Original_Deposit_Certificate_FDR-2016-101.jpg"},
                {"type": "ATTESTATION", "file": "Bank_Attestation_FDR-2016-101.pdf", "remarks": "Syndicate Bank branch CBS confirmed joint lien in favor of Member Secretary AICTE."}
            ]
        },
        {
            "uid": "FDR-2020-205",
            "inst_name": "Apex Institute of Technology, Lucknow",
            "inst_pid": "1-100200301",
            "bank_name": "Canara Bank",
            "ifsc": "CNRB0001234",
            "manager_email": "bm.hazratganj@canarabank.com",
            "principal": 3500000.0,
            "mat_date": "2026-10-28",
            "sample_img": "sample_1_genuine_sbi.jpg",
            "docs": [
                {"type": "CERTIFICATE", "file": "Original_Deposit_Certificate_FDR-2020-205.jpg"},
                {"type": "ATTESTATION", "file": "Bank_Attestation_FDR-2020-205.pdf", "remarks": "Canara Bank CBS confirmation stamped by Hazratganj branch manager following Syndicate merger."},
                {"type": "NOC", "file": "Statutory_Discharge_NOC_FDR-2020-205.pdf"}
            ]
        },
        {
            "uid": "FDR-2026-309",
            "inst_name": "Vanguard College of Engineering, Pune",
            "inst_pid": "1-200400502",
            "bank_name": "State Bank of India",
            "ifsc": "SBIN0001234",
            "manager_email": "bm.shivajinagar@sbi.co.in",
            "principal": 3500000.0,
            "mat_date": "2031-03-15",
            "sample_img": "sample_2_tampered_principal_pune.jpg",
            "docs": [
                {"type": "CERTIFICATE", "file": "Original_Deposit_Certificate_FDR-2026-309.jpg"},
                {"type": "FORENSIC", "file": "Forensic_Scrutiny_Report_FDR-2026-309.pdf", "flags": [
                    "DATA_MISMATCH: Declared Principal ₹35,00,000 differs from CBS records",
                    "TAMPER_DETECTED: ELA Score 0.84 on principal digits",
                    "LIEN_ENCUMBRANCE_FOUND: Third-party commercial loan encumbrance active"
                ]}
            ]
        },
        {
            "uid": "FDR-2018-412",
            "inst_name": "Deccan Institute of Technology, Kolhapur",
            "inst_pid": "1-300600703",
            "bank_name": "Bank of Maharashtra",
            "ifsc": "MAHB0001234",
            "manager_email": "cbs.manager@bankofmaharashtra.in",
            "principal": 3500000.0,
            "mat_date": (datetime.date.today() + datetime.timedelta(days=29)).strftime("%Y-%m-%d"),
            "sample_img": "sample_3_missing_clause_deccan.jpg",
            "docs": [
                {"type": "CERTIFICATE", "file": "Original_Deposit_Certificate_FDR-2018-412.jpg"},
                {"type": "ATTESTATION", "file": "Bank_Attestation_FDR-2018-412.pdf", "remarks": "Deposit maturing within 29 days (T-30 Final Renewal Notice Window active)."}
            ]
        },
        {
            "uid": "FDR-2018-519",
            "inst_name": "Shivalik Institute of Engineering & Technology, Dehradun",
            "inst_pid": "1-400800904",
            "bank_name": "Punjab National Bank",
            "ifsc": "PUNB0001234",
            "manager_email": "bm.rajpurroad@pnb.co.in",
            "principal": 3500000.0,
            "mat_date": (datetime.date.today() - datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
            "sample_img": "sample_4_duplicate_shivalik.jpg",
            "docs": [
                {"type": "CERTIFICATE", "file": "Original_Deposit_Certificate_FDR-2018-519.jpg"},
                {"type": "ATTESTATION", "file": "Bank_Attestation_FDR-2018-519.pdf", "remarks": "Maturity elapsed 5 days ago without timely statutory renewal under APH Norms."}
            ]
        }
    ]

    results = {}

    for item in fdr_manifest:
        fdr_uid = item["uid"]
        results[fdr_uid] = []
        sample_path = os.path.join(SAMPLE_FDRS_DIR, item["sample_img"])
        with open(sample_path, "rb") as f:
            img_bytes = f.read()

        for doc in item["docs"]:
            doc_type = doc["type"]
            filename = doc["file"]
            
            if doc_type == "CERTIFICATE":
                url = upload_file(img_bytes, filename, fdr_uid, "certificate", is_pdf=False)
                results[fdr_uid].append({
                    "documentType": "Original FDR Deposit Certificate",
                    "fileUrl": url,
                    "uploadedBy": "INSTITUTE_NODAL_OFFICER",
                    "timestamp": f"{item['mat_date'][:4]}-04-15T10:00:00Z"
                })
            elif doc_type == "ATTESTATION":
                pdf_bytes = create_bank_attestation_pdf(
                    fdr_uid, item["bank_name"], item["ifsc"], item["manager_email"],
                    item["principal"], item["mat_date"], "ACTIVE_JOINT_AICTE", doc["remarks"]
                )
                url = upload_file(pdf_bytes, filename, fdr_uid, "attestation", is_pdf=True)
                results[fdr_uid].append({
                    "documentType": "Bank Attestation PDF",
                    "fileUrl": url,
                    "uploadedBy": "BANK_BRANCH_MANAGER",
                    "timestamp": f"{item['mat_date'][:4]}-04-16T15:30:00Z"
                })
            elif doc_type == "NOC":
                pdf_bytes = create_noc_pdf(
                    fdr_uid, item["inst_name"], item["inst_pid"], item["principal"], item["bank_name"], item["ifsc"]
                )
                url = upload_file(pdf_bytes, filename, fdr_uid, "discharge_noc", is_pdf=True)
                results[fdr_uid].append({
                    "documentType": "Discharge NOC",
                    "fileUrl": url,
                    "uploadedBy": "COMPETENT_AUTHORITY",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                })
            elif doc_type == "FORENSIC":
                pdf_bytes = create_forensic_report_pdf(
                    fdr_uid, item["inst_name"], item["inst_pid"], doc["flags"]
                )
                url = upload_file(pdf_bytes, filename, fdr_uid, "forensic_report", is_pdf=True)
                results[fdr_uid].append({
                    "documentType": "Forensic Analysis Report",
                    "fileUrl": url,
                    "uploadedBy": "AICTE_SCRUTINY_OFFICER",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
                })

    import json
    with open(os.path.join(BASE_DIR, "vault_urls.json"), "w") as f:
        json.dump(results, f, indent=2)

    print("\n=== CLOUDINARY VAULT POPULATION COMPLETED SUCCESSFULLY ===")
    print(f"Generated URLs saved to {os.path.join(BASE_DIR, 'vault_urls.json')}")

if __name__ == "__main__":
    main()
