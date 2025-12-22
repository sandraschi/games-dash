import json
import re
import os


def decode_hex_japanese(hex_str):
    try:
        # Standard WKL hex is UTF-16BE (2 bytes per char)
        return bytes.fromhex(hex_str).decode("utf-16be")
    except Exception:
        # Fallback if not valid hex or decoding fails
        return hex_str


def parse_wkl(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return []

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    vocab = []
    # Cleaned data lines after header and comments
    data_lines = []
    header_found = False
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith(";"):
            continue
        if "WaKan Word List" in stripped:
            header_found = True
            continue
        data_lines.append(stripped)

    # Each entry is a group of 4 lines
    # Line 1: Expression (Hex)
    # Line 2: Reading (Hex)
    # Line 3: Translation (Text)
    # Line 4: Tags/DictInfo (Text)

    i = 0
    is_hex = lambda s: re.fullmatch(r"[0-9A-Fa-f]+", s)

    while i + 3 < len(data_lines):
        expr_raw = data_lines[i]
        reading_raw = data_lines[i + 1]
        translation = data_lines[i + 2]
        tags = data_lines[i + 3]

        # Handle cases where line 1 or 2 might not be hex (rare but possible in custom notes)
        expr = decode_hex_japanese(expr_raw) if is_hex(expr_raw) else expr_raw
        reading = (
            decode_hex_japanese(reading_raw) if is_hex(reading_raw) else reading_raw
        )

        entry = {
            "expression": expr,
            "reading": reading,
            "translation": translation,
            "tags": tags,
        }
        vocab.append(entry)
        i += 4

    return vocab


if __name__ == "__main__":
    # Path provided by user
    wkl_path = r"C:\Users\sandr\OneDrive\SW\Wakan\wakan-1.90-dev\sas1.wkl"
    output_path = r"d:\Dev\repos\games-app\wakan_vocab.json"

    print(f"Extracting WaKan vocabulary from: {wkl_path}")
    results = parse_wkl(wkl_path)
    print(f"Successfully extracted {len(results)} entries.")

    if results:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"Exported JSON to: {output_path}")

        # Show a sample
        print("\nSample Entry:")
        print(json.dumps(results[0], indent=2, ensure_ascii=False))
    else:
        print("No valid vocabulary entries found.")
