import pathlib
from ftfy import fix_text

root = pathlib.Path(r'C:\Niên luận hk3\Niên luận hk3\backend\nl1')

for path in sorted(root.rglob('*')):
    if path.suffix.lower() not in {'.js', '.html', '.css'}:
        continue
    text = path.read_text(encoding='utf-8', errors='replace')
    fixed = fix_text(text)
    if fixed != text:
        print('Fixing', path)
        path.write_text(fixed, encoding='utf-8')
