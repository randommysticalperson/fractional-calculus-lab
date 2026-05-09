import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path('/home/ubuntu/fractional-calculus-lab')
text_path = ROOT / 'research' / 'FCAA-Contents-2011-2021.txt'
text = text_path.read_text(errors='ignore')
lines = [re.sub(r'\s+', ' ', line).strip() for line in text.splitlines()]

entries = []
current_volume = None
current_issue = None
buffer_authors = []
buffer_title = []

issue_re = re.compile(r'FCAA, Vol\.\s*(\d+),\s*No\s*([\d\-]+)\s*\((\d{4})\)', re.I)
page_end_re = re.compile(r'(?:\.\s*){3,}(\d+)\s*$')
skip_prefix = ('CONTENTS', 'ISSN', 'Editorial:', 'Conference:', 'Special Issue:', 'Guest-Editors:', 'Editor-in-Chief:', 'Published by:', 'http', 'https')

for line in lines:
    if not line or line in {'\x0c', '\x03\x03', '\x03'}:
        continue
    m = issue_re.search(line)
    if m:
        current_volume = int(m.group(1))
        current_issue = {'no': m.group(2), 'year': int(m.group(3))}
        buffer_authors = []
        buffer_title = []
        continue
    if current_volume is None or any(line.startswith(p) for p in skip_prefix):
        continue
    if page_end_re.search(line):
        title_line = page_end_re.sub('', line).strip()
        page = int(page_end_re.search(line).group(1))
        if title_line:
            buffer_title.append(title_line)
        title = ' '.join(buffer_title).strip(' .')
        authors = ' '.join(buffer_authors).strip(' .')
        if title and len(title) > 5:
            entries.append({
                'volume': current_volume,
                'issue': current_issue['no'],
                'year': current_issue['year'],
                'authors': authors,
                'title': title.title() if title.isupper() else title,
                'page': page,
            })
        buffer_authors = []
        buffer_title = []
        continue
    # Heuristic: author lines frequently contain initials, commas, or mixed case; titles are often uppercase.
    if line.isupper() or len(buffer_title) > 0:
        if not re.match(r'^(Vol\.|No\.|FCAA)', line):
            buffer_title.append(line)
    else:
        buffer_authors.append(line)

keywords = {
    'Diffusion': ['diffusion', 'subdiffusion', 'superdiffusion'],
    'Differential Equations': ['differential equation', 'boundary value', 'initial value', 'evolution equation'],
    'Numerical Methods': ['numerical', 'finite difference', 'finite element', 'approximation', 'algorithm', 'scheme'],
    'Special Functions': ['mittag', 'wright', 'fox', 'bessel', 'hypergeometric', 'special function'],
    'Stochastic / Probability': ['stochastic', 'probability', 'random', 'fokker', 'kolmogorov'],
    'Variable Order / Generalized Operators': ['variable order', 'distributed order', 'hadamard', 'caputo', 'riemann', 'grünwald', 'grunwald'],
    'Applications / Models': ['model', 'physics', 'control', 'viscoelastic', 'combustion', 'image', 'finance', 'biology'],
    'Inequalities / Analysis': ['inequality', 'existence', 'uniqueness', 'stability', 'maximum principle', 'fixed point'],
}

cluster_counts = Counter()
examples = defaultdict(list)
for e in entries:
    t = e['title'].lower()
    for cluster, terms in keywords.items():
        if any(term in t for term in terms):
            cluster_counts[cluster] += 1
            if len(examples[cluster]) < 8:
                examples[cluster].append(e)

by_year = Counter(e['year'] for e in entries)
summary = {
    'source': 'https://www.math.bas.bg/~fcaa/FCAA-Contents-2011-2021.pdf',
    'entry_count': len(entries),
    'years': dict(sorted(by_year.items())),
    'cluster_counts': dict(cluster_counts.most_common()),
    'cluster_examples': examples,
    'sample_entries': entries[:20],
}

(ROOT / 'client' / 'src' / 'data').mkdir(parents=True, exist_ok=True)
(ROOT / 'research' / 'fcaa_summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False))
(ROOT / 'client' / 'src' / 'data' / 'fcaaReferences.json').write_text(json.dumps({'entries': entries[:180], 'summary': summary}, indent=2, ensure_ascii=False))

md = ['# FCAA contents extraction summary', '', f"Source: {summary['source']}", '', f"Extracted article-like entries: **{len(entries)}**", '', '## Entries by year', '']
for year, count in sorted(by_year.items()):
    md.append(f'- {year}: {count}')
md.extend(['', '## Topic clusters', ''])
for cluster, count in cluster_counts.most_common():
    md.append(f'### {cluster}: {count}')
    for ex in examples[cluster][:5]:
        md.append(f"- {ex['year']} Vol. {ex['volume']} No. {ex['issue']}: {ex['title']}")
    md.append('')
(ROOT / 'research' / 'fcaa_summary.md').write_text('\n'.join(md) + '\n')
print(json.dumps({'entries': len(entries), 'clusters': dict(cluster_counts.most_common(5))}, indent=2))
