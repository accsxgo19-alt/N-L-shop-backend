import ftfy
mapping = {
    "Ä'ang": "đang",
    "Ä'ược": "được",
    "Ä'ến": "đến",
    "Ä'ầu": "đầu",
    "Ä'ơn": "đơn",
    "Ä'ã": "đã",
    "Ä'ại": "đại",
    "Ä'ông": "đông",
    "Ä'en": "đen",
    "Ä'iện": "điện",
    "Ä'iều": "điều",
    "Ä'ặt": "đặt",
    "Ä'ồng": "đồng",
    "Ä'ầy": "đầy",
    "Ä'ủ": "đủ",
    "Ä'ánh": "đánh",
    "Má»›i": "Mới",
    "má»›i": "mới",
    "má»—i": "mỗi",
    "bá»™": "bộ",
    "hưá»›ng": "hướng",
    "trưá»›c": "trước",
    "vá»›i": "với",
    "Ná»™i": "Nội",
    "khá»›p": "khớp",
    "á»›": "ớ",
    "á»™": "ợ",
    "á»—": "ộ",
    "á»š": "ơ",
    "á»˜": "ơ",
    "á»©": "ế",
    "á»¯": "ị",
}
phrases = [
    "Má»›i nhất",
    "má»—i email",
    "bá»™",
    "hưá»›ng",
    "trưá»›c",
    "vá»›i",
    "cục bá»™",
    "số Ä'iện thoại",
    "Đơn hàng Ä'ang chờ xác nhận",
    "Đơn hàng Ä'ã giao vào khoảng",
    "Hiệu lực chỉ 1 lần cho má»—i email.",
    "Hà Ná»™i",
    "Xem trưá»›c ảnh",
]
for s in phrases:
    t = s
    for k,v in mapping.items():
        t = t.replace(k,v)
    print(s, '->', t)
PY