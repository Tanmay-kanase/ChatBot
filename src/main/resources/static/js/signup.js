document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");

  // Check if form exists to avoid the 'null' error
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault(); // This stops the ?username=tanmay... redirect

      const formData = new FormData(form);
      const payload = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const response = await fetch("http://localhost:8888/api/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json(); // Parse JSON once here

        if (response.ok) {
          console.log("Signup Success:", data);
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href = "/chat";
        } else {
          // This will now show "Email already exists" or "Signup failed"
          console.error("Signup Error:", data);
          alert("Error: " + (data.error || "Something went wrong"));
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    });
  }
});
