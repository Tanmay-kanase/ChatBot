document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("❌ loginForm not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // 🚨 this stops ?email=... redirect

    const formData = new FormData(form);

    const payload = {
      email: formData.get("email") || formData.get("username"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("http://localhost:8888/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/chat";
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      alert("Server error. Try again.");
    }
  });
});
