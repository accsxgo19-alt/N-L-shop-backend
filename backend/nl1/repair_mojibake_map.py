from pathlib import Path

def repair_text(text: str) -> str:
    replacements = [
        # longer phrase replacements first
        ("Má»›i nhất", "Mới nhất"),
        ("Má»›i", "Mới"),
        ("má»›i", "mới"),
        ("má»—i", "mỗi"),
        ("bá»™", "bộ"),
        ("hưá»›ng", "hướng"),
        ("trưá»›c", "trước"),
        ("vá»›i", "với"),
        ("Ná»™i", "Nội"),
        ("khá»›p", "khớp"),
        ("cục bá»™", "cục bộ"),
        ("đồng bá»™", "đồng bộ"),
        ("má»—i email", "mỗi email"),
        ("Hà Ná»™i", "Hà Nội"),
        ("Xem trưá»›c ảnh", "Xem trước ảnh"),
        ("Ưu tiên hàng Ä'ầu", "Ưu tiên hàng đầu"),
        ("Bạn chưa có Ä'ơn hàng Ä'ã giao", "Bạn chưa có đơn hàng đã giao"),
        ("Bạn chưa có Ä'ơn hàng nào", "Bạn chưa có đơn hàng nào"),
        ("Giảm 50.000Ä'", "Giảm 50.000đ"),
        ("Tất cả quyền Ä'ược bảo lưu", "Tất cả quyền được bảo lưu"),
        ("Số lượng Ä'ã mua", "Số lượng đã mua"),
        ("Bắt Ä'ầu mua sắm", "Bắt đầu mua sắm"),
        ("Xem chi tiết sản phẩm, Ä'iều chỉnh số lượng", "Xem chi tiết sản phẩm, điều chỉnh số lượng"),
        ("Giảm 10% cho Ä'ơn hàng VIP", "Giảm 10% cho đơn hàng VIP"),
        ("Giảm 15% cho Ä'ơn hàng thời thượng", "Giảm 15% cho đơn hàng thời thượng"),
        ("Mã EMAIL10 Ä'ã Ä'ược sử dụng. Hiệu lực chỉ 1 lần cho má»—i email.",
         "Mã EMAIL10 đã được sử dụng. Hiệu lực chỉ 1 lần cho mỗi email."),
        ("Khám phá những item Ä'ang dẫn Ä'ầu xu hưá»›ng hiện nay và những mặt hàng hot Ä'ược khách hàng săn Ä'ón nhiều nhất.",
         "Khám phá những item đang dẫn đầu xu hướng hiện nay và những mặt hàng hot được khách hàng săn đón nhiều nhất."),
        ("Những mẫu má»›i vừa Ä'ược cập nhật vào bá»™ sưu tập N&L Shop.",
         "Những mẫu mới vừa được cập nhật vào bộ sưu tập N&L Shop."),
        ("Những mặt hàng yêu thích nhất, lượt bán cao và luôn Ä'ược khách hàng Ä'ánh giá tốt.",
         "Những mặt hàng yêu thích nhất, lượt bán cao và luôn được khách hàng đánh giá tốt."),
        ("Số Ä'ã mua", "Số đã mua"),
        ("Bạn chưa có Ä'ơn hàng Ä'ã giao. <a href=\"index.html\">Tiếp tục mua sắm</a>",
         "Bạn chưa có đơn hàng đã giao. <a href=\"index.html\">Tiếp tục mua sắm</a>"),
        ("Bạn chưa có Ä'ơn hàng nào. <a href=\"index.html\">Bắt Ä'ầu mua sắm</a>",
         "Bạn chưa có đơn hàng nào. <a href=\"index.html\">Bắt đầu mua sắm</a>"),
        ("Xem chi tiết sản phẩm, Ä'iều chỉnh số lượng, thêm vào giỏ hoặc thanh toán ngay lập tức.",
         "Xem chi tiết sản phẩm, điều chỉnh số lượng, thêm vào giỏ hoặc thanh toán ngay lập tức."),
        ("Những mẫu má»›i vừa Ä'ược cập nhật vào bá»™ sưu tập N&L Shop.",
         "Những mẫu mới vừa được cập nhật vào bộ sưu tập N&L Shop."),
        ("<p>Những mẫu má»›i vừa Ä'ược cập nhật vào bá»™ sưu tập N&L Shop.</p>",
         "<p>Những mẫu mới vừa được cập nhật vào bộ sưu tập N&L Shop.</p>"),
        # generic replacements
        ("Ä'ang", "đang"),
        ("Ä'ược", "được"),
        ("Ä'ến", "đến"),
        ("Ä'ầu", "đầu"),
        ("Ä'ơn", "đơn"),
        ("Ä'ã", "đã"),
        ("Ä'ại", "đại"),
        ("Ä'ông", "đông"),
        ("Ä'en", "đen"),
        ("Ä'iện", "điện"),
        ("Ä'iều", "điều"),
        ("Ä'ặt", "đặt"),
        ("Ä'ồng", "đồng"),
        ("Ä'ầy", "đầy"),
        ("Ä'ủ", "đủ"),
        ("Ä'ánh", "đánh"),
        ("Ä'ội", "đội"),
        ("Ä'á", "đa"),
        ("Ä'ạ", "đa"),
        ("Ä'a", "đa"),
        ("Ä'", "đ"),
        ("á»›", "ớ"),
        ("á»™", "ợ"),
        ("á»—", "ộ"),
        ("á»š", "ơ"),
        ("á»˜", "ơ"),
        ("á»©", "ế"),
        ("á»¯", "ị"),
        ("á»…", "ễ"),
    ]
    for old, new in replacements:
        text = text.replace(old, new)
    return text

if __name__ == '__main__':
    root = Path('.')
    extensions = {'.js', '.html', '.css'}
    total_files = 0
    updated_files = 0
    for path in sorted(root.rglob('*')):
        if path.suffix.lower() in extensions:
            total_files += 1
            original = path.read_text(encoding='utf-8')
            fixed = repair_text(original)
            if fixed != original:
                path.write_text(fixed, encoding='utf-8')
                updated_files += 1
                print(f'Updated: {path}')
    print(f'Done. Checked {total_files} files, updated {updated_files} files.')
