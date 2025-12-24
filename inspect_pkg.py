

def inspect_header(file_path):
    try:
        with open(file_path, "rb") as f:
            header = f.read(64)
            print(f"Header (Hex): {header.hex(' ')}")
            print(f"Header (ASCII): {header}")

            # Check for common signatures
            if header.startswith(b"PK\x03\x04"):
                print("Type: ZIP Archive")
            elif header.startswith(b"SQLite format 3"):
                print("Type: SQLite Database")
            else:
                print("Type: Unknown / Custom")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    inspect_header(r"d:\Dev\repos\games-app\data\examples_j.pkg")
