# -*- coding: utf-8 -*-
"""Sik kutularini gorsel ustune cizerek geometriyi gozle dogrular."""
import io
import json
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RENK = {'A': 'red', 'B': 'orange', 'C': 'yellow', 'D': 'lime', 'E': 'cyan'}


def main():
    d = json.load(io.open(os.path.join(ROOT, 'quiz-data.json'), encoding='utf-8'))
    hedef = sys.argv[1:] or ['turkce-test:4', 'turkce-cikmis:4', 'deneme:4']
    os.makedirs(os.path.join(ROOT, 'tools', 'preview'), exist_ok=True)
    for h in hedef:
        key, p = h.split(':')
        e = d[key]['pages'][p]
        img = Image.open(os.path.join(ROOT, 'assets', key, 'page-%03d.jpg' % int(p))).convert('RGB')
        W, H = img.size
        dr = ImageDraw.Draw(img)
        for q in e.get('q', []):
            b = q['b']
            dr.rectangle([b[0] * W, b[1] * H, b[2] * W, b[3] * H], outline='magenta', width=6)
            dr.text((b[0] * W, max(0, b[1] * H - 30)), 'S' + str(q['n']), fill='magenta')
            for harf, box in q.get('c', {}).items():
                # tiklanabilir alani genisletilmis haliyle ciz
                x0 = max(0.0, box[0] - 0.035) * W
                y0 = max(0.0, box[1] - 0.004) * H
                x1 = min(1.0, box[2] + 0.012) * W
                y1 = min(1.0, box[3] + 0.004) * H
                dr.rectangle([x0, y0, x1, y1], outline=RENK.get(harf, 'white'), width=4)
                dr.text((x0 + 4, y0 + 4), harf, fill=RENK.get(harf, 'white'))
        cikti = os.path.join(ROOT, 'tools', 'preview', 'quiz-%s-%s.png' % (key, p))
        img.save(cikti)
        print('yazildi:', cikti, img.size)


if __name__ == '__main__':
    main()
