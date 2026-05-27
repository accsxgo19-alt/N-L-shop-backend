from pathlib import Path
for path, lines in [
    ('admin.html', [46,50,54,58,176,229]),
    ('cart.html', [80,84,88,92,97,196,204,217,218,219,220,221]),
    ('checkout.html', [123,127,131,135,140,357,371,372,373,374,375]),
    ('index.html', [92]),
    ('orders.html', [133]),
    ('purchase-history.html', [95])
]:
    text = Path(path).read_text('utf-8')
    lines_list = text.splitlines()
    print('===', path)
    for i in lines:
        if i <= len(lines_list):
            print(i, repr(lines_list[i-1]))
