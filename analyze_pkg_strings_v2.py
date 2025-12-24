import re


def extract_strings_v2(file_path, min_len=4):
    with open(file_path, "rb") as f:
        data = f.read()

    print(f"File size: {len(data)} bytes")

    # Try to find UTF-16BE Strings
    print("\n--- UTF-16BE Strings (First 20) ---")
    utf16be_strings = re.findall(
        rb"(?:\x00[\x20-\x7E]){" + str(min_len).encode() + rb",}", data
    )
    for s in utf16be_strings[:20]:
        try:
            print(s.decode("utf-16be", errors="ignore"))
        except Exception:
            pass


if __name__ == "__main__":
    extract_strings_v2(r"d:\Dev\repos\games-app\data\examples_j.pkg")
