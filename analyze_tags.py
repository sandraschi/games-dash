import json
from collections import Counter


def list_tags():
    with open("wakan_vocab.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    tags = []
    for item in data:
        if item.get("tags"):
            # Tags might be comma separated or just single strings?
            # In the JSON preview they looked like single strings "Gj~tag"
            # But let's handle if they are combined
            t = item["tags"]
            if isinstance(t, str):
                tags.append(t)
            elif isinstance(t, list):
                tags.extend(t)

    unique_tags = Counter(tags)

    print(f"Found {len(unique_tags)} unique tag strings.")
    print("Top 50 tags:")
    for tag, count in unique_tags.most_common(50):
        print(f"{tag}: {count}")

    # Also try to split by some delimiter if "Gj~" is a prefix
    # It seems "Gj~" might be a group separator?
    # Or maybe "Gj" is group and "tag" is the value.


if __name__ == "__main__":
    list_tags()
