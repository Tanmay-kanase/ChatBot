document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("❌ loginForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const email = formData.get("email");
    const password = formData.get("password");

    const payload = { email, password };

    try {
      const response = await fetch("http://localhost:8888/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // 🔥 BACKEND error handling for BOTH email + password
      if (data.error) {
        alert("❌ " + data.error);
        return;
      }

      // Success
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/chat";

    } catch (err) {
      console.error("Login fetch error:", err);
      alert("❌ Server error. Try again.");
    }
  });
});
