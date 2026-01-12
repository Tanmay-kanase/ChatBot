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

async function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg || !conversationId) return;

  // 1️⃣ Show user message in UI
  appendMsg("user", msg);
  chatInput.value = "";

  // 2️⃣ Show thinking message
  const thinkingDiv = document.createElement("div");
  thinkingDiv.className = "msg flex gap-3";
  thinkingDiv.innerHTML = `
    <div class="w-8 h-8 bg-black text-white flex items-center justify-center text-xs rounded-md">S</div>
    <div class="bg-gray-100 px-4 py-2 rounded-2xl max-w-xs">
      Thinking...
    </div>`;
  chatContent.appendChild(thinkingDiv);
  scrollWindow.scrollTop = scrollWindow.scrollHeight;

  try {
    // Save USER message in DB
    await fetch("http://localhost:8888/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId,
        sender: "user",
        messageText: msg,
      }),
    });

    // Send message to OLLAMA
    // const res = await fetch("http://localhost:11434/api/chat", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     model: "gemma3:1b",
    //     messages: [{ role: "user", content: msg }],
    //     stream: false,
    //   }),
    // });

    // const data = await res.json();
    const aiReply = "data.message.content";

    //  Remove "Thinking..."
    thinkingDiv.remove();

    // Show AI reply in UI
    appendMsg("ai", aiReply);

    // 7️⃣ Save AI message in DB
    await fetch("http://localhost:8888/api/messages/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversationId,
        sender: "ai",
        messageText: aiReply,
      }),
    });
  } catch (err) {
    console.error("Chat error:", err);
    thinkingDiv.remove();
    appendMsg("ai", "⚠️ Something went wrong. Try again.");
  }
}

// ---------- INIT ----------
loadConversations();
loadMessages();
