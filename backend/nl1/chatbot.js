(function () {
    const STORAGE_KEY = 'nl1ChatbotMessages';
    const POSITION_KEY = 'nl1ChatbotPosition';
    const SESSION_CLOSED_KEY = 'nl1ChatbotClosed';
    const SESSION_OPEN_KEY = 'nl1ChatbotOpen';
    const DRAG_THRESHOLD = 6;
    const DEFAULT_SUGGESTIONS = [
        '🛒 Cách đặt hàng',
        '💳 Cách thanh toán',
        '🧺 Xem giỏ hàng',
        '📞 Liên hệ hỗ trợ'
    ];

    let dragState = {
        active: false,
        pointerId: null,
        startX: 0,
        startY: 0,
        originLeft: 0,
        originTop: 0,
        isDragging: false,
        justDragged: false
    };

    const chatbotHtml = `
    <div id="nl1-chatbot-widget">
        <div class="nl1-chatbot-label">Trợ lý AI</div>
        <button id="nl1-chatbot-toggle" aria-label="Mở trợ lý AI">
            <img src="img/chatbotai.png" alt="AI" class="nl1-chatbot-icon" />
        </button>
        <div id="nl1-chatbot-panel" class="nl1-chatbot-panel" role="dialog" aria-label="Trợ lý AI">
            <div class="nl1-chatbot-header">
                <div class="nl1-chatbot-title-wrapper">
                    <div class="nl1-chatbot-title">Trợ lý AI</div>
                    <div class="nl1-chatbot-subtitle">Luôn sẵn sàng hỗ trợ bạn</div>
                </div>
                <button id="nl1-chatbot-close" aria-label="Đóng trợ lý AI">×</button>
            </div>
            <div class="nl1-chatbot-body">
                <div id="nl1-chatbot-messages" class="nl1-chatbot-messages" aria-live="polite"></div>
                <div id="nl1-chatbot-suggestions" class="nl1-chatbot-suggestions"></div>
            </div>
            <div class="nl1-chatbot-input-area">
                <input id="nl1-chatbot-input" type="text" placeholder="Nhập câu hỏi của bạn..." aria-label="Nhập câu hỏi" autocomplete="off" />
                <button id="nl1-chatbot-send" type="button">Gửi</button>
            </div>
        </div>
    </div>
    `;

    function getStoredPosition() {
        const stored = localStorage.getItem(POSITION_KEY);
        try {
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            return null;
        }
    }

    function savePosition(position) {
        localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    }

    function constrainPosition(left, top, widget) {
        const width = widget.offsetWidth;
        const height = widget.offsetHeight;
        const minLeft = 8;
        const minTop = 8;
        const maxLeft = Math.max(window.innerWidth - width - 8, minLeft);
        const maxTop = Math.max(window.innerHeight - height - 8, minTop);
        return {
            left: Math.min(Math.max(left, minLeft), maxLeft),
            top: Math.min(Math.max(top, minTop), maxTop)
        };
    }

    function setWidgetPosition(left, top, save = true) {
        const widget = document.getElementById('nl1-chatbot-widget');
        if (!widget) return;
        const constrained = constrainPosition(left, top, widget);
        widget.style.left = `${constrained.left}px`;
        widget.style.top = `${constrained.top}px`;
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
        if (save) {
            savePosition(constrained);
        }
    }

    function restoreWidgetPosition() {
        const position = getStoredPosition();
        const widget = document.getElementById('nl1-chatbot-widget');
        if (!widget || !position) return;
        const constrained = constrainPosition(position.left, position.top, widget);
        widget.style.left = `${constrained.left}px`;
        widget.style.top = `${constrained.top}px`;
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
    }

    function scrollMessagesToBottom() {
        const container = document.getElementById('nl1-chatbot-messages');
        if (!container) return;
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    function focusChatInput() {
        const input = document.getElementById('nl1-chatbot-input');
        if (input) {
            input.focus();
        }
    }

    function addDragHandlers() {
        const widget = document.getElementById('nl1-chatbot-widget');
        const toggle = document.getElementById('nl1-chatbot-toggle');
        const header = document.querySelector('.nl1-chatbot-header');

        if (widget) {
            widget.addEventListener('pointerdown', function (event) {
                if (event.target.closest('#nl1-chatbot-panel') || event.target.closest('#nl1-chatbot-close')) {
                    return;
                }
                startDrag(event);
            });
        }

        if (toggle) {
            toggle.addEventListener('click', function (event) {
                if (dragState.justDragged) {
                    event.preventDefault();
                    dragState.justDragged = false;
                    return;
                }
                togglePanel();
            });
        }

        if (header) {
            header.addEventListener('pointerdown', function (event) {
                if (event.target.closest('#nl1-chatbot-close')) {
                    return;
                }
                startDrag(event);
            });
        }

        window.addEventListener('resize', function () {
            const stored = getStoredPosition();
            if (stored) {
                setWidgetPosition(stored.left, stored.top, false);
            }
        });
    }

    function startDrag(event) {
        if (event.type === 'pointerdown' && event.button !== undefined && event.button !== 0) {
            return;
        }

        const widget = document.getElementById('nl1-chatbot-widget');
        if (!widget) return;

        dragState.active = true;
        dragState.pointerId = event.pointerId;
        dragState.startX = event.clientX;
        dragState.startY = event.clientY;
        const rect = widget.getBoundingClientRect();
        dragState.originLeft = rect.left;
        dragState.originTop = rect.top;
        dragState.isDragging = false;
        dragState.justDragged = false;

        if (event.pointerId !== undefined && event.target.setPointerCapture) {
            event.target.setPointerCapture(event.pointerId);
        }

        window.addEventListener('pointermove', onDragMove);
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
    }

    function onDragMove(event) {
        if (!dragState.active || event.pointerId !== dragState.pointerId) {
            return;
        }

        const dx = event.clientX - dragState.startX;
        const dy = event.clientY - dragState.startY;

        if (!dragState.isDragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
            dragState.isDragging = true;
        }

        if (!dragState.isDragging) {
            return;
        }

        event.preventDefault();
        const left = dragState.originLeft + dx;
        const top = dragState.originTop + dy;
        setWidgetPosition(left, top, false);
    }

    function endDrag(event) {
        if (!dragState.active || event.pointerId !== dragState.pointerId) {
            return;
        }

        const widget = document.getElementById('nl1-chatbot-widget');
        if (widget && dragState.isDragging) {
            const rect = widget.getBoundingClientRect();
            savePosition({ left: rect.left, top: rect.top });
            dragState.justDragged = true;
        }

        dragState.active = false;
        dragState.pointerId = null;
        dragState.isDragging = false;

        window.removeEventListener('pointermove', onDragMove);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
    }

    function getMessages() {
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }

    function saveMessages(messages) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }

    function setSessionState(opened, closed) {
        if (opened) {
            sessionStorage.setItem(SESSION_OPEN_KEY, '1');
            sessionStorage.removeItem(SESSION_CLOSED_KEY);
        } else {
            sessionStorage.removeItem(SESSION_OPEN_KEY);
            if (closed) {
                sessionStorage.setItem(SESSION_CLOSED_KEY, '1');
            }
        }
    }

    function isClosed() {
        return sessionStorage.getItem(SESSION_CLOSED_KEY) === '1';
    }

    function isOpen() {
        return sessionStorage.getItem(SESSION_OPEN_KEY) === '1';
    }

    function createMessageElement(message) {
        const el = document.createElement('div');
        el.className = `nl1-chatbot-message ${message.role}` + (message.typing ? ' typing' : '');
        el.textContent = message.content;
        return el;
    }

    function renderMessages() {
        const container = document.getElementById('nl1-chatbot-messages');
        if (!container) return;
        container.innerHTML = '';
        const messages = getMessages();
        messages.forEach(message => {
            container.appendChild(createMessageElement(message));
        });
        scrollMessagesToBottom();
    }

    function updateSuggestions(suggestions) {
        const container = document.getElementById('nl1-chatbot-suggestions');
        if (!container) return;
        container.innerHTML = '';
        suggestions.forEach(text => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'nl1-chatbot-suggestion';
            button.textContent = text;
            button.addEventListener('click', function () {
                const input = document.getElementById('nl1-chatbot-input');
                if (input) {
                    input.value = text;
                    input.focus();
                }
                handleSend();
            });
            container.appendChild(button);
        });
    }

    function appendMessage(role, content, typing = false) {
        const messages = getMessages();
        const message = { role, content, typing, timestamp: Date.now() };
        messages.push(message);
        saveMessages(messages);
        renderMessages();
        return message;
    }

    function replaceLastTypingMessage(answer) {
        const messages = getMessages();
        const lastIndex = messages.map(m => m.typing).lastIndexOf(true);
        if (lastIndex !== -1) {
            messages[lastIndex] = { role: 'bot', content: answer, typing: false, timestamp: Date.now() };
            saveMessages(messages);
        } else {
            messages.push({ role: 'bot', content: answer, typing: false, timestamp: Date.now() });
            saveMessages(messages);
        }
        renderMessages();
        focusChatInput();
    }

    function createBotResponse(userText) {
        const text = userText ? userText.trim().toLowerCase() : '';
        if (!text) {
            return 'Mình có thể giúp bạn với cách đặt hàng, thanh toán, xem giỏ hàng hoặc hỗ trợ tài khoản.';
        }

        const intents = window.NL_CHATBOT_INTENTS || [];
        let bestIntent = null;
        let bestScore = 0;

        intents.forEach(intent => {
            const score = intent.keywords.reduce((count, keyword) => {
                return count + (text.includes(keyword) ? 1 : 0);
            }, 0);
            if (score > bestScore) {
                bestIntent = intent;
                bestScore = score;
            }
        });

        if (bestIntent && bestScore > 0) {
            return bestIntent.reply;
        }

        const fallbackResponses = window.NL_CHATBOT_FALLBACKS || [];
        if (fallbackResponses.length > 0) {
            return fallbackResponses[0];
        }

        return 'Mình chỉ hỗ trợ tư vấn về mua sắm tại N&L Shop. Bạn có thể hỏi về cách đặt hàng, thanh toán, giỏ hàng, lịch sử đơn hàng hoặc đăng nhập.';
    }

    function handleSend() {
        const input = document.getElementById('nl1-chatbot-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';
        focusChatInput();
        updateSuggestions(DEFAULT_SUGGESTIONS);

        appendMessage('bot', 'Đang trả lời...', true);
        setTimeout(() => {
            const answer = createBotResponse(text);
            replaceLastTypingMessage(answer);
            updateSuggestions(DEFAULT_SUGGESTIONS);
        }, 850);
    }

    function openPanel() {
        const panel = document.getElementById('nl1-chatbot-panel');
        const widget = document.getElementById('nl1-chatbot-widget');
        if (!panel || !widget) return;
        panel.classList.add('open');
        widget.classList.add('panel-open');
        setSessionState(true, false);
        if (getMessages().length === 0) {
            appendMessage('bot', 'Xin chào! Mình là trợ lý AI của N&L Shop. Bạn cần hỗ trợ tìm sản phẩm, đặt hàng hay thanh toán không?');
            updateSuggestions(DEFAULT_SUGGESTIONS);
        }
    }

    function closePanel() {
        const panel = document.getElementById('nl1-chatbot-panel');
        const widget = document.getElementById('nl1-chatbot-widget');
        if (!panel || !widget) return;
        panel.classList.remove('open');
        widget.classList.remove('panel-open');
        setSessionState(false, true);
    }

    function togglePanel() {
        if (isOpen()) {
            closePanel();
            return;
        }
        openPanel();
    }

    function bindEvents() {
        const close = document.getElementById('nl1-chatbot-close');
        const send = document.getElementById('nl1-chatbot-send');
        const input = document.getElementById('nl1-chatbot-input');

        if (close) {
            close.addEventListener('click', function () {
                closePanel();
            });
        }

        if (send) {
            send.addEventListener('click', function () {
                handleSend();
            });
        }

        if (input) {
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSend();
                }
            });
        }
    }

    function initializeWidget() {
        const existing = document.getElementById('nl1-chatbot-widget');
        if (existing) return;
        document.body.insertAdjacentHTML('beforeend', chatbotHtml);
        restoreWidgetPosition();
        renderMessages();
        bindEvents();
        addDragHandlers();

        if (isOpen() && !isClosed()) {
            openPanel();
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initializeWidget();
    });
})();
