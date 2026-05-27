import pathlib
path = pathlib.Path('main.js')
raw = path.read_bytes()
s = raw.decode('utf-8')
idx = s.find("name: 'Ão Thun Basic'")
print('idx', idx)
print(s[idx:idx+80])
seg = s[idx:idx+80]
b = seg.encode('utf-8')
print('bytes', b)
print('dec', b.decode('latin1', errors='replace'))
