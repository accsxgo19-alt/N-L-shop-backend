(function () {
    window.NL_CHATBOT_INTENTS = [
        {
            name: 'greeting',
            keywords: ['xin chào', 'chào', 'hello', 'hi', 'hey', 'chao', 'good morning', 'good afternoon'],
            reply: 'Xin chào! Mình luôn sẵn sàng hỗ trợ bạn mua sắm tại N&L Shop.'
        },
        {
            name: 'order',
            keywords: ['đặt hàng', 'mua hàng', 'cách mua', 'order', 'mua như thế nào', 'mua'],
            reply: 'Để đặt hàng, bạn chọn sản phẩm rồi bấm "Thêm vào giỏ hàng" hoặc "Mua ngay", sau đó vào giỏ hàng và theo dõi hướng dẫn thanh toán.'
        },
        {
            name: 'cart',
            keywords: ['giỏ hàng', 'thêm vào giỏ', 'xóa sản phẩm', 'tăng số lượng', 'giảm số lượng', 'xem giỏ hàng', 'mở giỏ hàng'],
            reply: 'Bạn có thể xem giỏ hàng để điều chỉnh số lượng, xóa sản phẩm hoặc chọn Thanh toán khi đã sẵn sàng.'
        },
        {
            name: 'payment',
            keywords: ['thanh toán', 'trả tiền', 'payment', 'thanh toan', 'xác nhận đơn', 'thanh toán như thế nào'],
            reply: 'Bạn hãy vào giỏ hàng, kiểm tra sản phẩm rồi nhấn Thanh toán. Sau đó chọn phương thức giao hàng và xác nhận đơn để hoàn tất.'
        },
        {
            name: 'history',
            keywords: ['lịch sử đơn hàng', 'đơn hàng của tôi', 'xem đơn', 'history', 'lịch sử mua hàng', 'đơn hàng'],
            reply: 'Bạn có thể vào trang Lịch sử mua hàng hoặc Đơn hàng để xem chi tiết đơn và tình trạng giao hàng.'
        },
        {
            name: 'account',
            keywords: ['đăng nhập', 'đăng ký', 'tài khoản', 'mật khẩu', 'quên mật khẩu', 'đăng nhâp', 'dang nhap', 'dang ky'],
            reply: 'Bạn vào trang Đăng nhập/Đăng ký. Nếu quên mật khẩu, hãy dùng trang Quên mật khẩu để đặt lại thông tin.'
        },
        {
            name: 'discount',
            keywords: ['giảm giá', 'voucher', 'mã giảm', 'khuyến mãi', 'sale', 'ưu đãi', 'coupon', 'mã ưu đãi'],
            reply: 'N&L Shop có thể có chương trình ưu đãi theo từng thời điểm. Bạn có thể theo dõi popup khuyến mãi, trang sản phẩm hoặc đăng ký email để nhận mã ưu đãi nếu có.'
        },
        {
            name: 'product',
            keywords: ['sản phẩm', 'áo', 'quần', 'váy', 'thời trang', 'giá', 'mua áo', 'mua quần', 'mua váy', 'shop có'],
            reply: 'Bạn có thể xem sản phẩm tại trang chủ hoặc trang danh mục. Nếu muốn mua, hãy bấm thêm vào giỏ hàng rồi thanh toán.'
        },
        {
            name: 'support',
            keywords: ['liên hệ', 'hỗ trợ', 'tư vấn', 'hotline', 'chăm sóc khách hàng', 'support'],
            reply: 'Nếu cần hỗ trợ thêm, bạn có thể liên hệ qua email nlshop213@gmail.com hoặc số điện thoại 0793244405. Mình luôn sẵn sàng giúp bạn.'
        }
    ];

    window.NL_CHATBOT_FALLBACKS = [
        'Mình chưa hiểu rõ ý bạn. Bạn có thể hỏi về cách đặt hàng, thanh toán, giỏ hàng, sản phẩm hoặc tài khoản nhé.',
        'Mình chủ yếu hỗ trợ các vấn đề liên quan đến mua hàng tại N&L Shop như sản phẩm, giỏ hàng, thanh toán và tài khoản.'
    ];
})();
