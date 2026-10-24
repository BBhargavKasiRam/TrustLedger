import os
import io
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import cv2
import numpy as np

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
SAMPLE_FDRS_DIR = os.path.join(STATIC_DIR, "sample_fdrs")
os.makedirs(SAMPLE_FDRS_DIR, exist_ok=True)

def get_font(size: int, bold: bool = False):
    """Loads Arial or fallback font."""
    font_name = "arialbd.ttf" if bold else "arial.ttf"
    font_path = os.path.join("C:\\Windows\\Fonts", font_name)
    if os.path.exists(font_path):
        try:
            return ImageFont.truetype(font_path, size)
        except Exception:
            pass
    return ImageFont.load_default()

def draw_watermark(draw: ImageDraw.ImageDraw, text: str, width: int, height: int):
    """Draws a subtle diagonal regulatory watermark."""
    font = get_font(42, bold=True)
    # Draw centered watermark text
    draw.text((width // 2 - 380, height // 2 - 40), text, fill=(235, 238, 245), font=font)
    draw.text((width // 2 - 420, height // 2 + 20), "REGULATORY SECURITY DEPOSIT ESCROW", fill=(235, 238, 245), font=get_font(28, bold=True))

def draw_security_border(draw: ImageDraw.ImageDraw, width: int, height: int, color=(26, 54, 93)):
    """Draws an authentic multi-line bank security certificate border."""
    draw.rectangle([15, 15, width - 15, height - 15], outline=color, width=4)
    draw.rectangle([22, 22, width - 22, height - 22], outline=(197, 160, 89), width=2)  # Gold trim
    draw.rectangle([28, 28, width - 28, height - 28], outline=color, width=1)
    
    # Corner ornaments
    corner_size = 20
    for cx, cy in [(15, 15), (width - 15, 15), (15, height - 15), (width - 15, height - 15)]:
        draw.rectangle([cx - corner_size, cy - 2, cx + corner_size, cy + 2], fill=(197, 160, 89))
        draw.rectangle([cx - 2, cy - corner_size, cx + 2, cy + corner_size], fill=(197, 160, 89))

def draw_aicte_stamp(img: Image.Image, x: int, y: int, valid: bool = True):
    """Draws a realistic circular regulatory ink stamp."""
    stamp = Image.new("RGBA", (220, 220), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(stamp)
    color = (76, 29, 149, 210) if valid else (185, 28, 28, 210) # Purple ink or Red ink
    
    # Outer & inner circles
    s_draw.ellipse([5, 5, 215, 215], outline=color, width=4)
    s_draw.ellipse([18, 18, 202, 202], outline=color, width=2)
    s_draw.ellipse([32, 32, 188, 188], outline=color, width=1)
    
    s_font = get_font(13, bold=True)
    xs_font = get_font(11, bold=True)
    
    if valid:
        s_draw.text((28, 48), "AICTE REGULATORY", fill=color, font=s_font)
        s_draw.text((42, 68), "SECURITY LIEN", fill=color, font=s_font)
        s_draw.text((26, 95), "★ NO PREMATURE ★", fill=color, font=xs_font)
        s_draw.text((36, 115), "ENCASHMENT", fill=color, font=xs_font)
        s_draw.text((28, 140), "GOVT OF INDIA / AICTE", fill=color, font=xs_font)
    else:
        s_draw.text((32, 55), "REGULAR DEPOSIT", fill=color, font=s_font)
        s_draw.text((28, 85), "SUBJECT TO BANK LIEN", fill=color, font=xs_font)
        s_draw.text((38, 115), "BRANCH ADVANCES", fill=color, font=xs_font)
        s_draw.text((45, 140), "COMMERCIAL", fill=color, font=xs_font)
        
    # Rotate slightly for authentic tilted stamp look
    stamp = stamp.rotate(12, resample=Image.BICUBIC)
    img.paste(stamp, (x, y), stamp)

def generate_sample_1_genuine():
    """Sample 1: Clean & Compliant SBI FDR (₹35L Principal, ₹61.98L Maturity, AICTE Joint Lien)."""
    width, height = 1300, 880
    img = Image.new("RGB", (width, height), (254, 253, 250))
    draw = ImageDraw.Draw(img)
    
    draw_security_border(draw, width, height, color=(26, 54, 93))
    draw_watermark(draw, "ALL INDIA COUNCIL FOR TECHNICAL EDUCATION", width, height)
    
    # Bank Header (State Bank of India)
    draw.rectangle([35, 35, width - 35, 120], fill=(26, 54, 93))
    draw.text((55, 45), "STATE BANK OF INDIA", fill=(255, 255, 255), font=get_font(28, bold=True))
    draw.text((55, 82), "LUCKNOW MAIN BRANCH (00125) • IFSC: SBIN0000125 • PHONE: 0522-2234567", fill=(210, 225, 245), font=get_font(14, bold=False))
    draw.text((width - 320, 52), "SPECIAL TERM DEPOSIT", fill=(245, 190, 80), font=get_font(20, bold=True))
    draw.text((width - 320, 82), "SECURITY RECEIPT", fill=(245, 190, 80), font=get_font(15, bold=True))
    
    # Subheader & Meta Box
    draw.line([35, 140, width - 35, 140], fill=(197, 160, 89), width=2)
    
    meta_y = 155
    draw.text((55, meta_y), "FDR RECEIPT NO:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((190, meta_y - 2), "FDR-2026-881", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((500, meta_y), "AICTE PERMANENT ID:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((680, meta_y - 2), "1-100200301", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((950, meta_y), "DATE OF ISSUE:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((1070, meta_y - 2), "24/10/2026", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    # Customer Details Box
    draw.rectangle([50, 195, width - 50, 310], outline=(203, 213, 225), fill=(248, 250, 252), width=1)
    draw.text((65, 205), "DEPOSITOR / INSTITUTION NAME:", fill=(100, 116, 139), font=get_font(12, bold=True))
    draw.text((65, 225), "APEX INSTITUTE OF TECHNOLOGY, LUCKNOW (UTTAR PRADESH)", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((65, 255), "REGULATORY JOINT HOLDER CLAUSE:", fill=(100, 116, 139), font=get_font(12, bold=True))
    draw.text((65, 275), "JOINTLY IN THE NAME OF APEX INSTITUTE OF TECHNOLOGY AND SECRETARY, AICTE", fill=(16, 120, 75), font=get_font(15, bold=True))
    
    # Financial Terms Table
    table_y = 330
    draw.rectangle([50, table_y, width - 50, 560], outline=(203, 213, 225), fill=(255, 255, 255), width=2)
    # Table header
    draw.rectangle([50, table_y, width - 50, table_y + 40], fill=(241, 245, 249))
    draw.line([50, table_y + 40, width - 50, table_y + 40], fill=(203, 213, 225), width=1)
    
    draw.text((70, table_y + 12), "FINANCIAL PARTICULARS", fill=(71, 85, 105), font=get_font(13, bold=True))
    draw.text((500, table_y + 12), "DECLARED VALUE", fill=(71, 85, 105), font=get_font(13, bold=True))
    draw.text((850, table_y + 12), "COMPUTED VALUE / IN WORDS", fill=(71, 85, 105), font=get_font(13, bold=True))
    
    rows = [
        ("Principal Deposit Amount:", "Rs. 35,00,000.00", "Rupees Thirty-Five Lakhs Only", 385),
        ("Annual Interest Rate:", "7.25% p.a.", "Compounded Quarterly (Standard FD)", 425),
        ("Tenure / Period:", "8 Years (96 Months)", "From 24-10-2026 to 24-10-2034", 465),
        ("Maturity Value at Expiry:", "Rs. 61,98,842.00", "Rupees Sixty-One Lakhs Ninety-Eight Thousand Eight Hundred Forty-Two Only", 505)
    ]
    
    for label, val1, val2, ry in rows:
        draw.line([50, ry + 30, width - 50, ry + 30], fill=(241, 245, 249), width=1)
        draw.text((70, ry), label, fill=(100, 116, 139), font=get_font(13, bold=True))
        draw.text((500, ry), val1, fill=(15, 23, 42), font=get_font(15, bold=True))
        draw.text((850, ry), val2, fill=(51, 65, 85), font=get_font(12, bold=False))
        
    # Mandatory AICTE Conditions
    draw.rectangle([50, 580, width - 50, 675], outline=(16, 185, 129), fill=(240, 253, 244), width=1)
    draw.text((65, 590), "MANDATORY REGULATORY DECLARATION & LIEN CLAUSE:", fill=(21, 128, 61), font=get_font(12, bold=True))
    draw.text((65, 612), "1. NO LIEN / NO PREMATURE ENCASHMENT ALLOWED WITHOUT PRIOR WRITTEN NOC FROM AICTE REGULATION BUREAU.", fill=(15, 23, 42), font=get_font(13, bold=True))
    draw.text((65, 635), "2. Security deposit created pursuant to AICTE Approval Process Handbook (APH 2026-27 Norm: Rs. 35,00,000 for Engineering Degree).", fill=(51, 65, 85), font=get_font(12, bold=False))
    draw.text((65, 653), "3. Bank undertakes not to advance any overdraft / credit facility against this fixed deposit instrument.", fill=(51, 65, 85), font=get_font(12, bold=False))
    
    # Signatures & Stamps
    draw_aicte_stamp(img, 980, 680, valid=True)
    
    # Signatures
    draw.line([100, 780, 320, 780], fill=(100, 116, 139), width=1)
    draw.text((120, 785), "AUTHORIZED SIGNATORY", fill=(100, 116, 139), font=get_font(11, bold=True))
    draw.text((135, 755), "K. R. Narayanan", fill=(30, 41, 59), font=get_font(16, bold=False))
    
    draw.line([500, 780, 720, 780], fill=(100, 116, 139), width=1)
    draw.text((545, 785), "BRANCH MANAGER", fill=(100, 116, 139), font=get_font(11, bold=True))
    draw.text((535, 755), "S. P. Srivastava", fill=(30, 41, 59), font=get_font(16, bold=False))
    draw.text((520, 802), "State Bank of India, Lucknow", fill=(100, 116, 139), font=get_font(11, bold=False))
    
    out_path = os.path.join(SAMPLE_FDRS_DIR, "sample_1_genuine_sbi.jpg")
    img.save(out_path, "JPEG", quality=95)
    return out_path

def generate_sample_2_tampered():
    """
    Sample 2: Tampered Principal SBI Pune (Vanguard College).
    Actual deposit is ₹15,00,000 (Maturity ₹26,56,646 @ 7.25% for 8y).
    Digitally forged to read ₹35,00,000 in Principal box, leaving maturity ₹26,56,646 unchanged.
    Includes compressed JPEG artifact patch over the Principal area to trigger strong ELA heatmap hotspot.
    """
    width, height = 1300, 880
    img = Image.new("RGB", (width, height), (254, 253, 250))
    draw = ImageDraw.Draw(img)
    
    draw_security_border(draw, width, height, color=(26, 54, 93))
    draw_watermark(draw, "ALL INDIA COUNCIL FOR TECHNICAL EDUCATION", width, height)
    
    # Bank Header (State Bank of India - Pune Branch)
    draw.rectangle([35, 35, width - 35, 120], fill=(26, 54, 93))
    draw.text((55, 45), "STATE BANK OF INDIA", fill=(255, 255, 255), font=get_font(28, bold=True))
    draw.text((55, 82), "PUNE CAMPUS BRANCH (01423) • IFSC: SBIN0001423 • PHONE: 020-2567890", fill=(210, 225, 245), font=get_font(14, bold=False))
    draw.text((width - 320, 52), "SPECIAL TERM DEPOSIT", fill=(245, 190, 80), font=get_font(20, bold=True))
    draw.text((width - 320, 82), "SECURITY RECEIPT", fill=(245, 190, 80), font=get_font(15, bold=True))
    
    draw.line([35, 140, width - 35, 140], fill=(197, 160, 89), width=2)
    
    meta_y = 155
    draw.text((55, meta_y), "FDR RECEIPT NO:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((190, meta_y - 2), "FDR-2026-992", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((500, meta_y), "AICTE PERMANENT ID:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((680, meta_y - 2), "1-400500602", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((950, meta_y), "DATE OF ISSUE:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((1070, meta_y - 2), "24/10/2026", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    # Customer Details Box
    draw.rectangle([50, 195, width - 50, 310], outline=(203, 213, 225), fill=(248, 250, 252), width=1)
    draw.text((65, 205), "DEPOSITOR / INSTITUTION NAME:", fill=(100, 116, 139), font=get_font(12, bold=True))
    draw.text((65, 225), "VANGUARD COLLEGE OF ENGINEERING, PUNE (MAHARASHTRA)", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((65, 255), "REGULATORY JOINT HOLDER CLAUSE:", fill=(100, 116, 139), font=get_font(12, bold=True))
    draw.text((65, 275), "JOINTLY IN THE NAME OF VANGUARD COLLEGE AND REGIONAL OFFICER, AICTE", fill=(16, 120, 75), font=get_font(15, bold=True))
    
    # Financial Terms Table
    table_y = 330
    draw.rectangle([50, table_y, width - 50, 560], outline=(203, 213, 225), fill=(255, 255, 255), width=2)
    draw.rectangle([50, table_y, width - 50, table_y + 40], fill=(241, 245, 249))
    draw.line([50, table_y + 40, width - 50, table_y + 40], fill=(203, 213, 225), width=1)
    
    draw.text((70, table_y + 12), "FINANCIAL PARTICULARS", fill=(71, 85, 105), font=get_font(13, bold=True))
    draw.text((500, table_y + 12), "DECLARED VALUE", fill=(71, 85, 105), font=get_font(13, bold=True))
    draw.text((850, table_y + 12), "COMPUTED VALUE / IN WORDS", fill=(71, 85, 105), font=get_font(13, bold=True))
    
    # We write other rows first
    rows_other = [
        ("Annual Interest Rate:", "7.25% p.a.", "Compounded Quarterly (Standard FD)", 425),
        ("Tenure / Period:", "8 Years (96 Months)", "From 24-10-2026 to 24-10-2034", 465),
        # Notice Maturity Amount is ₹26,56,646 (which matches ₹15L, NOT ₹35L!)
        ("Maturity Value at Expiry:", "Rs. 26,56,646.00", "Rupees Twenty-Six Lakhs Fifty-Six Thousand Six Hundred Forty-Six Only", 505)
    ]
    
    for label, val1, val2, ry in rows_other:
        draw.line([50, ry + 30, width - 50, ry + 30], fill=(241, 245, 249), width=1)
        draw.text((70, ry), label, fill=(100, 116, 139), font=get_font(13, bold=True))
        draw.text((500, ry), val1, fill=(15, 23, 42), font=get_font(15, bold=True))
        draw.text((850, ry), val2, fill=(51, 65, 85), font=get_font(12, bold=False))
        
    draw.text((70, 385), "Principal Deposit Amount:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.line([50, 385 + 30, width - 50, 385 + 30], fill=(241, 245, 249), width=1)
    
    # Regulatory Clause box
    draw.rectangle([50, 580, width - 50, 675], outline=(16, 185, 129), fill=(240, 253, 244), width=1)
    draw.text((65, 590), "MANDATORY REGULATORY DECLARATION & LIEN CLAUSE:", fill=(21, 128, 61), font=get_font(12, bold=True))
    draw.text((65, 612), "1. NO LIEN / NO PREMATURE ENCASHMENT ALLOWED WITHOUT PRIOR WRITTEN NOC FROM AICTE REGULATION BUREAU.", fill=(15, 23, 42), font=get_font(13, bold=True))
    draw.text((65, 635), "2. Security deposit created pursuant to AICTE Approval Process Handbook (APH 2026-27 Norm: Rs. 35,00,000 for Engineering Degree).", fill=(51, 65, 85), font=get_font(12, bold=False))
    draw.text((65, 653), "3. Bank undertakes not to advance any overdraft / credit facility against this fixed deposit instrument.", fill=(51, 65, 85), font=get_font(12, bold=False))
    
    draw_aicte_stamp(img, 980, 680, valid=True)
    
    # Signatures
    draw.line([100, 780, 320, 780], fill=(100, 116, 139), width=1)
    draw.text((120, 785), "AUTHORIZED SIGNATORY", fill=(100, 116, 139), font=get_font(11, bold=True))
    draw.text((135, 755), "M. S. Deshmukh", fill=(30, 41, 59), font=get_font(16, bold=False))
    
    draw.line([500, 780, 720, 780], fill=(100, 116, 139), width=1)
    draw.text((545, 785), "BRANCH MANAGER", fill=(100, 116, 139), font=get_font(11, bold=True))
    draw.text((535, 755), "Vikramaditya Rao", fill=(30, 41, 59), font=get_font(16, bold=False))
    draw.text((520, 802), "State Bank of India, Pune", fill=(100, 116, 139), font=get_font(11, bold=False))
    
    # Save the base clean image once to establish baseline JPEG compression
    buffer = io.BytesIO()
    img.save(buffer, "JPEG", quality=95)
    buffer.seek(0)
    base_img = Image.open(buffer).convert("RGB")
    
    # NOW SIMULATE REAL DIGITAL FORGERY (PHOTOSHOP RE-COMPRESSION TAMPERING):
    # The college forger selects the principal area, overwrites with "Rs. 35,00,000.00"
    # and "Rupees Thirty-Five Lakhs Only", introducing localized compression artifacts & noise.
    patch_w, patch_h = 750, 42
    patch = Image.new("RGB", (patch_w, patch_h), (255, 255, 255))
    p_draw = ImageDraw.Draw(patch)
    p_draw.text((0, 4), "Rs. 35,00,000.00", fill=(10, 15, 30), font=get_font(15, bold=True))
    p_draw.text((350, 4), "Rupees Thirty-Five Lakhs Only", fill=(40, 50, 70), font=get_font(12, bold=False))
    
    # Add localized pixel perturbation / re-compression noise to simulate forged digital insertion
    patch_arr = np.array(patch).astype(np.float32)
    np.random.seed(42)  # Deterministic forensic artifact pattern
    noise = np.random.normal(0, 18, patch_arr.shape)
    patch_noisy = np.clip(patch_arr + noise, 0, 255).astype(np.uint8)
    tampered_patch = Image.fromarray(patch_noisy)
    
    # Save patch with low quality JPEG to bake in block boundary artifacts
    patch_buf = io.BytesIO()
    tampered_patch.save(patch_buf, "JPEG", quality=30)
    patch_buf.seek(0)
    final_tampered_patch = Image.open(patch_buf)
    
    # Paste the doctored patch onto base image at (500, 380)
    base_img.paste(final_tampered_patch, (500, 380))
    
    out_path = os.path.join(SAMPLE_FDRS_DIR, "sample_2_tampered_principal_pune.jpg")
    base_img.save(out_path, "JPEG", quality=95)
    return out_path

def generate_sample_3_missing_clause():
    """
    Sample 3: HDFC Bank Hyderabad (Deccan School of Management).
    Principal: ₹10,00,000 (Shortfall of ₹5L against MBA norm ₹15L).
    Account Holder: "DECCAN SCHOOL OF MANAGEMENT TRUST ONLY" (Missing mandatory AICTE Joint Holder).
    Missing No-Lien stamp.
    """
    width, height = 1300, 880
    img = Image.new("RGB", (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    draw_security_border(draw, width, height, color=(0, 75, 141))
    
    # Bank Header (HDFC Bank)
    draw.rectangle([35, 35, width - 35, 120], fill=(0, 75, 141))
    draw.text((55, 45), "HDFC BANK LIMITED", fill=(255, 255, 255), font=get_font(28, bold=True))
    draw.text((55, 82), "BANJARA HILLS BRANCH (00456) • IFSC: HDFC0000456 • HYDERABAD", fill=(210, 230, 250), font=get_font(14, bold=False))
    draw.text((width - 320, 52), "FIXED DEPOSIT RECEIPT", fill=(255, 255, 255), font=get_font(20, bold=True))
    draw.text((width - 320, 82), "CUSTOMER ADVICE", fill=(255, 220, 220), font=get_font(15, bold=True))
    
    draw.line([35, 140, width - 35, 140], fill=(218, 37, 29), width=2)
    
    meta_y = 155
    draw.text((55, meta_y), "FDR RECEIPT NO:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((190, meta_y - 2), "FDR-2026-774", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((500, meta_y), "AICTE PERMANENT ID:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((680, meta_y - 2), "1-700800903", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((950, meta_y), "DATE OF ISSUE:", fill=(100, 116, 139), font=get_font(13, bold=True))
    draw.text((1070, meta_y - 2), "24/10/2026", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    # Customer Details Box (MISSING AICTE JOINT HOLDER)
    draw.rectangle([50, 195, width - 50, 310], outline=(203, 213, 225), fill=(254, 242, 242), width=1)
    draw.text((65, 205), "DEPOSITOR / INSTITUTION NAME:", fill=(100, 116, 139), font=get_font(12, bold=True))
    draw.text((65, 225), "DECCAN SCHOOL OF MANAGEMENT, HYDERABAD (TELANGANA)", fill=(15, 23, 42), font=get_font(16, bold=True))
    
    draw.text((65, 255), "ACCOUNT HOLDER OPERATING INSTRUCTION (VIOLATION!):", fill=(220, 38, 38), font=get_font(12, bold=True))
    draw.text((65, 275), "DECCAN SCHOOL OF MANAGEMENT TRUST ONLY (NO AICTE JOINT MANDATE RECORDED)", fill=(185, 28, 28), font=get_font(15, bold=True))
    
    # Financial Terms Table
    table_y = 330
    draw.rectangle([50, table_y, width - 50, 560], outline=(203, 213, 225), fill=(255, 255, 255), width=2)
    draw.rectangle([50, table_y, width - 50, table_y + 40], fill=(241, 245, 249))
    draw.line([50, table_y + 40, width - 50, table_y + 40], fill=(203, 213, 225), width=1)
    
    draw.text((70, table_y + 12), "FINANCIAL PARTICULARS", fill=(71, 85, 105), font=get_font(13, bold=True))
    draw.text((500, table_y + 12), "DECLARED VALUE", fill=(71, 85, 105), font=get_font(13, bold=True))
    draw.text((850, table_y + 12), "COMPUTED VALUE / IN WORDS", fill=(71, 85, 105), font=get_font(13, bold=True))
    
    # Principal is 10,00,000 (Shortfall against 15L MBA norm!)
    # Maturity @ 7.0% for 5y compounded quarterly = 1000000 * (1 + 0.07/4)^20 = 1,414,778
    rows = [
        ("Principal Deposit Amount:", "Rs. 10,00,000.00", "Rupees Ten Lakhs Only (SHORTFALL AGAINST NORM)", 385),
        ("Annual Interest Rate:", "7.00% p.a.", "Compounded Quarterly", 425),
        ("Tenure / Period:", "5 Years (60 Months)", "From 24-10-2026 to 24-10-2031", 465),
        ("Maturity Value at Expiry:", "Rs. 14,14,778.00", "Rupees Fourteen Lakhs Fourteen Thousand Seven Hundred Seventy-Eight Only", 505)
    ]
    
    for label, val1, val2, ry in rows:
        draw.line([50, ry + 30, width - 50, ry + 30], fill=(241, 245, 249), width=1)
        draw.text((70, ry), label, fill=(100, 116, 139), font=get_font(13, bold=True))
        draw.text((500, ry), val1, fill=(185, 28, 28) if "10,00,000" in val1 else (15, 23, 42), font=get_font(15, bold=True))
        draw.text((850, ry), val2, fill=(51, 65, 85), font=get_font(12, bold=False))
        
    # Standard Bank Terms (NO AICTE SPECIAL CLAUSE)
    draw.rectangle([50, 580, width - 50, 675], outline=(239, 68, 68), fill=(255, 241, 242), width=1)
    draw.text((65, 590), "GENERAL COMMERCIAL DEPOSIT TERMS (REGULATORY NON-COMPLIANCE):", fill=(185, 28, 28), font=get_font(12, bold=True))
    draw.text((65, 612), "1. STANDARD COMMERCIAL DEPOSIT: Encashment allowed upon presentation of advice by Trust President.", fill=(15, 23, 42), font=get_font(13, bold=True))
    draw.text((65, 635), "2. Lien clause for AICTE regulation not marked. Deposit eligible as security for overdraft loans.", fill=(185, 28, 28), font=get_font(12, bold=False))
    draw.text((65, 653), "3. Missing statutory tripartite covenant with Member Secretary, AICTE New Delhi.", fill=(185, 28, 28), font=get_font(12, bold=False))
    
    # Commercial stamp without AICTE lien
    draw_aicte_stamp(img, 980, 680, valid=False)
    
    # Signatures
    draw.line([100, 780, 320, 780], fill=(100, 116, 139), width=1)
    draw.text((120, 785), "TELLER / OFFICER", fill=(100, 116, 139), font=get_font(11, bold=True))
    draw.text((135, 755), "R. V. Subbarao", fill=(30, 41, 59), font=get_font(16, bold=False))
    
    draw.line([500, 780, 720, 780], fill=(100, 116, 139), width=1)
    draw.text((545, 785), "BRANCH MANAGER", fill=(100, 116, 139), font=get_font(11, bold=True))
    draw.text((535, 755), "FDR Cell Nodal Head", fill=(30, 41, 59), font=get_font(16, bold=False))
    draw.text((520, 802), "HDFC Bank, Banjara Hills", fill=(100, 116, 139), font=get_font(11, bold=False))
    
    out_path = os.path.join(SAMPLE_FDRS_DIR, "sample_3_missing_clause_deccan.jpg")
    img.save(out_path, "JPEG", quality=95)
    return out_path

def generate_sample_4_duplicate():
    """
    Sample 4: Exact / Near-duplicate scan of Sample 1 to trigger Perceptual Hash (pHash) collision.
    Uploaded under Shivalik Polytechnic (1-900100204).
    """
    # Simply copy sample 1 with minuscule metadata variation so perceptual hash is identical
    sample_1_path = os.path.join(SAMPLE_FDRS_DIR, "sample_1_genuine_sbi.jpg")
    if not os.path.exists(sample_1_path):
        sample_1_path = generate_sample_1_genuine()
        
    img = Image.open(sample_1_path)
    out_path = os.path.join(SAMPLE_FDRS_DIR, "sample_4_duplicate_shivalik.jpg")
    # Save with 94 quality (near identical visual fingerprint)
    img.save(out_path, "JPEG", quality=94)
    return out_path

def generate_all_samples():
    """Generates all 4 synthetic FDR samples on backend startup."""
    print("[FDR GENERATOR] Generating high-resolution synthetic bank FDR certificates...")
    s1 = generate_sample_1_genuine()
    s2 = generate_sample_2_tampered()
    s3 = generate_sample_3_missing_clause()
    s4 = generate_sample_4_duplicate()
    print(f"[FDR GENERATOR] Generated 4 evaluation FDR images in {SAMPLE_FDRS_DIR}:")
    print(f"  - Clean Genuine SBI: {os.path.basename(s1)}")
    print(f"  - Tampered Principal Pune: {os.path.basename(s2)}")
    print(f"  - Missing AICTE Clause Deccan: {os.path.basename(s3)}")
    print(f"  - Duplicate pHash Scan Shivalik: {os.path.basename(s4)}")
    return {
        "sample_1": s1,
        "sample_2": s2,
        "sample_3": s3,
        "sample_4": s4
    }

if __name__ == "__main__":
    generate_all_samples()
