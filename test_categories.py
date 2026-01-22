import urllib.request
import json

# Check if the source kanji data has category information
DATA_URL = "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json"

print("Downloading kanji data to check for categories...")
with urllib.request.urlopen(DATA_URL) as response:
    data = json.loads(response.read().decode())

print(f"Total kanji in source: {len(data)}")

# Check first few entries for category data
sample_keys = list(data.keys())[:5]
for i, key in enumerate(sample_keys):
    kanji_info = data[key]
    print(f"\nKanji {i+1} (key exists):")
    print(f"  Has categories: {'categories' in kanji_info}")
    if 'categories' in kanji_info:
        print(f"  Categories: {kanji_info['categories']}")

# Check what other fields are available
if sample_keys:
    first_entry = data[sample_keys[0]]
    print(f"\nAvailable fields in source data: {list(first_entry.keys())}")