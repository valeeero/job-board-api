// === Modal ===
function showLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "block";
}

function hideLogin() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "none";
}

// === Add Job Modal ===
function showAddJob() {
  const token = localStorage.getItem("token");
  if (!token) {
    showToast("⚠️ Please login first", "warning");
    showLogin();
    return;
  }

  const modal = document.getElementById("addJobModal");
  if (modal) {
    modal.style.display = "block";
    loadCompanies();
  }
}

function hideAddJob() {
  const modal = document.getElementById("addJobModal");
  if (modal) modal.style.display = "none";
  document.getElementById("addJobForm").reset();
}

// === Load Companies for Dropdown ===
async function loadCompanies() {
  try {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("/api/jobs/", { headers });
    const data = await res.json();

    // Handle pagination
    const jobs = data.results || data || [];

    // Extract unique companies
    const companiesMap = new Map();
    jobs.forEach((job) => {
      if (job.company && job.company.id && job.company.name) {
        companiesMap.set(job.company.id, job.company.name);
      }
    });

    const select = document.getElementById("jobCompany");
    if (!select) return;

    let options = '<option value="">Select company...</option>';
    companiesMap.forEach((name, id) => {
      options += `<option value="${id}">${name}</option>`;
    });

    select.innerHTML = options;
  } catch (err) {
    console.error("Error loading companies:", err);
    showToast("⚠️ Failed to load companies", "warning");
  }
}

// === Create Job ===
async function createJob(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    showToast("⚠️ Please login first", "warning");
    return;
  }

  const status = document.getElementById("addJobStatus");
  const submitBtn = document.querySelector('#addJobForm button[type="submit"]');

  const jobData = {
    title: document.getElementById("jobTitle").value,
    company_id: parseInt(document.getElementById("jobCompany").value),
    description: document.getElementById("jobDescription").value,
    salary_min: document.getElementById("jobSalaryMin").value || null,
    salary_max: document.getElementById("jobSalaryMax").value || null,
    location: document.getElementById("jobLocation").value,
    skills: document.getElementById("jobSkills").value,
    is_active: true,
  };

  status.textContent = "Creating...";
  submitBtn.disabled = true;

  try {
    const res = await fetch("/api/jobs/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    if (res.ok) {
      status.textContent = "";
      submitBtn.disabled = false;
      hideAddJob();
      showToast("✅ Job created successfully!", "success");

      // Reload page to show new job
      setTimeout(() => window.location.reload(), 1500);
    } else {
      const err = await res.json();
      status.textContent = "";
      submitBtn.disabled = false;
      showToast(`❌ ${JSON.stringify(err)}`, "error");
    }
  } catch (err) {
    status.textContent = "";
    submitBtn.disabled = false;
    showToast("❌ Network error", "error");
  }
}

// === Auth Status Badge ===
function updateAuthStatus() {
  const token = localStorage.getItem("token");
  const el = document.getElementById("authStatus");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginBtn = document.getElementById("loginBtn");

  if (!el) return;

  if (token) {
    el.className = "badge bg-success ms-1";
    el.textContent = "✅ Logged in";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (loginBtn) loginBtn.style.display = "none";
  } else {
    el.className = "badge bg-danger ms-1";
    el.textContent = "❌ Not logged in";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "inline-block";
  }
}

// === Auth Wrapper for Fetch ===
async function authGet(url) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  return res.json();
}

// === Login (JWT) ===
async function apiLogin() {
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const resultEl = document.getElementById("tokenResult");

  if (!usernameEl || !passwordEl || !resultEl) return;

  const username = usernameEl.value;
  const password = passwordEl.value;

  resultEl.textContent = "Logging in...";

  try {
    const res = await fetch("/api/auth/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.access) {
      localStorage.setItem("token", data.access);
      resultEl.textContent = "";
      hideLogin();
      updateAuthStatus();
      await checkAppliedJobs();
      showToast("✅ Logged in successfully!", "success");
    } else {
      resultEl.textContent = "❌ Login failed";
      showToast("❌ Invalid credentials", "error");
    }
  } catch (err) {
    resultEl.textContent = "❌ Error";
    showToast("❌ Connection error", "error");
  }
}

// === Logout ===
function logout() {
  localStorage.removeItem("token");
  updateAuthStatus();

  const section = document.getElementById("myJobsSection");
  if (section) section.style.display = "none";

  resetApplyButtons();
  showToast("🔓 Logged out successfully", "info");
}

// === Reset Apply Buttons ===
function resetApplyButtons() {
  const buttons = document.querySelectorAll('[id^="apply-btn-"]');
  buttons.forEach((btn) => {
    btn.className = "btn btn-primary btn-sm";
    btn.textContent = "Apply";
    btn.disabled = false;
  });
}

// === Check Applied Jobs on Page Load ===
async function checkAppliedJobs() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const data = await authGet("/api/my_applications/");
    const apps = data.results || data || [];

    apps.forEach((app) => {
      const btn = document.getElementById(`apply-btn-${app.job}`);
      if (btn) {
        btn.className = "btn btn-secondary btn-sm";
        btn.textContent = "Already applied";
        btn.disabled = true;
      }
    });
  } catch (err) {
    console.error("Error checking applied jobs:", err);
  }
}

// === My Applications ===
async function loadMyApplications() {
  const section = document.getElementById("myJobsSection");
  const content = document.getElementById("myJobsContent");
  if (!section || !content) return;

  const token = localStorage.getItem("token");
  if (!token) {
    showToast("⚠️ Please login first", "warning");
    showLogin();
    return;
  }

  section.style.display = "block";
  content.innerHTML = '<div class="spinner-border"></div> Loading...';

  try {
    const data = await authGet("/api/my_applications/");
    const apps = data.results || data || [];

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
    content.textContent = "Error loading applications";
    showToast("❌ Failed to load applications", "error");
  }
}

// === Apply to Job ===
async function applyToJob(jobId) {
  const token = localStorage.getItem("token");
  const btn = document.getElementById(`apply-btn-${jobId}`);

  if (!token) {
    showToast("⚠️ Please login first!", "warning");
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
      showToast("✅ Application submitted!", "success");
    } else if (res.status === 400 && data.detail === "Already applied") {
      btn.className = "btn btn-secondary btn-sm";
      btn.textContent = "Already applied";
      btn.disabled = true;
      showToast("ℹ️ Already applied", "info");
    } else {
      showToast(`❌ ${data.detail || "Application failed"}`, "error");
      btn.disabled = false;
      btn.textContent = "Apply";
    }
  } catch (err) {
    showToast("❌ Network error", "error");
    btn.disabled = false;
    btn.textContent = "Apply";
  }
}

// === Load Profile (only on /profile/) ===
async function loadProfile() {
  const container = document.getElementById("profileForm");
  if (!container) return;

  const token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML = `
      <div class="alert alert-warning">
        🔐 Please <a href="/">login</a> first
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
    container.textContent = "Error loading profile";
    showToast("❌ Failed to load profile", "error");
  }
}

// === Save Profile ===
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

  status.textContent = "Saving...";

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
      status.textContent = "";
      showToast("✅ Profile saved!", "success");
    } else {
      const err = await res.json();
      status.textContent = "";
      showToast(`❌ ${JSON.stringify(err)}`, "error");
    }
  } catch (err) {
    status.textContent = "";
    showToast("❌ Network error", "error");
  }
}

// === Show Animated Toast Message ===
function showToast(message, type = "success") {
  // Remove existing toast if any
  const existingToast = document.querySelector(".custom-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Auto hide after 3 seconds
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// === Init on Page Load ===
document.addEventListener("DOMContentLoaded", () => {
  updateAuthStatus();
  loadProfile();
  checkAppliedJobs();

  // Add Job Form Handler
  const addJobForm = document.getElementById("addJobForm");
  if (addJobForm) {
    addJobForm.addEventListener("submit", createJob);
  }
});
