# -*- coding: utf-8 -*-
"""quiz-data.json -> quiz-data.json (pulden arindirilmis) + quiz-keys.json

- Ayni (sayfa, no) tekrarlarindan EN IYI kayit secilir (5 sikli tercih).
- Ayni sayfadaki anahtar kayitlari yalnizca ayni sayfadaki sorularla eslesir.
- Eslesen soru yoksa anahtar ATILIR (baska yapragin yapragina bulasmaz).
"""
import json
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rank(q):
    return (len(q.get('c', {})), )


def main():
    d = json.load(io.open(os.path.join(ROOT, 'quiz-data.json'), encoding='utf-8'))
    out = {}
    for key, v in d.items():
        pages = {}
        for p, e in v['pages'].items():
            seen = {}
            for q in e.get('q', []):
                n = str(q['n'])
                if n not in seen or rank(q) > rank(seen[n]):
                    seen[n] = q
            qs = sorted(seen.values(), key=lambda q: q['n'])
            nos = set(seen)
            ks = [x for x in e.get('k', []) if str(x['n']) in nos]
            qm = v.get('qmap', {}) or {}
            only = [q['n'] for q in qs if str(qm.get(str(q['n']), p)) == p]
            entry = {}
            if qs:
                entry['q'] = qs
            if ks:
                entry['k'] = ks
            if only and (len(only) != len(qs) or 'qs' in e):
                entry['qs'] = only
            if entry:
                pages[p] = entry
        out[key] = {'w': v['w'], 'h': v['h'], 'pdf': v.get('pdf', ''),
                    'pages': pages, 'qmap': v.get('qmap', {})}
    with io.open(os.path.join(ROOT, 'quiz-data.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print('quiz-data.json guncellendi:', os.path.getsize(os.path.join(ROOT, 'quiz-data.json')), 'bayt')
    for key, v in out.items():
        ns = sum(len(e.get('q', [])) for e in v['pages'].values())
        nk = sum(len(e.get('k', [])) for e in v['pages'].values())
        print(' ', key, 'soru:', ns, 'anahtar:', nk)


if __name__ == '__main__':
    main()
