// import "regenerator-runtime/runtime"; // if needed for async/await in older browsers

// const chatContainer = document.getElementById("chat-container");
// const messageForm = document.getElementById("message-form");
// const userInput = document.getElementById("user-input");
// const apiSelector = document.getElementById("api-selector");
// const newChatBtn = document.getElementById("new-chat-btn");

// const BASE_URL = process.env.API_ENDPOINT;

// let db;

// async function initDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open("myChatDB", 1);
//     request.onupgradeneeded = function (e) {
//       db = e.target.result;
//       if (!db.objectStoreNames.contains("chats")) {
//         db.createObjectStore("chats", { keyPath: "id", autoIncrement: true });
//       }
//       if (!db.objectStoreNames.contains("metadata")) {
//         db.createObjectStore("metadata", { keyPath: "key" });
//       }
//     };
//     request.onsuccess = function (e) {
//       db = e.target.result;
//       resolve();
//     };
//     request.onerror = function (e) {
//       reject(e);
//     };
//   });
// }

// async function saveMessage(role, content) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("chats", "readwrite");
//     const store = tx.objectStore("chats");
//     store.add({ role, content });
//     tx.oncomplete = () => resolve();
//     tx.onerror = (e) => reject(e);
//   });
// }

// async function getAllMessages() {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("chats", "readonly");
//     const store = tx.objectStore("chats");
//     const req = store.getAll();
//     req.onsuccess = () => resolve(req.result);
//     req.onerror = (e) => reject(e);
//   });
// }

// async function saveMetadata(key, value) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("metadata", "readwrite");
//     const store = tx.objectStore("metadata");
//     store.put({ key, value });
//     tx.oncomplete = () => resolve();
//     tx.onerror = (e) => reject(e);
//   });
// }

// async function getMetadata(key) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction("metadata", "readonly");
//     const store = tx.objectStore("metadata");
//     const req = store.get(key);
//     req.onsuccess = () => resolve(req.result ? req.result.value : null);
//     req.onerror = (e) => reject(e);
//   });
// }

// async function clearAllData() {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction(["chats", "metadata"], "readwrite");
//     tx.objectStore("chats").clear();
//     tx.objectStore("metadata").clear();
//     tx.oncomplete = () => resolve();
//     tx.onerror = (e) => reject(e);
//   });
// }

// function createMessageBubble(content, sender = "user") {
//   const wrapper = document.createElement("div");
//   wrapper.classList.add("mb-6", "flex", "items-start", "space-x-3");

//   const avatar = document.createElement("div");
//   avatar.classList.add(
//     "w-10",
//     "h-10",
//     "rounded-full",
//     "flex-shrink-0",
//     "flex",
//     "items-center",
//     "justify-center",
//     "font-bold",
//     "text-white"
//   );

//   if (sender === "assistant") {
//     avatar.classList.add("bg-gradient-to-br", "from-green-400", "to-green-600");
//     avatar.textContent = "A";
//   } else {
//     avatar.classList.add("bg-gradient-to-br", "from-blue-500", "to-blue-700");
//     avatar.textContent = "U";
//   }

//   const bubble = document.createElement("div");
//   bubble.classList.add(
//     "max-w-full",
//     "md:max-w-2xl",
//     "p-3",
//     "rounded-lg",
//     "whitespace-pre-wrap",
//     "leading-relaxed",
//     "shadow-sm"
//   );

//   if (sender === "assistant") {
//     bubble.classList.add("bg-gray-200", "text-gray-900");
//   } else {
//     bubble.classList.add("bg-blue-600", "text-white");
//   }

//   bubble.textContent = content;

//   wrapper.appendChild(avatar);
//   wrapper.appendChild(bubble);
//   return wrapper;
// }

// function scrollToBottom() {
//   chatContainer.scrollTop = chatContainer.scrollHeight;
// }

// async function getAssistantResponse(userMessage) {
//   const mode = apiSelector.value;
//   let url;
//   let payload;

//   if (mode === "assistant") {
//     const thread_id = await getMetadata("thread_id");
//     payload = { message: userMessage };
//     if (thread_id) {
//       payload.thread_id = thread_id;
//     }
//     url = `${BASE_URL}/assistant`;
//   } else {
//     // Naive mode
//     const allMsgs = await getAllMessages();
//     const messagesForAPI = [
//       { role: "system", content: "You are a helpful assistant." },
//       ...allMsgs.map((m) => ({ role: m.role, content: m.content })),
//       { role: "user", content: userMessage },
//     ];
//     payload = { messages: messagesForAPI };
//     url = `${BASE_URL}/chat`;
//   }

//   const response = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }

//   const data = await response.json();

//   if (mode === "assistant" && data.thread_id) {
//     const existingThreadId = await getMetadata("thread_id");
//     if (!existingThreadId) {
//       await saveMetadata("thread_id", data.thread_id);
//     }
//   }

//   return data.reply;
// }

// messageForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const message = userInput.value.trim();
//   if (!message) return;

//   chatContainer.appendChild(createMessageBubble(message, "user"));
//   await saveMessage("user", message);

//   userInput.value = "";
//   scrollToBottom();

//   try {
//     const response = await getAssistantResponse(message);
//     chatContainer.appendChild(createMessageBubble(response, "assistant"));
//     await saveMessage("assistant", response);
//     scrollToBottom();
//   } catch (error) {
//     console.error("Error fetching assistant response:", error);
//     const errMsg = "Error fetching response. Check console.";
//     chatContainer.appendChild(createMessageBubble(errMsg, "assistant"));
//     await saveMessage("assistant", errMsg);
//     scrollToBottom();
//   }
// });

// async function loadExistingMessages() {
//   const allMsgs = await getAllMessages();
//   for (const msg of allMsgs) {
//     chatContainer.appendChild(createMessageBubble(msg.content, msg.role));
//   }
//   scrollToBottom();
// }

// newChatBtn.addEventListener("click", async () => {
//   // Clear DB data and UI
//   await clearAllData();
//   chatContainer.innerHTML = "";
//   // Now user can start a new chat fresh
// });

// initDB().then(loadExistingMessages);

// console.log(BASE_URL);

import "regenerator-runtime/runtime"; // if needed for async/await in older browsers
// --- DOM Elements ---
const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const userInput = document.getElementById('user-input');
const drugTagsContainer = document.getElementById('drug-tags-container');
const newChatBtn = document.getElementById('new-chat-btn');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const addDrugBtn = document.getElementById('add-drug-btn');
const drugModal = document.getElementById('drug-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const drugSearchInput = document.getElementById('drug-search-input');
const drugSearchBtn = document.getElementById('drug-search-btn');
const drugSearchResults = document.getElementById('drug-search-results');
const saveProfileBtn = document.getElementById('save-profile');
const themeToggle = document.getElementById('theme-toggle');
const headerIcon = document.getElementById('header-icon');
const headerTitle = document.getElementById('header-title');
const toggleLabelMed = document.getElementById('toggle-label-med');
const toggleLabelMind = document.getElementById('toggle-label-mind');

// --- State and Config ---
let currentQueryDrugs = []; 
const BASE_URL = "http://localhost:8000"; 
let db; 
let currentMode = 'assistant'; // 'assistant' or 'naive'

// --- IndexedDB Functions ---
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("medChatDB-v2", 1); // new DB version for new structure
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains("chats")) {
                db.createObjectStore("chats", { keyPath: "id", autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("metadata")) {
                db.createObjectStore("metadata", { keyPath: "key" });
            }
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(); };
        request.onerror = (e) => { console.error("IndexedDB error:", e.target.errorCode); reject(e); };
    });
}

async function saveMessage(role, content, mode) {
    if (!db) return;
    const tx = db.transaction("chats", "readwrite");
    const store = tx.objectStore("chats");
    store.add({ role, content, timestamp: new Date(), mode });
}

async function getAllMessages() {
    if (!db) return [];
    const tx = db.transaction("chats", "readonly");
    const store = tx.objectStore("chats");
    return await store.getAll();
}

async function saveMetadata(key, value) {
    if (!db) return;
    const tx = db.transaction("metadata", "readwrite");
    const store = tx.objectStore("metadata");
    store.put({ key, value });
}

async function getMetadata(key) {
    if (!db) return null;
    const tx = db.transaction("metadata", "readonly");
    const store = tx.objectStore("metadata");
    const req = await store.get(key);
    return req ? req.value : null;
}

async function clearAllData() {
    if (!db) return;
    const tx = db.transaction(["chats", "metadata"], "readwrite");
    tx.objectStore("chats").clear();
    tx.objectStore("metadata").clear();
}

// --- UI & Theme Functions ---
function applyTheme(isCalm) {
    if (isCalm) {
        document.body.classList.add('theme-calm');
        headerIcon.textContent = '🌙';
        headerTitle.textContent = 'AI 마음 상담';
        toggleLabelMed.classList.add('opacity-70');
        toggleLabelMed.classList.remove('font-semibold');
        toggleLabelMind.classList.remove('opacity-70');
        toggleLabelMind.classList.add('font-semibold');
        addDrugBtn.style.display = 'none'; // 마음상담 모드에서 약 추가 버튼 숨기기
        currentMode = 'naive';
    } else {
        document.body.classList.remove('theme-calm');
        headerIcon.textContent = '💊';
        headerTitle.textContent = 'AI 복약 상담';
        toggleLabelMed.classList.remove('opacity-70');
        toggleLabelMed.classList.add('font-semibold');
        toggleLabelMind.classList.add('opacity-70');
        toggleLabelMind.classList.remove('font-semibold');
        addDrugBtn.style.display = 'block';
        currentMode = 'assistant';
    }
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function createMessageBubble(content, sender = "user", timestamp) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("flex", "items-end", "gap-2", "mb-4", "message-fade-in");
    
    const avatar = document.createElement("div");
    avatar.classList.add("w-8", "h-8", "rounded-full", "flex-shrink-0", "flex", "items-center", "justify-center", "font-bold", "text-lg", "shadow-sm");

    const bubbleContainer = document.createElement("div");
    bubbleContainer.classList.add("flex", "flex-col", "max-w-xs", "sm:max-w-md");

    const bubble = document.createElement("div");
    bubble.classList.add("p-3", "rounded-lg", "shadow-sm", "text-body");
    
    const timeEl = document.createElement('span');
    timeEl.classList.add('text-xs', 'text-subtle', 'mt-1');
    timeEl.textContent = formatTime(timestamp || new Date());

    if (sender === 'assistant') {
        wrapper.classList.add("justify-start");
        avatar.classList.add("primary-accent-bg", "text-white");
        avatar.textContent = currentMode === 'assistant' ? "🤖" : "💬";
        bubble.classList.add("chat-bubble-bot", "rounded-bl-none");
        bubbleContainer.classList.add("items-start");
        wrapper.append(avatar, bubbleContainer);
    } else { // user
        wrapper.classList.add("justify-end");
        avatar.classList.add("bg-gray-300", "text-gray-600");
        avatar.textContent = "나";
        bubble.classList.add("chat-bubble-user", "text-white", "rounded-br-none");
        bubbleContainer.classList.add("items-end");
        wrapper.append(bubbleContainer, avatar);
    }
    
    bubble.innerHTML = content.replace(/\n/g, '<br>');
    bubbleContainer.append(bubble, timeEl);

    return wrapper;
}

function createLoadingBubble() {
    const wrapper = document.createElement("div");
    wrapper.id = "loading-bubble";
    wrapper.classList.add("flex", "items-end", "gap-2", "mb-4");
    
    const avatar = document.createElement("div");
    avatar.classList.add("w-8", "h-8", "rounded-full", "primary-accent-bg", "flex-shrink-0", "flex", "items-center", "justify-center", "text-lg", "text-white");
    avatar.textContent = currentMode === 'assistant' ? "🤖" : "💬";

    const bubble = document.createElement("div");
    bubble.classList.add("p-3", "rounded-lg", "chat-bubble-bot", "max-w-xs", "sm:max-w-md", "animate-pulse", "rounded-bl-none");
    bubble.innerHTML = `<div class="h-4 bg-gray-200 rounded w-24"></div>`;
    
    wrapper.append(avatar, bubble);
    return wrapper;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderDrugTags() {
    drugTagsContainer.innerHTML = '';
    currentQueryDrugs.forEach((drug, index) => {
        const tag = document.createElement('div');
        tag.className = 'component flex items-center tag-bg tag-text text-sm font-medium px-2.5 py-0.5 rounded-full';
        tag.innerHTML = `
            <span>${drug.name} (${drug.ingredient})</span>
            <button type="button" data-index="${index}" class="ml-2 primary-accent-text">&times;</button>
        `;
        drugTagsContainer.appendChild(tag);
    });
}

// --- API & Logic Functions ---
function getProfileContext() {
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const conditions = document.getElementById('conditions').value;
    const medications = document.getElementById('medications').value;
    return `[사용자 프로필]\n- 나이: ${age}세\n- 성별: ${gender}\n- 기저질환: ${conditions || '없음'}\n- 현재 복용 약물: ${medications || '없음'}`;
}

async function getAssistantResponse(userMessage) {
    let url;
    let payload;
    let finalMessage = userMessage;
    
    if (currentMode === 'assistant') {
        const profileContext = getProfileContext();
        const drugContext = currentQueryDrugs.length > 0 ? `[질문 약물]\n${currentQueryDrugs.map(d => `- ${d.name}(${d.ingredient})`).join('\n')}` : '';
        finalMessage = `${profileContext}\n\n${drugContext}\n\n[질문]\n${userMessage}`.trim();
        
        const thread_id = await getMetadata("assistant_thread_id");
        payload = { message: finalMessage, thread_id: thread_id };
        url = `${BASE_URL}/assistant`;
    } else { // naive mode for mind counseling
        const allMsgs = (await getAllMessages()).filter(m => m.mode === 'naive');
        const messagesForAPI = [
            { role: "system", content: "당신은 사용자의 마음을 위로하고 공감해주는 따뜻한 상담사 '마음이'입니다. 사용자의 이야기에 깊이 공감하며, 안정감을 주는 말투로 대화해주세요. 모든 답변은 한국어로, 다정하게 해주세요." },
            ...allMsgs.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: finalMessage },
        ];
        payload = { messages: messagesForAPI };
        url = `${BASE_URL}/chat`;
    }

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${errText}`);
    }

    const data = await response.json();

    if (currentMode === "assistant" && data.thread_id) {
        await saveMetadata("assistant_thread_id", data.thread_id);
    }
    
    await saveMessage("user", userMessage, currentMode);
    await saveMessage("assistant", data.reply, currentMode);

    return data.reply;
}

function searchDrugs(term) {
    const mockResults = [
        { id: '1', name: '타이레놀정500mg', ingredient: '아세트아미노펜' },
        { id: '2', name: '부루펜정', ingredient: '이부프로펜' },
        { id: '3', name: '베아제정', ingredient: '판크레아틴 복합' },
        { id: '4', name: '겔포스엠현탁액', ingredient: '알마게이트 복합' },
        { id: '5', name: '파리에트정', ingredient: '라베프라졸' },
        { id: '6', name: '란소정', ingredient: '란소프라졸' },
        { id: '7', name: '가스모틴정', ingredient: '모사프리드' },
        { id: '8', name: '큐란정', ingredient: '라니티딘' },
        { id: '9', name: '자렐토정', ingredient: '리바록사반' },
        { id: '10', name: '플라빅스정', ingredient: '클로피도그렐' },
        { id: '11', name: '로벨리토정', ingredient: '텔미사르탄 복합' },
        { id: '12', name: '아모디핀정', ingredient: '암로디핀' },
        { id: '13', name: '크레스토정', ingredient: '로수바스타틴' },
        { id: '14', name: '리피토정', ingredient: '아토르바스타틴' },
        { id: '15', name: '디오반정', ingredient: '발사르탄' },
        { id: '16', name: '지르텍정', ingredient: '세티리진' },
        { id: '17', name: '알레그라정', ingredient: '페폭소페나딘' },
        { id: '18', name: '페라딘정', ingredient: '로라타딘' },
        { id: '19', name: '이모듐캡슐', ingredient: '로페라마이드' },
        { id: '20', name: '타나민정', ingredient: '은행잎추출물' },
        { id: '21', name: '자녹센정', ingredient: '덱시부프로펜' },
        { id: '22', name: '펜잘큐정', ingredient: '아세트아미노펜 복합' },
        { id: '23', name: '헬리코캡슐', ingredient: '아목시실린 복합' },
        { id: '24', name: '스티렌정', ingredient: '징크카르노신' },
        { id: '25', name: '시메치콘정', ingredient: '시메치콘' },
        { id: '26', name: '오로나민씨드링크정', ingredient: '비타민C' },
        { id: '27', name: '센트룸 포맨', ingredient: '종합비타민' },
        { id: '28', name: '비맥스 메타', ingredient: '비타민B군 복합' },
        { id: '29', name: '에너비타정', ingredient: '비타민B1' },
        { id: '30', name: '쏘팔메토 옥타코사놀', ingredient: '쏘팔메토' },
        { id: '31', name: '오메가3골드', ingredient: '오메가3' },
        { id: '32', name: '루테인플러스', ingredient: '루테인 복합' },
        { id: '33', name: '칼디맥스디', ingredient: '칼슘 복합' },
        { id: '34', name: '마그온정', ingredient: '마그네슘' },
        { id: '35', name: '철분정 푸로틴', ingredient: '철분' },
        { id: '36', name: '락토핏 생유산균 골드', ingredient: '유산균' }
        ].filter(d => d.name.toLowerCase().includes(term.toLowerCase()) || d.ingredient.toLowerCase().includes(term.toLowerCase()));
    
    drugSearchResults.innerHTML = '';
    if (mockResults.length === 0) {
        drugSearchResults.innerHTML = '<p class="text-sm text-subtle p-4 text-center">검색 결과가 없습니다.</p>';
        return;
    }

    mockResults.forEach(drug => {
        const resultItem = document.createElement('div');
        resultItem.className = 'p-3 border-b border-color cursor-pointer hover:bg-main';
        resultItem.innerHTML = `<p class="font-semibold text-body">${drug.name}</p><p class="text-sm text-subtle">${drug.ingredient}</p>`;
        resultItem.onclick = () => {
            if (!currentQueryDrugs.some(d => d.id === drug.id)) {
                currentQueryDrugs.push(drug);
                renderDrugTags();
            }
            drugModal.classList.add('hidden');
        };
        drugSearchResults.appendChild(resultItem);
    });
}

async function loadChatHistory() {
    const allMsgs = (await getAllMessages()).filter(m => m.mode === currentMode);
    chatMessages.innerHTML = ''; 
    
    if (allMsgs.length === 0) {
        const welcomeMsg = currentMode === 'assistant' 
            ? "안녕하세요! 복용하시려는 약에 대해 궁금한 점을 질문해주세요.<br><br><span class='text-xs text-subtle'>본 서비스는 정보 제공을 목적으로 하며, 의학적 진단을 대체할 수 없습니다.</span>"
            : "안녕하세요, 마음 상담사 '마음이'입니다. 어떤 이야기든 편안하게 들려주세요.";
        chatMessages.appendChild(createMessageBubble(welcomeMsg, "assistant", new Date()));
    } else {
        for (const msg of allMsgs) {
            chatMessages.appendChild(createMessageBubble(msg.content, msg.role, msg.timestamp));
        }
    }
    scrollToBottom();
}

// --- Event Listeners ---
messageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message && currentQueryDrugs.length === 0) return;

    const fullQuestionForUI = `${currentQueryDrugs.map(d => `[${d.name}]`).join(' ')} ${message}`.trim();
    chatMessages.appendChild(createMessageBubble(fullQuestionForUI, "user"));
    scrollToBottom();
    
    const loadingBubble = createLoadingBubble();
    chatMessages.appendChild(loadingBubble);
    scrollToBottom();

    userInput.value = "";
    
    try {
        const response = await getAssistantResponse(message);
        loadingBubble.remove();
        chatMessages.appendChild(createMessageBubble(response, "assistant"));
        scrollToBottom();
    } catch (error) {
        console.error("Error fetching assistant response:", error);
        const errMsg = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        loadingBubble.remove();
        chatMessages.appendChild(createMessageBubble(errMsg, "assistant"));
        scrollToBottom();
    } finally {
        currentQueryDrugs = [];
        renderDrugTags();
    }
});

themeToggle.addEventListener('change', (e) => {
    const isCalm = e.target.checked;
    applyTheme(isCalm);
    localStorage.setItem('chatTheme', isCalm ? 'calm' : 'default');
    loadChatHistory();
});

newChatBtn.addEventListener("click", async () => {
    if (confirm("모든 대화 기록을 지우고 새로 시작하시겠습니까? (현재 모드의 기록만 삭제됩니다)")) {
        const allMessages = await getAllMessages();
        const otherMessages = allMessages.filter(m => m.mode !== currentMode);
        
        await clearAllData();

        // 다른 모드 메시지 다시 저장
        const tx = db.transaction("chats", "readwrite");
        const store = tx.objectStore("chats");
        otherMessages.forEach(msg => store.add(msg));
        
        // 메타데이터는 모드별로 관리
        if (currentMode === 'assistant') {
            await saveMetadata('naive_thread_id', await getMetadata('naive_thread_id'));
        } else {
            await saveMetadata('assistant_thread_id', await getMetadata('assistant_thread_id'));
        }

        await loadChatHistory();
    }
});

menuToggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('hidden');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
});

addDrugBtn.addEventListener('click', () => drugModal.classList.remove('hidden'));
closeModalBtn.addEventListener('click', () => drugModal.classList.add('hidden'));
drugSearchBtn.addEventListener('click', () => searchDrugs(drugSearchInput.value));
drugSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchDrugs(drugSearchInput.value); }
});

saveProfileBtn.addEventListener('click', () => {
    saveProfileBtn.textContent = '저장 완료!';
    saveProfileBtn.classList.remove('primary-accent-bg', 'primary-accent-bg-hover');
    saveProfileBtn.classList.add('bg-green-500');
    setTimeout(() => {
        saveProfileBtn.textContent = '프로필 저장';
        saveProfileBtn.classList.remove('bg-green-500');
        saveProfileBtn.classList.add('primary-accent-bg', 'primary-accent-bg-hover');
    }, 2000);
});

// --- Initialization ---
async function initializeApp() {
    await initDB();
    const savedTheme = localStorage.getItem('chatTheme');
    const isCalm = savedTheme === 'calm';
    themeToggle.checked = isCalm;
    applyTheme(isCalm);
    await loadChatHistory();
}

initializeApp();