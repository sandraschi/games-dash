import zlib


def scan_for_zlib(file_path):
    with open(file_path, "rb") as f:
        data = f.read()

    # Common Zlib headers
    signatures = [b"\x78\x9c", b"\x78\x01", b"\x78\xda"]

    found = 0
    for sig in signatures:
        start = 0
        while True:
            try:
                idx = data.index(sig, start)
                print(f"Found Zlib signature {sig.hex()} at offset {idx}")

                # Try to decompress
                try:
                    decompressed = zlib.decompress(data[idx:])
                    print(f"  -> Successfully decompressed {len(decompressed)} bytes!")
                    print(f"  -> Preview: {decompressed[:100]}")
                    return  # Stop after first success for now
                except Exception as e:
                    print(f"  -> Decompression failed: {e}")

                start = idx + 1
            except ValueError:
                break

    if found == 0:
        print("No Zlib streams found.")


if __name__ == "__main__":
    scan_for_zlib(r"d:\Dev\repos\games-app\data\examples_j.pkg")
