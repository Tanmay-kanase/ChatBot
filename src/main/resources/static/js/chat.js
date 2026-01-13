const chatContent = document.getElementById("chat-content");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const scrollWindow = document.getElementById("scroll-window");
const convoList = document.getElementById("conversation-list");
const usernameLabel = document.getElementById("username-label");
const labelusername = document.getElementById("label-username");

document.getElementById("profile-btn").onclick = () => {
  document.getElementById("profile-menu").classList.toggle("hidden");
};

document.getElementById("logout-btn").onclick = () => {
  localStorage.clear();
  window.location.href = "/";
};

const MODEL_CONFIG = {
  Coding: "deepseek-v3",
  "Math/Logic": "deepseek-r1",
  "Research/Papers": "claude-3-5-sonnet",
  Translation: "gemini-2.0-flash",
  "Web/Realtime": "gpt-5.2",
  Offline: "llama-3.3",
  Conversation: "gemma3:1b", // Fallback/Default
};

// Global variables for staged file upload
let attachedFileContent = "";
let attachedFileName = "";

document.getElementById("newChatBtn").addEventListener("click", function () {
  window.location.href = "/chat";
});

const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (user && user.username) {
  usernameLabel.innerText = user.username;
  labelusername.innerText = user.username;
}

// ---------- Conversation ID ----------
function getConversationId() {
  const p = new URLSearchParams(window.location.search);
  let id = p.get("conversationId");

  if (!id) {
    const parts = window.location.pathname.split("/");
    const idx = parts.indexOf("chat");
    if (idx !== -1) id = parts[idx + 1];
  }
  return id;
}
const conversationId = getConversationId();

async function routeModel(userMsg) {
  try {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma3:1b", // Use a lightweight model for routing
        messages: [
          {
            role: "system",
            content: `Classify the user prompt into exactly one category: Coding, Math/Logic, Research/Papers, Translation, Web/Realtime, Offline, or Conversation. Return ONLY the category name.`,
          },
          { role: "user", content: userMsg },
        ],
        stream: false,
      }),
    });
    const data = await res.json();
    const category = data.message.content.trim();
    return MODEL_CONFIG[category] || MODEL_CONFIG["Conversation"];
  } catch (e) {
    return MODEL_CONFIG["Conversation"]; // Fallback on error
  }
}

async function askOllamaSimpleReply(userMsg, modelName) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName, // DYNAMIC MODEL NAME
      messages: [{ role: "user", content: userMsg }],
      stream: false,
    }),
  });
  const data = await res.json();
  return data.message.content;
}
// ================== UI Helpers ==================
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("w-64");
  sidebar.classList.toggle("w-0");
}

function autoGrow(el) {
  el.style.height = "5px";
  el.style.height = el.scrollHeight + "px";
}

function appendMsg(role, text) {
  const div = document.createElement("div");
  div.className =
    "msg flex " + (role === "user" ? "justify-end" : "gap-6 items-start");

  if (role === "user") {
    div.innerHTML = `
      <div class="bg-black text-white px-4 py-2 rounded-2xl max-w-xs text-sm">
        ${text}
      </div>`;
  } else {
    div.innerHTML = `
      <div class="w-8 h-8 bg-black rounded-sm flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">S</div>
      <div class="flex-1 space-y-4">
        <p class="text-sm leading-relaxed text-gray-800">${text}</p>
      </div>`;
  }

  chatContent.appendChild(div);
  scrollWindow.scrollTop = scrollWindow.scrollHeight;
}

function appendFileChipUI(fileName) {
  const div = document.createElement("div");
  div.className = "msg flex justify-end mb-2";
  div.innerHTML = `
    <div class="bg-gray-100 border border-gray-300 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
      <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <span class="text-xs font-bold uppercase tracking-tight">${fileName}</span>
    </div>`;
  chatContent.appendChild(div);
  scrollWindow.scrollTop = scrollWindow.scrollHeight;
}

// ---------- File Handling Logic ----------
async function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  attachedFileName = file.name;

  try {
    if (fileName.endsWith(".pdf")) {
      attachedFileContent = await readPdf(file);
    } else if (fileName.endsWith(".docx")) {
      attachedFileContent = await readDocx(file);
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      attachedFileContent = await readExcel(file);
    } else if (
      fileName.endsWith(".csv") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".json")
    ) {
      attachedFileContent = await readAsPlainText(file);
    } else {
      alert("Unsupported file format.");
      return;
    }

    // Show preview in the input area
    document.getElementById("preview-filename").innerText = attachedFileName;
    document.getElementById("file-preview-area").classList.remove("hidden");
    chatInput.placeholder = "Add a prompt for this file...";
  } catch (error) {
    console.error(error);
    appendMsg("ai", `❌ Error reading file: ${error.message}`);
  }
  input.value = "";
}

function removeAttachedFile() {
  attachedFileContent = "";
  attachedFileName = "";
  document.getElementById("file-preview-area").classList.add("hidden");
  chatInput.placeholder = "Type your message...";
}

// --- Extraction Helpers ---
function readAsPlainText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsText(file);
  });
}

async function readPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

async function readDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return result.value;
}

async function readExcel(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  let text = "";
  workbook.SheetNames.forEach((name) => {
    text += `Sheet: ${name}\n${XLSX.utils.sheet_to_csv(
      workbook.Sheets[name]
    )}\n`;
  });
  return text;
}

// ---------- API Services ----------
async function askOllamaWithTitle(userMsg) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:1b",
      messages: [
        {
          role: "system",
          content:
            'You are an AI that: 1. Answers the user. 2. Generates a short conversation title (2–4 words). Return ONLY valid JSON: {"title":"...","reply":"..."}',
        },
        { role: "user", content: userMsg },
      ],
      stream: false,
    }),
  });
  const data = await res.json();
  const raw = data.message.content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  return JSON.parse(raw.substring(start, end + 1));
}

async function askOllamaSimpleReply(userMsg) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:1b",
      messages: [{ role: "user", content: userMsg }],
      stream: false,
    }),
  });
  const data = await res.json();
  return data.message.content;
}

async function saveMessageToDb(convoId, sender, text) {
  return fetch("http://localhost:8888/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      conversationId: convoId,
      sender: sender,
      messageText: text,
    }),
  });
}

async function createConversation(title) {
  const res = await fetch(
    `http://localhost:8888/api/conversations/create/${user.userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationName: title }),
    }
  );
  return await res.json();
}

// ---------- Unified Send Logic ----------
async function sendMessage() {
  const userPrompt = chatInput.value.trim();
  if (!userPrompt && !attachedFileContent) return;

  // ... (Keep your UI state management and File Chip logic) ...

  appendMsg("ai", "Selecting best model..."); // Feedback for routing

  let fullPrompt = userPrompt;
  if (tempFileContent) {
    fullPrompt = `[Attached File: ${tempFileName}]\nContent:\n${tempFileContent}\n\nUser Instruction: ${
      userPrompt || "Please analyze this file."
    }`;
  }

  try {
    // DYNAMIC ROUTING STEP
    const selectedModel = await routeModel(fullPrompt);
    console.log(`Routing to: ${selectedModel}`);

    let currentId = getConversationId();
    let aiReply = "";

    // Update your request to use 'selectedModel' instead of hardcoded strings
    if (!currentId) {
      // Use the router model to get title, then final model for reply
      const aiData = await askOllamaWithTitle(fullPrompt, selectedModel);
      aiReply = aiData.reply;
      // ... (Rest of conversation creation logic) ...
    } else {
      aiReply = await askOllamaSimpleReply(fullPrompt, selectedModel);
      // ... (Rest of message saving logic) ...
    }
  } catch (e) {
    appendMsg("ai", "⚠️ Failed to process message.");
  }
}

// ---------- Initial Load ----------
async function loadConversations() {
  const res = await fetch(
    `http://localhost:8888/api/conversations/user/${user.userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  convoList.innerHTML = "";
  data.forEach((c) => {
    const item = document.createElement("div");
    item.className =
      "px-3 py-2 rounded-lg cursor-pointer text-sm truncate hover:bg-gray-200" +
      (String(c.conversationId) === String(conversationId)
        ? " bg-gray-200 font-bold"
        : "");
    item.innerText = c.conversationName || "New Conversation";
    item.onclick = () => {
      window.location.href = `/chat?conversationId=${c.conversationId}`;
    };
    convoList.appendChild(item);
  });
}

async function loadMessages() {
  if (!conversationId) return;
  const res = await fetch(
    `http://localhost:8888/api/messages/conversation/${conversationId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  chatContent.innerHTML = "";
  data.forEach((m) => {
    appendMsg(m.sender === "user" ? "user" : "ai", m.messageText);
  });
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

loadConversations();
if (conversationId) loadMessages();
