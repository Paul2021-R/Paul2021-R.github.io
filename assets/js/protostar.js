(function () {
  // 1. Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    .protostar-icon {
      transition: 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      width: 51px;
      height: 51px;
      border-radius: 50%;
      left: 60px;
      bottom: 48px;
      background: white;
      cursor: pointer;
      opacity: 1;
      transform: translateY(0);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      border: 2px solid white;
      z-index: 1000;
      overflow: hidden;
    }

    .protostar-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .protostar-window {
      position: fixed;
      left: 60px;
      bottom: 112px;
      width: 380px;
      height: 600px;
      background: white;
      box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: 0.3s;
      z-index: 1000;
      overflow: hidden;
      font-family: Helvetica, Arial, sans-serif;
    }

    .protostar-window.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .protostar-header {
      padding: 15px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #333;
    }
    
    .header-left {
        display: flex;
        gap: 15px;
        align-items: center;
        flex: 1; /* Allow title to take space */
        min-width: 0; /* Enable truncation flex child */
    }
    
    .header-right {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .header-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .icon-btn {
        cursor: pointer;
        font-size: 16px;
        color: #555;
        transition: 0.2s;
        flex-shrink: 0;
    }
    
    .icon-btn:hover {
        color: #000;
        transform: scale(1.1);
    }
    
    /* User Profile Icon */
    .user-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid #333;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .user-icon svg {
        width: 14px;
        height: 14px;
        fill: none;
        stroke: #333;
        stroke-width: 2;
    }

    .protostar-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fafafa;
      overflow: hidden;
      position: relative;
    }

    /* Overlays */
    .overlay-base {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.95);
        z-index: 20;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
        box-sizing: border-box; /* Fix width overflow */
    }
    
    .overlay-base.active {
        display: flex;
    }
    
    .limit-overlay h3 {
        margin-top: 0;
        color: #333;
        margin-bottom: 15px;
    }
    
    .limit-overlay p {
        color: #666;
        font-size: 14px;
        margin-bottom: 30px;
        line-height: 1.5;
    }
    
    .overlay-btn {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        border: none;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: 10px;
        transition: 0.2s;
    }
    
    .btn-primary {
        background: #007bff;
        color: white;
    }
    .btn-primary:hover { background: #0056b3; }
    
    .btn-secondary {
        background: #eee;
        color: #555;
    }
    .btn-secondary:hover { background: #e0e0e0; }
    

    /* Session List Overlay (Refined) */
    .session-list-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fafafa;
        z-index: 10;
        padding: 20px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        box-sizing: border-box; /* Fix width overflow */
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
    }
    
    .session-list-overlay.active {
        transform: translateX(0);
    }
    
    .session-item {
        padding: 15px;
        background: white;
        border: 1px solid #eee;
        border-radius: 8px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: 0.2s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.02);
    }
    
    .session-item:hover {
        border-color: #ccc;
        transform: translateY(-2px);
    }
    
    .session-item.active {
        border-color: #007bff;
        background: #f0f7ff;
    }
    
    .session-date {
        font-size: 10px;
        color: #999;
        margin-bottom: 4px;
        display: block;
    }
    
    .session-title {
        font-size: 13px;
        font-weight: bold;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }


    .message-list {
      flex: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .message-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
      position: relative;
    }

    .message-bubble.user {
      align-self: flex-end;
      background: #e3f2fd;
      color: #0d47a1;
      border-bottom-right-radius: 2px;
    }

    .message-bubble.bot {
      align-self: flex-start;
      background: #fff;
      color: #444;
      border: 1px solid #eee;
      border-bottom-left-radius: 2px;
    }

    .attachment-pill-in-chat {
      display: block;
      background: rgba(255,255,255,0.6);
      border: 1px solid rgba(0,0,0,0.1);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      margin-bottom: 5px;
      color: #555;
    }
    
    .message-bubble.user .attachment-pill-in-chat {
        background: rgba(255,255,255,0.4);
        border-color: rgba(13, 71, 161, 0.2);
        color: #0d47a1;
    }

    .input-area {
      padding: 10px 15px;
      background: white;
      border-top: 1px solid #eee;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .attachment-preview-area {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
    }

    .attachment-pill {
        display: flex;
        align-items: center;
        gap: 5px;
        background: #f0f0f0;
        border: 1px solid #e0e0e0;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        color: #333;
    }
    
    .attachment-pill .remove-btn {
        cursor: pointer;
        color: #999;
        font-weight: bold;
        line-height: 1;
    }
    
    .attachment-pill .remove-btn:hover {
        color: #f44336;
    }

    .input-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .add-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f0f0f0;
      border: none;
      color: #666;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s;
    }

    .add-btn:hover {
      background: #e0e0e0;
      color: #333;
    }

    .chat-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 8px 15px;
      font-size: 14px;
      outline: none;
    }
    
    .chat-input:focus {
        border-color: #aaa;
    }

    .send-btn {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      font-size: 16px;
      padding: 5px;
      transition: 0.2s;
    }
    
    .send-btn:disabled {
        color: #ccc;
        cursor: default;
    }
    
    .send-btn:hover:not(:disabled) {
        transform: translateX(2px);
    }

    @media (max-width: 1024px) {
      .protostar-icon {
        width: 38px;
        height: 38px;
        left: 35px;
        border-width: 1.5px;
      }
    }

    @media (max-width: 600px) {
      .protostar-icon {
        width: 29px;
        height: 29px;
        left: 20px;
        border-width: 1.5px;
      }
      .protostar-window {
        left: 20px;
        right: 20px;
        width: auto;
        bottom: 93px;
        height: 60vh;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Create DOM Elements
  const iconContainer = document.createElement('div');
  iconContainer.className = 'protostar-icon';
  iconContainer.id = 'protostar-icon';
  iconContainer.innerHTML = '<img src="/assets/images/project-protostar/protostar_icon.png" alt="Protostar Chat">';

  const windowContainer = document.createElement('div');
  windowContainer.className = 'protostar-window';
  windowContainer.id = 'protostar-window';
  windowContainer.innerHTML = `
    <div class="protostar-header">
      <div class="header-left">
          <span class="icon-btn" id="protostar-list-btn" title="Chat List">☰</span>
          <span class="icon-btn" id="protostar-new-btn" title="New Chat">+</span>
          <span class="header-title" id="protostar-header-title">Protostar</span>
      </div>
      <div class="header-right">
          <div class="user-icon" title="User Profile">
            <!-- Line art person icon -->
            <svg viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span id="close-protostar" style="cursor: pointer;">&#10005;</span>
      </div>
    </div>
    <div class="protostar-body">
      <!-- Session List Overlay -->
      <div class="session-list-overlay" id="protostar-session-overlay">
          <h4 style="margin-bottom: 15px; color: #333;">Chat List</h4>
          <div id="protostar-session-list-items"></div>
      </div>
      
      <!-- Limit Alert Overlay -->
      <div class="overlay-base limit-overlay" id="protostar-limit-overlay">
          <h3>한도 초과</h3>
          <p>Protostar 서비스에 회원가입 하시면<br>더 많은 질문이 가능합니다.</p>
          <button class="overlay-btn btn-primary" id="protostar-register-btn">등록하러 가기</button>
          <button class="overlay-btn btn-secondary" id="protostar-cancel-limit-btn">취소</button>
      </div>

      <div class="message-list" id="protostar-message-list">
        <!-- Messages will be injected here -->
      </div>
      <div class="input-area">
        <div class="attachment-preview-area" id="protostar-attachment-area"></div>
        <div class="input-row">
            <button class="add-btn" id="protostar-add-btn" title="Add Current Page">+</button>
            <input type="text" class="chat-input" id="protostar-input" placeholder="Type a message...">
            <button class="send-btn" id="protostar-send-btn" title="Send" disabled>&#10148;</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(iconContainer);
  document.body.appendChild(windowContainer);

  // 3. Logic & Event Listeners
  const messageList = document.getElementById('protostar-message-list');
  const sessionOverlay = document.getElementById('protostar-session-overlay');
  const sessionListItems = document.getElementById('protostar-session-list-items');
  const limitOverlay = document.getElementById('protostar-limit-overlay');

  const headerTitle = document.getElementById('protostar-header-title');
  const attachmentArea = document.getElementById('protostar-attachment-area');
  const addBtn = document.getElementById('protostar-add-btn');
  const listBtn = document.getElementById('protostar-list-btn');
  const newBtn = document.getElementById('protostar-new-btn');
  const registerBtn = document.getElementById('protostar-register-btn');
  const cancelLimitBtn = document.getElementById('protostar-cancel-limit-btn');

  const input = document.getElementById('protostar-input');
  const sendBtn = document.getElementById('protostar-send-btn');
  const closeBtn = document.getElementById('close-protostar');

  let activeSessionId = null;
  let attachments = [];

  // --- Constants ---
  const MAX_SESSIONS_PER_DAY = 3;
  const EXPIRATION_DAYS = 7;

  // --- Helpers ---
  const generateSessionId = () => {
    const timestamp = Date.now();
    const cleanPath = window.location.pathname.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `sess_${timestamp}_${cleanPath}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const isSessionExpired = (lastUpdated) => {
    const now = new Date();
    const diffTime = Math.abs(now - new Date(lastUpdated));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > EXPIRATION_DAYS;
  };

  const getTodaySessionCount = (sessions) => {
    const today = new Date().toDateString();
    return sessions.filter(s => new Date(s.created_at).toDateString() === today).length;
  };

  // --- Data Management ---
  const getSessions = () => {
    let sessions = JSON.parse(localStorage.getItem('protostar_sessions') || '[]');

    // Migration: Check if old history exists and migrate
    const oldHistory = localStorage.getItem('protostar_chat_history');
    if (oldHistory) {
      const mainSession = {
        id: generateSessionId(),
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        url: window.location.pathname,
        messages: JSON.parse(oldHistory)
      };
      sessions.push(mainSession);
      localStorage.removeItem('protostar_chat_history'); // Delete old key
      localStorage.setItem('protostar_sessions', JSON.stringify(sessions));
    }

    // Cleanup: Remove expired
    const validSessions = sessions.filter(s => !isSessionExpired(s.last_updated));
    if (validSessions.length !== sessions.length) {
      localStorage.setItem('protostar_sessions', JSON.stringify(validSessions));
    }
    return validSessions;
  };

  const saveSessions = (sessions) => {
    localStorage.setItem('protostar_sessions', JSON.stringify(sessions));
  };

  const createSession = () => {
    const sessions = getSessions();

    // Limit Check: Max 3 per day
    if (getTodaySessionCount(sessions) >= MAX_SESSIONS_PER_DAY) {
      // Show Custom Overlay instead of Alert
      limitOverlay.classList.add('active');
      return null;
    }

    const newSession = {
      id: generateSessionId(),
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      url: window.location.pathname,
      messages: [{
        text: "안녕하세요! Paul 님의 커리어 AI 비서 Protostar 입니다. 무엇을 도와드릴까요?",
        type: 'bot',
        timestamp: new Date().toISOString()
      }]
    };

    sessions.push(newSession);
    saveSessions(sessions);
    return newSession.id;
  };

  const getActiveSession = () => {
    const sessions = getSessions();
    if (!activeSessionId) {
      // If no active session, try to find one or create one
      if (sessions.length > 0) {
        // Get most recently updated
        sessions.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated));
        activeSessionId = sessions[0].id;
      } else {
        activeSessionId = createSession();
      }
    }
    return sessions.find(s => s.id === activeSessionId);
  };

  const updateHeaderTitle = (session) => {
    if (!session) return;
    // Check if any user messages exist (ignoring initial bot msg)
    const hasUserMessages = session.messages.some(m => m.type === 'user');

    if (hasUserMessages) {
      headerTitle.textContent = decodeURIComponent(session.url);
    } else {
      headerTitle.textContent = "Protostar";
    }
  };

  // --- Render ---
  const renderChat = () => {
    messageList.innerHTML = '';
    const session = getActiveSession();
    if (!session) return; // Should not happen unless limit prevented creation

    // Update Header
    updateHeaderTitle(session);

    session.messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble ${msg.type}`;

      let html = '';
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          html += `<div class="attachment-pill-in-chat">📄 ${att.title}</div>`;
        });
      }
      html += `<div>${msg.text}</div>`;

      bubble.innerHTML = html;
      messageList.appendChild(bubble);
    });
    scrollToBottom();
  };

  const renderSessionList = () => {
    sessionListItems.innerHTML = '';
    const sessions = getSessions();
    // Sort by newest created
    sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    sessions.forEach(s => {
      const div = document.createElement('div');
      div.className = `session-item ${s.id === activeSessionId ? 'active' : ''}`;

      // Format date: "YYYY/MM/DD HH:mm"
      const date = new Date(s.created_at);
      const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

      div.innerHTML = `
             <span class="session-date">${dateStr}</span>
             <span class="session-title">${decodeURIComponent(s.url)}</span> 
           `;

      div.addEventListener('click', () => {
        activeSessionId = s.id;
        sessionOverlay.classList.remove('active'); // Close overlay
        renderChat();
      });

      sessionListItems.appendChild(div);

    });
  };

  const scrollToBottom = () => {
    messageList.scrollTop = messageList.scrollHeight;
  }

  // --- Logic Events ---

  // Toggle Window
  const toggleChat = () => {
    windowContainer.classList.toggle('show');
    if (windowContainer.classList.contains('show')) {
      setTimeout(() => input.focus(), 300);

      // Ensure we have a session (unless limited)
      if (!activeSessionId) {
        const session = getActiveSession();
        if (session) {
          activeSessionId = session.id;
          renderChat();
        }
      }
    }
  };

  listBtn.addEventListener('click', () => {
    renderSessionList();
    sessionOverlay.classList.toggle('active');
  });

  newBtn.addEventListener('click', () => {
    const newId = createSession();
    if (newId) {
      activeSessionId = newId;
      sessionOverlay.classList.remove('active');
      renderChat();
      // Reset input/attachments for new session
      input.value = '';
      attachments = [];
      attachmentArea.innerHTML = '';
      updateSendButton();
    }
  });

  // Custom Overlay Events
  registerBtn.addEventListener('click', () => {
    window.location.href = 'https://service-protostar.ddns.net/';
  });

  cancelLimitBtn.addEventListener('click', () => {
    limitOverlay.classList.remove('active');
  });


  iconContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleChat();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    windowContainer.classList.remove('show');
    // Also hide overlays if open
    limitOverlay.classList.remove('active');
    sessionOverlay.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (windowContainer.classList.contains('show') &&
      !windowContainer.contains(e.target) &&
      !iconContainer.contains(e.target)) {
      windowContainer.classList.remove('show');
      limitOverlay.classList.remove('active');
      sessionOverlay.classList.remove('active');
    }
  });

  // Input Handling
  const updateSendButton = () => {
    if (input.value.trim() || attachments.length > 0) {
      sendBtn.disabled = false;
      sendBtn.style.color = '#007bff';
    } else {
      sendBtn.disabled = true;
      sendBtn.style.color = '#ccc';
    }
  };

  input.addEventListener('input', updateSendButton);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  });

  // Attachment Logic
  addBtn.addEventListener('click', () => {
    const title = document.title;
    // Check if already added
    if (attachments.some(att => att.title === title)) return;

    const attachment = {
      title: title,
      content: document.body.innerText.substring(0, 5000), // Limit content size
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    attachments.push(attachment);
    renderAttachmentPill(attachment);
    updateSendButton();
    input.focus();
  });

  const renderAttachmentPill = (att) => {
    const pill = document.createElement('div');
    pill.className = 'attachment-pill';
    pill.innerHTML = `
        <span>📄 ${att.title.length > 20 ? att.title.substring(0, 20) + '...' : att.title}</span>
        <span class="remove-btn">×</span>
      `;

    pill.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.stopPropagation(); // Fix chat window closing on removal
      attachments = attachments.filter(a => a !== att);
      attachmentArea.removeChild(pill);
      updateSendButton();
    });

    attachmentArea.appendChild(pill);
  };

  // Send Logic
  sendBtn.addEventListener('click', sendMessage);

  function sendMessage() {
    const text = input.value.trim();
    if (!text && attachments.length === 0) return;

    const session = getActiveSession();
    if (!session) return;

    const userMsg = {
      text: text,
      attachments: [...attachments], // Copy array
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    // 1. Update State
    const sessions = getSessions();
    const currentSession = sessions.find(s => s.id === activeSessionId);
    currentSession.messages.push(userMsg);
    currentSession.last_updated = new Date().toISOString();
    saveSessions(sessions);

    // 2. Render UI
    // Reset Input
    input.value = '';
    attachments = [];
    attachmentArea.innerHTML = '';
    updateSendButton();

    renderChat(); // Re-render to show new message

    // 3. Mock Response
    setTimeout(() => {
      const botMsg = {
        text: "현재는 목업으로 답변이 불가합니다ㅠㅠ. 조금만 기다려주세요!",
        type: 'bot',
        timestamp: new Date().toISOString()
      };

      const updatedSessions = getSessions(); // Re-fetch to be safe
      const s = updatedSessions.find(s => s.id === activeSessionId);
      if (s) {
        s.messages.push(botMsg);
        s.last_updated = new Date().toISOString();
        saveSessions(updatedSessions);
        if (activeSessionId === s.id) renderChat(); // Only render if still active
      }
    }, 1000);
  }

  // Init
  // Try to load one immediately to handle migration
  getSessions();
})();
