# -*- coding: utf-8 -*-
from PIL import Image

img = Image.open('assets/turkce-test/page-010.jpg')
W, H = img.size

# Let's crop left column from y=0.35 to 1.0 (where Q3, Q4, Q5 must be)
crop_bottom_left = img.crop((0, int(H * 0.35), int(W * 0.52), H))
crop_bottom_left.save('tools/p10_bottom_left.jpg')

# Also crop right column to see Q6, Q7, Q8 layout
crop_right = img.crop((int(W * 0.48), 0, W, H))
crop_right.save('tools/p10_right.jpg')

print("Cropped page 10 sections successfully.")
