"""
GSMArena Phone Image Downloader
Run this script on your local machine:
  pip install requests
  python download_gsmarena_phones.py
"""

import os
import time
import zipfile
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"
}

OUT_DIR = "phone_images"

# GSMArena image CDN slug mapping for each model
# Format: (brand_folder, model_name, gsmarena_image_slug)
MODELS = [
    # Apple
    ("apple", "iPhone 16 Pro Max",       "apple-iphone-16-pro-max"),
    ("apple", "iPhone 16 Pro",           "apple-iphone-16-pro"),
    ("apple", "iPhone 16 Plus",          "apple-iphone-16-plus"),
    ("apple", "iPhone 16",               "apple-iphone-16"),
    ("apple", "iPhone 15 Pro Max",       "apple-iphone-15-pro-max"),
    ("apple", "iPhone 15 Pro",           "apple-iphone-15-pro"),
    ("apple", "iPhone 15 Plus",          "apple-iphone-15-plus"),
    ("apple", "iPhone 15",               "apple-iphone-15"),
    ("apple", "iPhone 14 Pro Max",       "apple-iphone-14-pro-max"),
    ("apple", "iPhone 14 Pro",           "apple-iphone-14-pro"),
    ("apple", "iPhone 14",               "apple-iphone-14"),
    ("apple", "iPhone SE (3rd gen)",     "apple-iphone-se-2022-"),

    # Samsung
    ("samsung", "Galaxy S25 Ultra",      "samsung-galaxy-s25-ultra"),
    ("samsung", "Galaxy S25+",           "samsung-galaxy-s25-plus"),
    ("samsung", "Galaxy S25",            "samsung-galaxy-s25"),
    ("samsung", "Galaxy Z Fold6",        "samsung-galaxy-z-fold6"),
    ("samsung", "Galaxy Z Flip6",        "samsung-galaxy-z-flip6"),
    ("samsung", "Galaxy A55 5G",         "samsung-galaxy-a55"),
    ("samsung", "Galaxy A35 5G",         "samsung-galaxy-a35"),
    ("samsung", "Galaxy A25 5G",         "samsung-galaxy-a25"),
    ("samsung", "Galaxy M35 5G",         "samsung-galaxy-m35"),
    ("samsung", "Galaxy M55 5G",         "samsung-galaxy-m55"),

    # OnePlus
    ("oneplus", "OnePlus 13",            "oneplus-13"),
    ("oneplus", "OnePlus 13R",           "oneplus-13r"),
    ("oneplus", "OnePlus 12",            "oneplus-12"),
    ("oneplus", "OnePlus 12R",           "oneplus-12r"),
    ("oneplus", "OnePlus Open",          "oneplus-open"),
    ("oneplus", "OnePlus Nord 4",        "oneplus-nord-4"),
    ("oneplus", "OnePlus Nord CE 4",     "oneplus-nord-ce-4"),
    ("oneplus", "OnePlus Nord CE 4 Lite","oneplus-nord-ce-4-lite"),

    # Xiaomi
    ("xiaomi", "Xiaomi 15 Ultra",        "xiaomi-15-ultra"),
    ("xiaomi", "Xiaomi 15",              "xiaomi-15"),
    ("xiaomi", "Xiaomi 14 Ultra",        "xiaomi-14-ultra"),
    ("xiaomi", "Xiaomi 14",              "xiaomi-14"),
    ("xiaomi", "Redmi Note 14 Pro+",     "xiaomi-redmi-note-14-pro-plus"),
    ("xiaomi", "Redmi Note 14 Pro",      "xiaomi-redmi-note-14-pro"),
    ("xiaomi", "Redmi Note 14",          "xiaomi-redmi-note-14"),
    ("xiaomi", "Redmi 13C",              "xiaomi-redmi-13c"),
    ("xiaomi", "POCO X7 Pro",            "xiaomi-poco-x7-pro"),
    ("xiaomi", "POCO X7",                "xiaomi-poco-x7"),
    ("xiaomi", "POCO M7 Pro",            "xiaomi-poco-m7-pro"),

    # Realme
    ("realme", "realme GT 7 Pro",        "realme-gt-7-pro"),
    ("realme", "realme GT 7",            "realme-gt-7"),
    ("realme", "realme GT 7T",           "realme-gt-7t"),
    ("realme", "realme 14 Pro+",         "realme-14-pro-plus"),
    ("realme", "realme 14 Pro",          "realme-14-pro"),
    ("realme", "realme 13 Pro+",         "realme-13-pro-plus"),
    ("realme", "realme 13 Pro",          "realme-13-pro"),
    ("realme", "realme 12 Pro+",         "realme-12-pro-plus"),
    ("realme", "realme 12 Pro",          "realme-12-pro"),
    ("realme", "realme 12x 5G",          "realme-12x"),
    ("realme", "realme C75",             "realme-c75"),
    ("realme", "realme C65 5G",          "realme-c65-5g"),
    ("realme", "realme P3 Pro",          "realme-p3-pro"),
    ("realme", "realme P2 Pro",          "realme-p2-pro"),
    ("realme", "realme Narzo 70 Turbo 5G","realme-narzo-70-turbo"),

    # Google Pixel
    ("pixel", "Pixel 10 Pro Fold",       "google-pixel-10-pro-fold"),
    ("pixel", "Pixel 10 Pro XL",         "google-pixel-10-pro-xl"),
    ("pixel", "Pixel 10 Pro",            "google-pixel-10-pro"),
    ("pixel", "Pixel 10",                "google-pixel-10"),
    ("pixel", "Pixel 9 Pro Fold",        "google-pixel-9-pro-fold"),
    ("pixel", "Pixel 9 Pro XL",          "google-pixel-9-pro-xl"),
    ("pixel", "Pixel 9 Pro",             "google-pixel-9-pro"),
    ("pixel", "Pixel 9",                 "google-pixel-9"),
    ("pixel", "Pixel 9a",                "google-pixel-9a"),
    ("pixel", "Pixel 8 Pro",             "google-pixel-8-pro"),
    ("pixel", "Pixel 8",                 "google-pixel-8"),
    ("pixel", "Pixel 8a",                "google-pixel-8a"),
    ("pixel", "Pixel 7 Pro",             "google-pixel-7-pro"),
    ("pixel", "Pixel 7",                 "google-pixel-7"),
    ("pixel", "Pixel 7a",                "google-pixel-7a"),
    ("pixel", "Pixel Fold",              "google-pixel-fold"),
    ("pixel", "Pixel 6 Pro",             "google-pixel-6-pro"),
    ("pixel", "Pixel 6",                 "google-pixel-6"),
    ("pixel", "Pixel 6a",                "google-pixel-6a"),

    # Vivo
    ("vivo", "vivo X200 Pro",            "vivo-x200-pro"),
    ("vivo", "vivo X200",                "vivo-x200"),
    ("vivo", "vivo X100 Pro",            "vivo-x100-pro"),
    ("vivo", "vivo X100",                "vivo-x100"),
    ("vivo", "vivo V40 Pro",             "vivo-v40-pro"),
    ("vivo", "vivo V40",                 "vivo-v40"),
    ("vivo", "vivo V30 Pro",             "vivo-v30-pro"),
    ("vivo", "vivo V30",                 "vivo-v30"),
    ("vivo", "vivo T3 Ultra",            "vivo-t3-ultra"),
    ("vivo", "vivo T3 Pro",              "vivo-t3-pro"),
    ("vivo", "vivo Y200 Pro",            "vivo-y200-pro"),

    # OPPO
    ("oppo", "OPPO Find X8 Pro",         "oppo-find-x8-pro"),
    ("oppo", "OPPO Find X8",             "oppo-find-x8"),
    ("oppo", "OPPO Find X7 Ultra",       "oppo-find-x7-ultra"),
    ("oppo", "OPPO Reno12 Pro 5G",       "oppo-reno12-pro"),
    ("oppo", "OPPO Reno12 5G",           "oppo-reno12"),
    ("oppo", "OPPO Reno11 Pro 5G",       "oppo-reno11-pro"),
    ("oppo", "OPPO Reno11 5G",           "oppo-reno11"),
    ("oppo", "OPPO F27 Pro+ 5G",         "oppo-f27-pro-plus"),
    ("oppo", "OPPO A3 Pro 5G",           "oppo-a3-pro"),
    ("oppo", "OPPO A79 5G",              "oppo-a79"),

    # Motorola
    ("motorola", "motorola edge 50 ultra",  "motorola-edge-50-ultra"),
    ("motorola", "motorola edge 50 pro",    "motorola-edge-50-pro"),
    ("motorola", "motorola edge 50 fusion", "motorola-edge-50-fusion"),
    ("motorola", "motorola razr 50 ultra",  "motorola-razr-50-ultra"),
    ("motorola", "motorola razr 50",        "motorola-razr-50"),
    ("motorola", "motorola g85 5G",         "motorola-moto-g85"),
    ("motorola", "motorola g64 5G",         "motorola-moto-g64"),
    ("motorola", "motorola g54 5G",         "motorola-moto-g54"),
    ("motorola", "motorola edge 40 neo",    "motorola-edge-40-neo"),

    # Huawei
    ("huawei", "HUAWEI Pura 70 Ultra",   "huawei-pura-70-ultra"),
    ("huawei", "HUAWEI Pura 70 Pro",     "huawei-pura-70-pro"),
    ("huawei", "HUAWEI Pura 70",         "huawei-pura-70"),
    ("huawei", "HUAWEI Mate X5",         "huawei-mate-x5"),
    ("huawei", "HUAWEI nova 12 Pro",     "huawei-nova-12-pro"),
    ("huawei", "HUAWEI nova 12",         "huawei-nova-12"),
    ("huawei", "HUAWEI Mate 60 Pro",     "huawei-mate-60-pro"),
]

BASE_URL = "https://fdn2.gsmarena.com/vv/bigpic/{slug}.jpg"

def safe_filename(name):
    return name.replace("/", "-").replace(" ", "_").replace("+", "Plus").replace("(", "").replace(")", "")

def download_image(slug, out_path):
    url = BASE_URL.format(slug=slug)
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code == 200 and r.headers.get("Content-Type", "").startswith("image"):
            with open(out_path, "wb") as f:
                f.write(r.content)
            return True, url
        else:
            return False, f"HTTP {r.status_code} | {url}"
    except Exception as e:
        return False, str(e)

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    ok, fail = [], []

    for brand, model_name, slug in MODELS:
        brand_dir = os.path.join(OUT_DIR, brand)
        os.makedirs(brand_dir, exist_ok=True)
        fname = safe_filename(model_name) + ".jpg"
        fpath = os.path.join(brand_dir, fname)

        if os.path.exists(fpath) and os.path.getsize(fpath) > 5000:
            print(f"  [SKIP] {brand}/{model_name}")
            ok.append((brand, model_name))
            continue

        success, info = download_image(slug, fpath)
        if success:
            size_kb = os.path.getsize(fpath) // 1024
            print(f"  [OK]   {brand}/{model_name} ({size_kb}KB)")
            ok.append((brand, model_name))
        else:
            print(f"  [FAIL] {brand}/{model_name} -> {info}")
            fail.append((brand, model_name, info))

        time.sleep(0.4)  # be polite to the server

    # ZIP everything
    zip_path = "phone_images_gsmarena.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for brand, model_name, slug in MODELS:
            fname = safe_filename(model_name) + ".jpg"
            fpath = os.path.join(OUT_DIR, brand, fname)
            if os.path.exists(fpath) and os.path.getsize(fpath) > 5000:
                zf.write(fpath, f"{brand}/{fname}")

    print(f"\n{'='*50}")
    print(f"Downloaded: {len(ok)} images")
    print(f"Failed:     {len(fail)} images")
    print(f"ZIP saved:  {zip_path}")

    if fail:
        print("\nFailed models:")
        for brand, model, reason in fail:
            print(f"  - [{brand}] {model}: {reason}")

if __name__ == "__main__":
    main()