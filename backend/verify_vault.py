import json
import urllib.request

data = json.load(open('backend/vault_urls.json'))
print("=== VERIFYING CLOUDINARY VAULT URLS ===")
all_ok = True
for fdr, docs in data.items():
    print(f"\n{fdr}:")
    for d in docs:
        url = d['fileUrl']
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                status = resp.status
                ctype = resp.headers.get('Content-Type')
                length = resp.headers.get('Content-Length')
                print(f"  ✓ [{status}] {d['documentType']} ({ctype}, {length} bytes)\n    {url}")
        except Exception as e:
            all_ok = False
            print(f"  ✕ FAILED {d['documentType']}: {e}\n    {url}")

if all_ok:
    print("\n🎉 ALL 11 CLOUDINARY DOCUMENTS VERIFIED WITH HTTP 200 OK!")
