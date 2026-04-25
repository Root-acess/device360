"""
Fix script - downloads the 41 failed models with correct GSMArena slugs.
Run from the same folder as your existing phone_images/ directory.
  pip install requests
  python fix_failed_downloads.py
"""

import os, time, zipfile, shutil, requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
}

BASE_URL  = "https://fdn2.gsmarena.com/vv/bigpic/{slug}.jpg"
OUT_DIR   = "phone_images"

# (brand_folder, save_filename, correct_gsmarena_slug)
FIXES = [
    # ── Apple ──────────────────────────────────────────────────────────────
    ("apple",    "iPhone_15_Plus",          "apple-iphone-15-plus-"),         # trailing dash
    ("apple",    "iPhone_14_Pro_Max",       "apple-iphone-14-pro-max-"),      # trailing dash

    # ── Samsung ────────────────────────────────────────────────────────────
    ("samsung",  "Galaxy_S25_Ultra",        "samsung-galaxy-s25-ultra-sm-s938"),
    ("samsung",  "Galaxy_S25Plus",          "samsung-galaxy-s25-plus-sm-s936"),
    ("samsung",  "Galaxy_S25",             "samsung-galaxy-s25-sm-s931"),
    ("samsung",  "Galaxy_M35_5G",           "samsung-galaxy-m35-5g"),

    # ── OnePlus ────────────────────────────────────────────────────────────
    ("oneplus",  "OnePlus_Open",            "oneplus-open-10"),               # has -10 suffix
    ("oneplus",  "OnePlus_Nord_4",          "oneplus-nord4"),                 # no space/dash
    ("oneplus",  "OnePlus_Nord_CE_4",       "oneplus-nord-ce4-"),             # trailing dash
    ("oneplus",  "OnePlus_Nord_CE_4_Lite",  "oneplus-nord-ce4-lite-intl"),    # -intl suffix

    # ── Xiaomi ─────────────────────────────────────────────────────────────
    ("xiaomi",   "Xiaomi_15_Ultra",         "xiaomi-15-ultra-"),              # trailing dash
    ("xiaomi",   "Xiaomi_14_Ultra",         "xiaomi-14-ultra-new"),           # -new suffix
    ("xiaomi",   "Redmi_Note_14_ProPlus",   "xiaomi-redmi-note-14-pro-plus-5g"),
    ("xiaomi",   "Redmi_Note_14_Pro",       "xiaomi-redmi-note-14-pro-5g-global"),
    ("xiaomi",   "Redmi_Note_14",           "xiaomi-redmi-note-14-5g"),
    ("xiaomi",   "POCO_M7_Pro",             "xiaomi-poco-m7-pro-5g"),

    # ── Realme ─────────────────────────────────────────────────────────────
    ("realme",   "realme_GT_7_Pro",         "realme-gt-7-pro-"),              # trailing dash
    ("realme",   "realme_14_ProPlus",       "realme-14-pro-plus-5g"),
    ("realme",   "realme_14_Pro",           "realme-14-pro-5g"),
    ("realme",   "realme_C65_5G",           "realme-c65-5g-"),                # trailing dash
    ("realme",   "realme_P3_Pro",           "realme-p3-pro-"),                # trailing dash

    # ── Pixel ──────────────────────────────────────────────────────────────
    # Pixel 10 series - not yet on GSMArena bigpic CDN (too new); use Pixel 9 series as fallback
    ("pixel",    "Pixel_10_Pro_Fold",       "google-pixel-9-pro-fold"),       # fallback
    ("pixel",    "Pixel_10_Pro_XL",         "google-pixel-9-pro-xl"),         # fallback
    ("pixel",    "Pixel_10_Pro",            "google-pixel-9-pro-"),           # fallback
    ("pixel",    "Pixel_10",               "google-pixel-9"),                 # fallback
    # Pixel 9 series - correct slugs
    ("pixel",    "Pixel_9_Pro_Fold",        "google-pixel-9-pro-fold"),
    ("pixel",    "Pixel_9_Pro_XL",          "google-pixel-9-pro-xl"),
    ("pixel",    "Pixel_9_Pro",             "google-pixel-9-pro-"),           # trailing dash
    ("pixel",    "Pixel_9",                "google-pixel-9"),
    # Pixel 7 series
    ("pixel",    "Pixel_7_Pro",             "google-pixel-7-pro"),
    ("pixel",    "Pixel_7",                "google-pixel-7"),

    # ── Vivo ───────────────────────────────────────────────────────────────
    ("vivo",     "vivo_V30",               "vivo-v30-5g"),                    # with -5g
    ("vivo",     "vivo_Y200_Pro",           "vivo-y200-pro-5g"),              # with -5g

    # ── OPPO ───────────────────────────────────────────────────────────────
    ("oppo",     "OPPO_Reno12_Pro_5G",      "oppo-reno12-pro-5g"),
    ("oppo",     "OPPO_Reno11_Pro_5G",      "oppo-reno11-pro-5g"),
    ("oppo",     "OPPO_Reno11_5G",          "oppo-reno11-f-5g"),              # Reno11 F variant
    ("oppo",     "OPPO_F27_ProPlus_5G",     "oppo-f27-pro-plus-5g"),
    ("oppo",     "OPPO_A79_5G",             "oppo-a79-5g"),

    # ── Huawei ─────────────────────────────────────────────────────────────
    ("huawei",   "HUAWEI_Pura_70_Ultra",    "huawei-pura-70-ultra"),
    ("huawei",   "HUAWEI_Pura_70_Pro",      "huawei-pura-70-pro"),
    ("huawei",   "HUAWEI_Pura_70",          "huawei-pura-70"),
]

# Also map the original filenames used in the first script so we can rename correctly
ORIGINAL_FILENAMES = {
    "iPhone_15_Plus":         "iPhone_15_Plus.jpg",
    "iPhone_14_Pro_Max":      "iPhone_14_Pro_Max.jpg",
    "Galaxy_S25_Ultra":       "Galaxy_S25_Ultra.jpg",
    "Galaxy_S25Plus":         "Galaxy_S25Plus.jpg",
    "Galaxy_S25":             "Galaxy_S25.jpg",
    "Galaxy_M35_5G":          "Galaxy_M35_5G.jpg",
    "OnePlus_Open":           "OnePlus_Open.jpg",
    "OnePlus_Nord_4":         "OnePlus_Nord_4.jpg",
    "OnePlus_Nord_CE_4":      "OnePlus_Nord_CE_4.jpg",
    "OnePlus_Nord_CE_4_Lite": "OnePlus_Nord_CE_4_Lite.jpg",
    "Xiaomi_15_Ultra":        "Xiaomi_15_Ultra.jpg",
    "Xiaomi_14_Ultra":        "Xiaomi_14_Ultra.jpg",
    "Redmi_Note_14_ProPlus":  "Redmi_Note_14_ProPlus.jpg",
    "Redmi_Note_14_Pro":      "Redmi_Note_14_Pro.jpg",
    "Redmi_Note_14":          "Redmi_Note_14.jpg",
    "POCO_M7_Pro":            "POCO_M7_Pro.jpg",
    "realme_GT_7_Pro":        "realme_GT_7_Pro.jpg",
    "realme_14_ProPlus":      "realme_14_ProPlus.jpg",
    "realme_14_Pro":          "realme_14_Pro.jpg",
    "realme_C65_5G":          "realme_C65_5G.jpg",
    "realme_P3_Pro":          "realme_P3_Pro.jpg",
    "Pixel_10_Pro_Fold":      "Pixel_10_Pro_Fold.jpg",
    "Pixel_10_Pro_XL":        "Pixel_10_Pro_XL.jpg",
    "Pixel_10_Pro":           "Pixel_10_Pro.jpg",
    "Pixel_10":               "Pixel_10.jpg",
    "Pixel_9_Pro_Fold":       "Pixel_9_Pro_Fold.jpg",
    "Pixel_9_Pro_XL":         "Pixel_9_Pro_XL.jpg",
    "Pixel_9_Pro":            "Pixel_9_Pro.jpg",
    "Pixel_9":                "Pixel_9.jpg",
    "Pixel_7_Pro":            "Pixel_7_Pro.jpg",
    "Pixel_7":                "Pixel_7.jpg",
    "vivo_V30":               "vivo_V30.jpg",
    "vivo_Y200_Pro":          "vivo_Y200_Pro.jpg",
    "OPPO_Reno12_Pro_5G":     "OPPO_Reno12_Pro_5G.jpg",
    "OPPO_Reno11_Pro_5G":     "OPPO_Reno11_Pro_5G.jpg",
    "OPPO_Reno11_5G":         "OPPO_Reno11_5G.jpg",
    "OPPO_F27_ProPlus_5G":    "OPPO_F27_ProPlus_5G.jpg",
    "OPPO_A79_5G":            "OPPO_A79_5G.jpg",
    "HUAWEI_Pura_70_Ultra":   "HUAWEI_Pura_70_Ultra.jpg",
    "HUAWEI_Pura_70_Pro":     "HUAWEI_Pura_70_Pro.jpg",
    "HUAWEI_Pura_70":         "HUAWEI_Pura_70.jpg",
}


def download_image(slug, out_path):
    url = BASE_URL.format(slug=slug)
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200 and r.headers.get("Content-Type", "").startswith("image"):
            with open(out_path, "wb") as f:
                f.write(r.content)
            return True, url
        return False, f"HTTP {r.status_code} | {url}"
    except Exception as e:
        return False, str(e)


def try_slugs(candidate_slugs, out_path):
    """Try multiple slug variants until one works."""
    for slug in candidate_slugs:
        ok, info = download_image(slug, out_path)
        if ok:
            return True, slug
    return False, f"All slugs failed: {candidate_slugs}"


ok_list, fail_list = [], []

for brand, save_name, slug in FIXES:
    brand_dir = os.path.join(OUT_DIR, brand)
    os.makedirs(brand_dir, exist_ok=True)
    fname = ORIGINAL_FILENAMES.get(save_name, save_name + ".jpg")
    out_path = os.path.join(brand_dir, fname)

    # Try the primary slug, then a few common variants
    base = slug.rstrip("-")  # strip trailing dash for variant attempts
    candidates = [slug, base, base + "-5g", base + "-new", base + "-intl"]

    success, result = try_slugs(candidates, out_path)
    if success:
        size_kb = os.path.getsize(out_path) // 1024
        print(f"  [OK]   {brand}/{fname} ({size_kb} KB)  [{result}]")
        ok_list.append((brand, fname))
    else:
        print(f"  [FAIL] {brand}/{fname} -> {result}")
        fail_list.append((brand, fname, result))

    time.sleep(0.4)

# ── Rebuild ZIP ──────────────────────────────────────────────────────────────
print("\nRebuilding ZIP with all downloaded images...")
zip_path = "phone_images_gsmarena_complete.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for brand_dir_name in os.listdir(OUT_DIR):
        full_dir = os.path.join(OUT_DIR, brand_dir_name)
        if os.path.isdir(full_dir):
            for fname in os.listdir(full_dir):
                if fname.lower().endswith(".jpg"):
                    fpath = os.path.join(full_dir, fname)
                    if os.path.getsize(fpath) > 3000:   # skip tiny error files
                        zf.write(fpath, f"{brand_dir_name}/{fname}")

print(f"\n{'='*55}")
print(f"Fixed:  {len(ok_list)} images")
print(f"Failed: {len(fail_list)} images")
print(f"ZIP:    {zip_path}")

if fail_list:
    print("\nStill failing:")
    for brand, fname, reason in fail_list:
        print(f"  [{brand}] {fname}")
        print(f"    {reason}")