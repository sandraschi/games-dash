#!/usr/bin/env python3
r"""
WaKan Vocabulary Extractor

⚠️  USER-SPECIFIC PATHS REQUIRED:
   This script requires paths adapted for each user's system.

   Usage:
   python extract_wkl.py --wkl-path "C:\Path\To\Your\wakan\file.wkl" --output-path "output.json"

   You MUST adapt the --wkl-path argument to point to your WaKan installation.
   Default WaKan path is typically: "C:\Users\[USERNAME]\OneDrive\SW\Wakan\wakan-X.X-dev\sas1.wkl"
   or similar depending on your WaKan installation location.
"""

import argparse
import json
import os
import re


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

    with open(file_path, encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()

    vocab = []
    # Cleaned data lines after header and comments
    data_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith(";"):
            continue
        if "WaKan Word List" in stripped:
            continue
        data_lines.append(stripped)

    # Each entry is a group of 4 lines
    # Line 1: Expression (Hex)
    # Line 2: Reading (Hex)
    # Line 3: Translation (Text)
    # Line 4: Tags/DictInfo (Text)

    def is_hex(s):
        return re.fullmatch(r"[0-9A-Fa-f]+", s)

    i = 0

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
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract WaKan vocabulary file to JSON"
    )
    parser.add_argument(
        "--wkl-path",
        required=True,
        help="Path to WaKan .wkl file (USER-SPECIFIC - adapt for your system)",
    )
    parser.add_argument(
        "--output-path",
        default="wakan_vocab.json",
        help="Output JSON file path (default: wakan_vocab.json)",
    )

    args = parser.parse_args()

    wkl_path = args.wkl_path
    output_path = args.output_path

    print(f"⚠️  USER-SPECIFIC PATH: Adapt '{wkl_path}' for your WaKan installation!")
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
