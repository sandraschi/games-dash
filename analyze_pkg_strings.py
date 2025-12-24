import re


def extract_strings(file_path, min_len=4):
    with open(file_path, "rb") as f:
        data = f.read()

    print(f"File size: {len(data)} bytes")

    # Try to find ASCII/UTF-8 strings
    print("\n--- ASCII/UTF-8 Strings (First 20) ---")
    ascii_strings = re.findall(rb"[\x20-\x7E]{" + str(min_len).encode() + rb",}", data)
    for s in ascii_strings[:20]:
        print(s.decode("utf-8", errors="ignore"))

    # Try to find UTF-16LE strings (common in Windows)
    print("\n--- UTF-16LE Strings (First 20) ---")
    # specific regex for utf-16le characters (basic latin + japanese range approx)
    # roughly: (printable char + 00) repeated
    utf16_strings = re.findall(
        rb"(?:[\x20-\x7E]\x00){" + str(min_len).encode() + rb",}", data
    )
    for s in utf16_strings[:20]:
        print(s.decode("utf-16le", errors="ignore"))

    # Check for Japanese characters (hiragana/katakana/kanji) in UTF-8
    print("\n--- Potential Japanese UTF-8 (First 20) ---")
    # naive check: sequences of bytes > 0x7F
    jp_utf8 = re.findall(rb"[\x80-\xFF]{" + str(min_len * 2).encode() + rb",}", data)
    count = 0
    for s in jp_utf8:
        try:
            decoded = s.decode("utf-8")
            # shallow check if it contains japanese
            if any(ord(c) > 0x3000 for c in decoded):
                print(decoded)
                count += 1
                if count >= 20:
                    break
        except Exception:
            pass


if __name__ == "__main__":
    extract_strings(r"d:\Dev\repos\games-app\data\examples_j.pkg")
