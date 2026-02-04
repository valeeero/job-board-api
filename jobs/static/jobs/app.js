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
async function applyToJob(jobId) {
  const token = localStorage.getItem("token");
  const btn = document.getElementById(`apply-btn-${jobId}`);

  if (!token) {
    alert("⚠️ Please login first!");
    showLogin();
    return;
  }

  btn.disabled = true;
  btn.textContent = "Applying...";

  try {
    const res = await fetch(`/api/jobs/${jobId}/apply/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (res.status === 201) {
      btn.className = "btn btn-success btn-sm";
      btn.textContent = "✅ Applied";
      btn.disabled = true;
    } else if (res.status === 400 && data.detail === "Already applied") {
      btn.className = "btn btn-secondary btn-sm";
      btn.textContent = "Already applied";
      btn.disabled = true;
    } else {
      alert(`❌ Error: ${data.detail || "Unknown error"}`);
      btn.disabled = false;
      btn.textContent = "Apply";
    }
  } catch (err) {
    alert("❌ Network error");
    btn.disabled = false;
    btn.textContent = "Apply";
  }
}

async function loadProfile() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("profileForm");

  if (!token) {
    container.innerHTML = `
      <div class="alert alert-warning">
        🔐 Please <a href="/" onclick="showLogin()">login</a> first
      </div>`;
    return;
  }

  try {
    const res = await fetch("/api/profile/me/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profile = await res.json();

    container.innerHTML = `
      <form id="saveForm" class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Location</label>
          <input type="text" class="form-control" id="location" value="${profile.location || ""}">
        </div>

        <div class="col-md-6">
          <label class="form-label">Experience</label>
          <select class="form-select" id="experience_range">
            <option value="">Select...</option>
            <option value="lt1" ${profile.experience_range === "lt1" ? "selected" : ""}>< 1 year</option>
            <option value="1_2" ${profile.experience_range === "1_2" ? "selected" : ""}>1-2 years</option>
            <option value="2_3" ${profile.experience_range === "2_3" ? "selected" : ""}>2-3 years</option>
            <option value="3_5" ${profile.experience_range === "3_5" ? "selected" : ""}>3-5 years</option>
            <option value="5_8" ${profile.experience_range === "5_8" ? "selected" : ""}>5-8 years</option>
            <option value="8plus" ${profile.experience_range === "8plus" ? "selected" : ""}>8+ years</option>
          </select>
        </div>

        <div class="col-md-6">
          <label class="form-label">Salary expectation ($)</label>
          <input type="number" class="form-control" id="salary_expectation" value="${profile.salary_expectation || ""}">
        </div>

        <div class="col-md-6">
          <label class="form-label">English level</label>
          <select class="form-select" id="english_level">
            <option value="">Select...</option>
            <option value="A1" ${profile.english_level === "A1" ? "selected" : ""}>A1</option>
            <option value="A2" ${profile.english_level === "A2" ? "selected" : ""}>A2</option>
            <option value="B1" ${profile.english_level === "B1" ? "selected" : ""}>B1</option>
            <option value="B2" ${profile.english_level === "B2" ? "selected" : ""}>B2</option>
            <option value="C1" ${profile.english_level === "C1" ? "selected" : ""}>C1</option>
            <option value="C2" ${profile.english_level === "C2" ? "selected" : ""}>C2</option>
          </select>
        </div>

        <div class="col-12">
          <label class="form-label">Bio</label>
          <textarea class="form-control" id="bio" rows="3">${profile.bio || ""}</textarea>
        </div>

        <div class="col-12">
          <label class="form-label">Skills (comma-separated)</label>
          <input type="text" class="form-control" id="skills" value="${(profile.skills || []).join(", ")}">
          <small class="text-muted">Separate skills with commas</small>
        </div>


        <div class="col-12">
          <button type="submit" class="btn btn-primary">💾 Save Profile</button>
          <span id="saveStatus" class="ms-2"></span>
        </div>
      </form>
    `;

    document.getElementById("saveForm").addEventListener("submit", saveProfile);
  } catch (err) {
    container.innerHTML =
      '<div class="alert alert-danger">❌ Error loading profile</div>';
  }
}

async function saveProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const status = document.getElementById("saveStatus");

  const data = {
    location: document.getElementById("location").value,
    experience_range: document.getElementById("experience_range").value,
    salary_expectation:
      document.getElementById("salary_expectation").value || null,
    english_level: document.getElementById("english_level").value,
    bio: document.getElementById("bio").value,
    skills: document
      .getElementById("skills")
      .value.split(",")
      .map((s) => s.trim())
      .filter((s) => s),
  };

  status.innerHTML = '<span class="text-muted">Saving...</span>';

  try {
    const res = await fetch("/api/profile/me/", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      status.innerHTML = '<span class="text-success">✅ Saved!</span>';
      setTimeout(() => (status.innerHTML = ""), 3000);
    } else {
      const err = await res.json();
      status.innerHTML = `<span class="text-danger">❌ ${JSON.stringify(err)}</span>`;
    }
  } catch (err) {
    status.innerHTML = '<span class="text-danger">❌ Network error</span>';
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);

document.addEventListener("DOMContentLoaded", updateAuthStatus);
