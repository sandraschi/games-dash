import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:5003/api/kanji/all") as response:
        data = json.loads(response.read().decode())
        print(f"API returned {data.get('count', 0)} kanji")
        if "kanji" in data:
            kanji_list = data["kanji"]
            n2_count = sum(1 for k in kanji_list if k.get("jlpt") == "N2")
            print(f"JLPT N2 kanji: {n2_count}")

            # Handle Unicode printing safely
            try:
                sample_kanji = []
                for k in kanji_list[:5]:
                    try:
                        sample_kanji.append(k["kanji"])
                    except UnicodeEncodeError:
                        sample_kanji.append("[UNICODE]")
                print("Sample kanji:", sample_kanji)
            except Exception:
                print("Sample kanji: [Unicode display issues]")

            if kanji_list:
                first = kanji_list[0]
                try:
                    print(f"First kanji: {first['kanji']}")
                except UnicodeEncodeError:
                    print("First kanji: [UNICODE CHAR]")
                print(f"  Meanings: {first['meanings']}")
                print(f"  JLPT: {first['jlpt']}")
        else:
            print("Unexpected response format:", list(data.keys()))
except Exception as e:
    print(f"Error: {e}")
