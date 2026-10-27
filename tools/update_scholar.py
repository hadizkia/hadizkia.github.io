#!/usr/bin/env python3
"""Refresh the Google Scholar numbers in index.html (total citations, h-index, per-paper badges).

Run weekly by .github/workflows/scholar.yml; can also be run by hand:  python tools/update_scholar.py
If Scholar refuses the request (captcha / block), the page is left unchanged and the script exits 0.
"""
import re
import sys
import urllib.request

USER = "nXgr5iUAAAAJ"
URL = f"https://scholar.google.com/citations?user={USER}&hl=en&cstart=0&pagesize=100"
PAGE = "index.html"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"


def fetch():
    req = urllib.request.Request(URL, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf8", "ignore")


def words(t):
    return set(re.findall(r"[a-z0-9]+", t.lower())) - {"a", "an", "the", "of", "in", "and", "for", "with", "by", "on", "using", "over"}


def main():
    try:
        h = fetch()
    except Exception as e:
        print(f"Scholar not reachable ({e}); page unchanged")
        return 0
    stats = re.findall(r'class="gsc_rsb_std">(\d+)<', h)
    if len(stats) < 4:
        print("Scholar page without the citation table (blocked?); page unchanged")
        return 0
    cites, hidx = int(stats[0]), int(stats[2])
    papers = [(t, int(c) if c else 0) for t, c in
              re.findall(r'class="gsc_a_at">([^<]+)</a>.*?class="gsc_a_ac gs_ibl"[^>]*>(\d*)<', h, re.S)]

    s0 = s = open(PAGE, encoding="utf8").read()
    s = re.sub(r'data-target="\d+"( data-suffix="[^"]*">[^<]*</div>\s*<div class="stat-label">Citations<)',
               rf'data-target="{cites}"\1', s)
    s = re.sub(r'data-target="\d+"( data-suffix="[^"]*">[^<]*</div>\s*<div class="stat-label">h-index<)',
               rf'data-target="{hidx}"\1', s)
    s = re.sub(r"\d+\+ citations across", f"{cites}+ citations across", s)
    s = re.sub(r"\d+\+ citations · h-index \d+", f"{cites}+ citations · h-index {hidx}", s)

    def badge(m):
        title, old = m.group(1), m.group(2)
        w = words(title)
        best, score = None, 0.0
        for t, c in papers:
            j = len(w & words(t)) / max(1, len(w | words(t)))
            if j > score or (j == score and best is not None and c > best):
                best, score = c, j
        if best is None or score < 0.5 or best == 0:
            return m.group(0)
        unit = "citation" if best == 1 else "citations"
        return f'<div class="pub-title">{title} <span class="cite-badge">{best} {unit}</span></div>'
    s = re.sub(r'<div class="pub-title">(.*?)(?: <span class="cite-badge">(\d+) citations?</span>)?</div>', badge, s)

    if s == s0:
        print(f"no change (citations {cites}, h-index {hidx})")
    else:
        open(PAGE, "w", encoding="utf8").write(s)
        print(f"updated: citations {cites}, h-index {hidx}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
