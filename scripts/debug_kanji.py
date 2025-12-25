import urllib.request
import json

try:
    with urllib.request.urlopen('http://localhost:5003/api/kanji/all') as response:
        raw_data = response.read().decode()
        data = json.loads(raw_data)
        print('Raw API response structure:')
        print(f'  Type of data["kanji"]: {type(data["kanji"])}')
        print(f'  Length of kanji list: {len(data["kanji"])}')
        if data['kanji']:
            first_kanji = data['kanji'][0]
            print(f'  First kanji meanings type: {type(first_kanji["meanings"])}')
            print(f'  First kanji meanings: {first_kanji["meanings"]}')
            n2_count = sum(1 for k in data["kanji"] if k.get("jlpt") == "N2")
            print(f'  JLPT N2 count: {n2_count}')

            # Check what JLPT levels are present
            jlpt_levels = set(k.get("jlpt") for k in data["kanji"] if k.get("jlpt"))
            print(f'  JLPT levels present: {sorted(jlpt_levels)}')
except Exception as e:
    print(f'Error: {e}')





