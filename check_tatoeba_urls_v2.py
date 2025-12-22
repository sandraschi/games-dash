import requests

urls = [
    "https://downloads.tatoeba.org/exports/per_language/jpn/jpn_sentences.tsv.bz2",
    "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences.tsv.bz2",
    "https://downloads.tatoeba.org/exports/links.csv.bz2",
    "https://downloads.tatoeba.org/exports/links.tar.bz2",
]

for url in urls:
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        print(f"URL: {url} - Status: {response.status_code}")
    except Exception as e:
        print(f"URL: {url} - Error: {e}")
