import os
import re
import urllib.parse


def check_broken_links(root_dir):
    print(f"Scanning {root_dir} for broken links...")
    issues = []

    # Walk through all files
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude directories
        if (
            "node_modules" in dirpath
            or ".git" in dirpath
            or "venv" in dirpath
            or "__pycache__" in dirpath
        ):
            continue

        for filename in filenames:
            if not filename.endswith(".html"):
                continue

            filepath = os.path.join(dirpath, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                # Find all hrefs
                # Matches href="value" or href='value'
                links = re.finditer(r'href=["\']([^"\']+)["\']', content)

                for link_match in links:
                    link_target = link_match.group(1)

                    # Skip anchors, empty links, protocols, scripts
                    if (
                        link_target.startswith("#")
                        or link_target.startswith("http")
                        or link_target.startswith("mailto:")
                        or link_target.startswith("javascript:")
                        or link_target == ""
                    ):
                        continue

                    # Calculate absolute path of target
                    if link_target.startswith("/"):
                        # Root absolute (relative to web root, assuming repo_root is web root)
                        # Remove leading slash
                        clean_target = link_target.lstrip("/")
                        # Handle query params/fragments for file existence check
                        clean_target = clean_target.split("#")[0].split("?")[0]
                        abs_target = os.path.join(root_dir, clean_target)
                    else:
                        # Relative
                        # Handle query params/fragments for file existence check
                        clean_target = link_target.split("#")[0].split("?")[0]
                        abs_target = os.path.join(dirpath, clean_target)

                    # Normalize path
                    abs_target = os.path.normpath(abs_target)

                    # Check existence
                    if not os.path.exists(abs_target):
                        # Special handling for directories (looking for index.html?)
                        # But mostly we link to files. If it's a dir, maybe checks for dir existence?
                        # Let's check if it IS a dir that exists
                        if os.path.isdir(abs_target):
                            continue  # valid link to directory

                        start_pos = link_match.start()
                        line_no = content[:start_pos].count("\n") + 1
                        issues.append(
                            {
                                "source_file": filepath,
                                "line": line_no,
                                "target": link_target,
                                "resolved_path": abs_target,
                            }
                        )

            except Exception as e:
                print(f"Error reading {filepath}: {e}")

    return issues


if __name__ == "__main__":
    repo_root = r"d:\Dev\repos\games-app"
    found_issues = check_broken_links(repo_root)

    with open("broken_links.log", "w", encoding="utf-8") as f:
        if found_issues:
            f.write(f"Found {len(found_issues)} broken links:\n")
            print(f"Found {len(found_issues)} broken links. See broken_links.log")
            for issue in found_issues:
                f.write(f"File: {issue['source_file']}\n")
                f.write(f"  Line: {issue['line']}\n")
                f.write(f"  Link: {issue['target']}\n")
                f.write(f"  Resolved: {issue['resolved_path']}\n")
                f.write("-" * 40 + "\n")
        else:
            f.write("No broken links found.\n")
            print("No broken links found.")
