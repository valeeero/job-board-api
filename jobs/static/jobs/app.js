// === Модалка логина ===
function showLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "block";
}

function hideLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "none";
}

// === Статус авторизации (JWT в localStorage) ===
function updateAuthStatus() {
  const token = localStorage.getItem("token");
  const el = document.getElementById("authStatus");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!el) return;

  if (token) {
    el.className = "badge bg-success ms-1";
    el.textContent = "✅ Logged in";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    el.className = "badge bg-danger ms-1";
    el.textContent = "❌ Not logged in";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

// === Обёртка над fetch с JWT ===
async function authGet(url) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  return res.json();
}

// === Логин по API (SimpleJWT) ===
async function apiLogin() {
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const resultEl = document.getElementById("tokenResult");

  if (!usernameEl || !passwordEl || !resultEl) return;

  const username = usernameEl.value;
  const password = passwordEl.value;

  try {
    const res = await fetch("/api/auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.access) {
      localStorage.setItem("token", data.access);

      resultEl.innerHTML = `<div class="alert alert-success">
           ✅ Token saved!
           <br><small>${data.access.slice(0, 30)}...</small>
         </div>`;

      hideLogin();
      updateAuthStatus();
    } else {
      resultEl.innerHTML = `<div class="alert alert-danger">
           ❌ Login failed
         </div>`;
    }
  } catch (err) {
    resultEl.innerHTML = '<div class="alert alert-danger">❌ Error</div>';
  }
}

// === Logout ===
function logout() {
  localStorage.removeItem("token");
  updateAuthStatus();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = "none";

  const section = document.getElementById("myJobsSection");
  const content = document.getElementById("myJobsContent");

  if (content && section) {
    content.innerHTML =
      '<div class="alert alert-info">🔓 Logged out successfully</div>';
    section.style.display = "block";
  }
}

// === My Jobs (если есть блок на странице) ===
async function showMyJobs() {
  const section = document.getElementById("myJobsSection");
  const content = document.getElementById("myJobsContent");

  if (!section || !content) return;

  section.style.display = "block";
  content.innerHTML = '<div class="spinner-border"></div> Loading...';

  try {
    const data = await authGet("/api/jobs/my_jobs/");

    if (!data.is_authenticated) {
      content.innerHTML = `
        <div class="alert alert-warning">
          🔐 <strong>Login first!</strong><br>
          <small>Token: ${localStorage.getItem("token") ? "Saved ✓" : "Missing"}</small>
        </div>`;
      return;
    }

    content.innerHTML = `
      <div class="alert alert-success mb-3">
        ✅ <strong>${data.username}</strong> (id: ${data.user_id})<br>
        📧 ${data.user_email || "no email"}<br>
        📊 Total jobs: ${data.total_jobs} | Active: ${data.active_jobs}
      </div>`;
  } catch (err) {
    content.innerHTML = '<div class="alert alert-danger">❌ API Error</div>';
  }
}

async function loadMyApplications() {
  const section = document.getElementById("myJobsSection");
  const content = document.getElementById("myJobsContent");
  if (!section || !content) return;

  section.style.display = "block";
  content.innerHTML = '<div class="spinner-border"></div> Loading...';

  try {
    const data = await authGet("/api/my_applications/");

    const apps = data.results || [];
    if (!apps.length) {
      content.innerHTML =
        '<div class="alert alert-info">No applications yet</div>';
      return;
    }

    const items = apps
      .map(
        (a) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span><strong>${a.job_title}</strong> @ ${a.company_name}</span>
        <span class="badge bg-secondary">
          ${new Date(a.created_at).toLocaleDateString()}
        </span>
      </li>
    `,
      )
      .join("");

    content.innerHTML = `
      <div class="mb-2 fw-bold">My applications:</div>
      <ul class="list-group">${items}</ul>
    `;
  } catch (err) {
    content.innerHTML = '<div class="alert alert-danger">❌ API Error</div>';
  }
}

document.addEventListener("DOMContentLoaded", updateAuthStatus);
