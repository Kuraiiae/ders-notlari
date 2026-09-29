import os

files = ['galeri.html', 'oku.html', 'viewer.html', 'index.html', 'enhancements.js']

for f in files:
    if os.path.exists(f):
        c = open(f, encoding='utf-8').read()
        has_quiz = 'id="quizData"' in c
        has_palette = 'bgPaletteGrid' in c
        has_solution = 'qsolution' in c or 'dn-solution' in c
        print(f"{f:<18} | Size: {len(c):>7} B | Quiz: {str(has_quiz):<5} | Palette: {str(has_palette):<5} | SolutionMask: {str(has_solution):<5}")

print("\nValidation completed successfully.")
