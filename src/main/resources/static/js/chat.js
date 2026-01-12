const chatContent = document.getElementById("chat-content");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const scrollWindow = document.getElementById("scroll-window");
const convoList = document.getElementById("conversation-list");
const usernameLabel = document.getElementById("username-label");
document.getElementById("newChatBtn").addEventListener("click", function () {
  window.location.href = "/chat";
});
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

usernameLabel.innerText = user.username;

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
// ================== UI ==================
function toggleSidebar() {
  sidebar.classList.toggle("closed");
}

function autoGrow(el) {
  el.style.height = "5px";
  el.style.height = el.scrollHeight + "px";
}
// ---------- UI ----------
function appendMsg(role, text) {
  const div = document.createElement("div");
  div.className = "msg flex " + (role === "user" ? "justify-end" : "gap-3");

  if (role === "user") {
    div.innerHTML = `
      <div class="bg-black text-white px-4 py-2 rounded-2xl max-w-xs">
        ${text}
      </div>`;
  } else {
    div.innerHTML = `
      <div class="w-8 h-8 bg-black text-white flex items-center justify-center text-xs rounded-md">S</div>
      <div class="bg-gray-100 px-4 py-2 rounded-2xl max-w-xs">
        ${text}
      </div>`;
  }

  chatContent.appendChild(div);
  scrollWindow.scrollTop = scrollWindow.scrollHeight;
}

// ---------- Load Conversations ----------
async function loadConversations() {
  const res = await fetch(
    `http://localhost:8888/api/conversations/user/${user.userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  convoList.innerHTML = "";

  data.forEach((c) => {
    const item = document.createElement("div");
    item.className =
      "px-3 py-2 rounded-lg cursor-pointer text-sm truncate hover:bg-gray-200";

    if (String(c.conversationId) === String(conversationId))
      item.classList.add("active-convo");

    item.innerText = c.conversationName || "New Conversation";

    item.onclick = () => {
      window.location.href = `/chat?conversationId=${c.conversationId}`;
    };

    convoList.appendChild(item);
  });
}

// ---------- Load Messages ----------
async function loadMessages() {
  if (!conversationId) return;

  const res = await fetch(
    `http://localhost:8888/api/messages/conversation/${conversationId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  chatContent.innerHTML = "";

  data.forEach((m) => {
    appendMsg(m.sender === "user" ? "user" : "ai", m.messageText);
  });
}

// ---------- Send ----------
sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function askOllamaWithTitle(userMsg) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:1b",
      messages: [
        {
          role: "system",
          content: `
You are an AI that:
1. Answers the user.
2. Generates a short conversation title (2–4 words).

Return ONLY valid JSON.
No markdown. No explanation.

Format:
{"title":"...","reply":"..."}
          `,
        },
        { role: "user", content: userMsg },
      ],
      stream: false,
    }),
  });

  const data = await res.json();

  const raw = data.message.content;
  console.log("RAW OLLAMA RESPONSE:", raw);

  // 🧠 Extract JSON safely
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON found in Ollama response");
  }

  const jsonString = raw.substring(start, end + 1);

  return JSON.parse(jsonString);
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
      body: JSON.stringify({
        conversationName: title,
      }),
    }
  );

  return await res.json(); // { conversationId, ... }
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

// Dedicated function to save to DB to avoid repeating code
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

async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  appendMsg("user", msg);
  chatInput.value = "";
  appendMsg("ai", "Thinking...");

  try {
    let currentId = getConversationId();
    let aiReply = "";
    let convoTitle = "";

    // 1. Get AI Response first (while we still have the context)
    if (!currentId) {
      const aiData = await askOllamaWithTitle(msg);
      aiReply = aiData.reply;
      convoTitle = aiData.title;

      // 2. Create the conversation in DB
      const convo = await createConversation(convoTitle);
      currentId = convo.conversationId;

      // 3. IMPORTANT: Save BOTH messages before redirecting
      // We use await to ensure the DB has the data before the page reloads
      await saveMessageToDb(currentId, "user", msg);
      await saveMessageToDb(currentId, "ai", aiReply);

      // 4. Now redirect (the messages are safe in the DB)
      window.location.href = `/chat?conversationId=${currentId}`;
    } else {
      // Logic for existing conversations
      aiReply = await askOllamaSimpleReply(msg);
      await saveMessageToDb(currentId, "user", msg);
      await saveMessageToDb(currentId, "ai", aiReply);

      // No redirect needed, just refresh the view
      loadConversations();
      loadMessages();
    }
  } catch (e) {
    console.error(e);
    appendMsg("ai", "⚠️ Failed to process message.");
  }
}

// ---------- INIT ----------
loadConversations();
loadMessages();

// At the bottom of your file
window.onload = () => {
  loadConversations();
  if (getConversationId()) {
    loadMessages();
  }
};
