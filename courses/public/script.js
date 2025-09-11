// ─────────────────────────────────────────────────────────────
// Frontend JS for Course Matrix
// ─────────────────────────────────────────────────────────────

const BACKEND_URL = "https://coursematrix.onrender.com/"; // Render backend URL
let currentRoll = null;

// ─────────────────────────────────────────────────────────────
// Student Registration
// ─────────────────────────────────────────────────────────────
async function registerStudent() {
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const department = document.getElementById("reg-dept").value;
  const semester = document.getElementById("reg-sem").value;
  const msg = document.getElementById("reg-msg");
  msg.textContent = "";

  if (!name || !email || !department || !semester) {
    msg.textContent = "All fields required";
    msg.style.color = "red";
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, department, semester }),
    });
    const body = await res.json();
    if (!res.ok) {
      msg.textContent = body.message || "Registration failed";
      msg.style.color = "red";
      return;
    }
    currentRoll = body.student.roll;
    msg.innerHTML = `Registered. <strong>Roll:</strong> ${currentRoll}`; 
    msg.style.color = "green";
    document.getElementById("select-courses-trigger").style.display = "inline-block";
    alert(`Your roll number is: ${currentRoll}`);
  } catch (e) {
    msg.textContent = "Network error";
    msg.style.color = "red";
  }
}

// ─────────────────────────────────────────────────────────────
// Student Login
// ─────────────────────────────────────────────────────────────
async function loginStudent() {
  const roll = document.getElementById("login-roll").value.trim();
  const msg = document.getElementById("login-msg");
  msg.textContent = "";
  if (!roll) {
    msg.textContent = "Roll required";
    msg.style.color = "red";
    return;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roll }),
    });
    const body = await res.json();
    if (!res.ok) {
      msg.textContent = body.message || "Login failed";
      msg.style.color = "red";
      return;
    }
    currentRoll = body.student.roll;
    msg.textContent = `Logged in as ${body.student.name}`; 
    msg.style.color = "green";
    document.getElementById("select-courses-trigger").style.display = "inline-block";
  } catch (e) {
    msg.textContent = "Network error";
    msg.style.color = "red";
  }
}

// ─────────────────────────────────────────────────────────────
// Render Registration Form
// ─────────────────────────────────────────────────────────────
function renderRegistrationForm() {
  const area = document.getElementById("auth-area");
  area.innerHTML = `
    <div class="card">
      <div class="auth-section">
        <h3>Student Registration</h3>
        <div class="row">
          <input id="reg-name" placeholder="Name" />
          <input id="reg-email" placeholder="Email" />
          <select id="reg-dept">
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="ME">ME</option>
            <option value="CE">CE</option>
          </select>
          <select id="reg-sem">
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>
        <button class="small-btn" id="btn-register">Register</button>
        <div id="reg-msg" class="feedback"></div>
      </div>
    </div>
  `;
  document.getElementById("btn-register")?.addEventListener("click", registerStudent);
}

// ─────────────────────────────────────────────────────────────
// Render Login Form
// ─────────────────────────────────────────────────────────────
function renderLoginForm() {
  const area = document.getElementById("auth-area");
  area.innerHTML = `
    <div class="card">
      <div class="auth-section">
        <h3>Student Login</h3>
        <div class="row">
          <input id="login-roll" placeholder="Roll Number" />
        </div>
        <button class="small-btn" id="btn-login">Login</button>
        <div id="login-msg" class="feedback"></div>
      </div>
    </div>
  `;
  document.getElementById("btn-login")?.addEventListener("click", loginStudent);
}

// ─────────────────────────────────────────────────────────────
// Create Course Selection Modal
// ─────────────────────────────────────────────────────────────
function createSelectionModal(allocated, previousSelection) {
  const root = document.getElementById("modal-root");
  root.innerHTML = "";
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <button class="close-btn" aria-label="Close">&times;</button>
    <h2 style="margin-top:0;margin-bottom:10px;font-size:24px;">Select Your Courses</h2>
    <div id="msg-area"></div>
    <div class="field">
      <p style="margin:0 0 6px;font-weight:600;">Allocated Courses</p>
      <div class="courses" id="course-list"></div>
    </div>
    <div style="text-align:center;margin-top:8px;">
      <button class="btn" id="save-btn" style="min-width:140px;">Submit Selection</button>
    </div>
  `;

  backdrop.appendChild(modal);
  root.appendChild(backdrop);
  root.style.display = "block";

  modal.querySelector(".close-btn").addEventListener("click", () => {
    root.style.display = "none";
  });

  const list = modal.querySelector("#course-list");
  const msgArea = modal.querySelector("#msg-area");
  const saveBtn = modal.querySelector("#save-btn");
  const selected = new Set();

  allocated.forEach(c => {
    const label = document.createElement("label");
    label.className = "course-checkbox";
    label.innerHTML = `
      <input type="checkbox" value="${c}" />
      <span>${c}</span>
    `;
    const checkbox = label.querySelector("input");
    if (previousSelection && previousSelection.courses?.includes(c)) {
      checkbox.checked = true;
      selected.add(c);
    }
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selected.add(c);
      else selected.delete(c);
    });
    list.appendChild(label);
  });

  saveBtn.addEventListener("click", async () => {
    msgArea.innerHTML = "";
    if (!currentRoll) {
      msgArea.innerHTML = `<div class="error">Login/Register first.</div>`;
      return;
    }
    if (selected.size === 0) {
      msgArea.innerHTML = `<div class="error">Select at least one course.</div>`;
      return;
    }
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    try {
      const res = await fetch(`${BACKEND_URL}/api/select-courses`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          roll: currentRoll,
          courses: Array.from(selected)
        })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed");
      msgArea.innerHTML = `<div class="success">Submitted successfully.</div>`;
      setTimeout(() => {
        root.style.display = "none";
      }, 800);
    } catch (e) {
      msgArea.innerHTML = `<div class="error">${e.message}</div>`;
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Submit Selection";
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Open Course Selection Modal
// ─────────────────────────────────────────────────────────────
async function openSelectCourses() {
  if (!currentRoll) {
    alert("Register or login first to select courses.");
    return;
  }
  try {
    const allocRes = await fetch(`${BACKEND_URL}/api/allocated/${currentRoll}`);
    const allocBody = await allocRes.json();
    if (!allocRes.ok) {
      alert(allocBody.message || "No allocated courses yet. Contact admin.");
      return;
    }
    let prevSel = null;
    const selRes = await fetch(`${BACKEND_URL}/api/selection/${currentRoll}`);
    if (selRes.ok) {
      prevSel = await selRes.json();
      prevSel = prevSel.selection;
    }
    createSelectionModal(allocBody.allocation.courses, prevSel);
  } catch (e) {
    alert("Network error while fetching allocation.");
  }
}

// ─────────────────────────────────────────────────────────────
// Event Listeners for Auth Buttons
// ─────────────────────────────────────────────────────────────
document.getElementById("show-registration")?.addEventListener("click", renderRegistrationForm);
document.getElementById("show-login")?.addEventListener("click", renderLoginForm);
document.getElementById("select-courses-trigger")?.addEventListener("click", openSelectCourses);


