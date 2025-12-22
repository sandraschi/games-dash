def analyze_structure(file_path):
    with open(file_path, "rb") as f:
        data = f.read(1000)  # Read first 1000 bytes

    header_end_tag = b"< end of header >"
    try:
        end_index = data.index(header_end_tag)
        print(f"Header ends at offset: {end_index}")
        print(f"Tag length: {len(header_end_tag)}")

        start_of_data = end_index + len(header_end_tag)
        print(f"Data starts around: {start_of_data}")

        # Show next 64 bytes
        next_bytes = data[start_of_data : start_of_data + 64]
        print(f"Next 64 bytes (Hex): {next_bytes.hex(' ')}")
        print(f"Next 64 bytes (ASCII): {next_bytes}")

        # Check for Zlib header (commonly 78 9C, 78 01, 78 DA)
        if (
            next_bytes.startswith(b"\x78\x9c")
            or next_bytes.startswith(b"\x78\x01")
            or next_bytes.startswith(b"\x78\xda")
        ):
            print("POSSIBLE ZLIB STREAM DETECTED")

    except ValueError:
        print("Header end tag not found in first 1000 bytes.")


if __name__ == "__main__":
    analyze_structure(r"d:\Dev\repos\games-app\data\examples_j.pkg")
