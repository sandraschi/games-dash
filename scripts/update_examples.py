import requests
import bz2
import tarfile
import csv
import json
import os
import io

DATA_DIR = "data"
OUTPUT_FILE = os.path.join(DATA_DIR, "examples.json")

URLS = {
    "jpn": "https://downloads.tatoeba.org/exports/per_language/jpn/jpn_sentences.tsv.bz2",
    "eng": "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
    "links": "https://downloads.tatoeba.org/exports/links.tar.bz2",
}


def download_file(url, output_path):
    print(f"Downloading {url} to {output_path}...")
    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            with open(output_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        print("Download complete.")
        return True
    except Exception as e:
        print(f"Failed to download {url}: {e}")
        return False


def load_sentences(bz2_path):
    sentences = {}
    print(f"Loading sentences from {bz2_path}...")
    try:
        with bz2.open(bz2_path, "rt", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter="\t")
            for row in reader:
                if len(row) >= 3:
                    # Format: id, lang, text
                    sentences[row[0]] = row[2]
    except Exception as e:
        print(f"Error loading {bz2_path}: {e}")
    print(f"Loaded {len(sentences)} sentences.")
    return sentences


def extract_links(tar_path):
    print(f"Extracting links from {tar_path}...")
    links = []
    try:
        with tarfile.open(tar_path, "r:bz2") as tar:
            # Assuming links.csv is inside
            member = tar.getmember("links.csv")
            f = tar.extractfile(member)
            if f:
                content = f.read().decode("utf-8")
                reader = csv.reader(io.StringIO(content), delimiter="\t")
                for row in reader:
                    if len(row) >= 2:
                        links.append((row[0], row[1]))
    except Exception as e:
        print(f"Error extracting links: {e}")
    print(f"Loaded {len(links)} links.")
    return links


def main():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    # Download files
    jpn_path = os.path.join(DATA_DIR, "jpn_sentences.tsv.bz2")
    eng_path = os.path.join(DATA_DIR, "eng_sentences.tsv.bz2")
    links_path = os.path.join(DATA_DIR, "links.tar.bz2")

    if not os.path.exists(jpn_path):
        if not download_file(URLS["jpn"], jpn_path):
            return
    if not os.path.exists(eng_path):
        if not download_file(URLS["eng"], eng_path):
            return
    if not os.path.exists(links_path):
        if not download_file(URLS["links"], links_path):
            return

    # Process
    jpn_sentences = load_sentences(jpn_path)
    eng_sentences = load_sentences(eng_path)
    links = extract_links(links_path)

    pairs = []
    print("Matching pairs...")
    for src_id, tgt_id in links:
        if src_id in jpn_sentences and tgt_id in eng_sentences:
            pairs.append(
                {
                    "japanese": jpn_sentences[src_id],
                    "english": eng_sentences[tgt_id],
                    "words": [],  # Simplification: We might populate this later or search logic handles it
                }
            )

    print(f"Found {len(pairs)} Japanese-English pairs.")

    # Save to JSON
    print(f"Saving to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(pairs, f, ensure_ascii=False, indent=2)
    print("Done.")


if __name__ == "__main__":
    main()
