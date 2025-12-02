document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ login, password })
  });

  const result = await response.json();

  if (result.success) {
    window.location.href = "/admin.html?auth=1";
  } else {
    alert("Login incorreto!");
  }
});
