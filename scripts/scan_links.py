import os
import re


def find_self_referential_links(root_dir):
    print(f"Scanning {root_dir}...")
    issues = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        if "node_modules" in dirpath or ".git" in dirpath:
            continue

        for filename in filenames:
            if not filename.endswith(".html"):
                continue

            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                # Check for href="filename" or href="./filename"
                # Simple regex, might miss complex cases but covers the standard pattern
                pattern = f"href=[\"'](\./)?{re.escape(filename)}[\"']"
                matches = re.finditer(pattern, content)

                for match in matches:
                    issues.append(
                        {
                            "file": filepath,
                            "line": content[: match.start()].count("\n") + 1,
                            "match": match.group(0),
                        }
                    )
            except Exception as e:
                print(f"Error reading {filepath}: {e}")

    return issues


if __name__ == "__main__":
    repo_root = r"d:\Dev\repos\games-app"
    found_issues = find_self_referential_links(repo_root)

    if found_issues:
        print(f"Found {len(found_issues)} self-referential links:")
        for issue in found_issues:
            print(f"File: {issue['file']}")
            print(f"  Line: {issue['line']}")
            print(f"  Match: {issue['match']}")
            print("-" * 40)
    else:
        print("No self-referential links found.")
