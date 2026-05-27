import pathlib
import re

root = pathlib.Path(r'C:\Niên luận hk3\Niên luận hk3\backend\nl1')

def is_text_file(path):
    return path.suffix.lower() in {'.js', '.html', '.css'}

pattern = re.compile(r'([\x80-\xff]{2,})')

for path in sorted(root.rglob('*')):
    if not is_text_file(path):
        continue
    text = path.read_text(encoding='utf-8', errors='replace')
    new_lines = []
    changed = False
    for line in text.splitlines(True):
        if pattern.search(line):
            try:
                decoded_line = line.encode('latin1').decode('utf-8')
            except Exception:
                decoded_line = None
            if decoded_line and decoded_line != line:
                new_lines.append(decoded_line)
                changed = True
                continue
            modified_line = line
            for match in pattern.finditer(line):
                seq = match.group(1)
                try:
                    decoded = seq.encode('latin1').decode('utf-8')
                except Exception:
                    continue
                if decoded != seq:
                    modified_line = modified_line.replace(seq, decoded)
            if modified_line != line:
                changed = True
            new_lines.append(modified_line)
        else:
            new_lines.append(line)
    if changed:
        print('Fixing', path)
        path.write_text(''.join(new_lines), encoding='utf-8')
