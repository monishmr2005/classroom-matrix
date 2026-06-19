// ============================================================
// FILE: app.js
// PURPOSE: Business Logic, Auth Guards, Role Separation & Relational CRUD Data Loops
// ============================================================

// --- THEME INITIALIZATION AND CONTROL ENGINE ---
function initThemeEngine() {
  const storedTheme = localStorage.getItem("sync_theme") || "dark";
  document.documentElement.setAttribute("data-theme", storedTheme);
  updateThemeToggleButtonUI(storedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const targetTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", targetTheme);
  localStorage.setItem("sync_theme", targetTheme);
  updateThemeToggleButtonUI(targetTheme);
}

function updateThemeToggleButtonUI(theme) {
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = theme === "light" ? "🌙" : "☀️";
    toggleBtn.setAttribute("title", theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode");
  }
}

// --- IDENTITY AND SYSTEM ACCESS ROUTER ---
document.addEventListener("DOMContentLoaded", () => {
    initThemeEngine();
    const currentPath = window.location.pathname;
    const activeUser = JSON.parse(localStorage.getItem("sync_active_user"));
  
    if (currentPath.includes("dashboard.html")) {
      if (!activeUser) {
        // Direct Route Guard Protection Kick-back
        window.location.href = "index.html";
      } else {
        // Configure and execute layout assembly based on User Role properties
        document.getElementById("user-display-name").textContent = activeUser.name;
        
        const badge = document.getElementById("role-badge");
        badge.textContent = activeUser.role;
        badge.classList.add(activeUser.role.toLowerCase());
  
        if (activeUser.role === "Teacher") {
          document.querySelectorAll(".teacher-only").forEach(el => el.classList.remove("hidden"));
        } else {
          document.querySelectorAll(".student-only").forEach(el => el.classList.remove("hidden"));
        }
        
        renderWorkspaceFeed();
      }
    } else if (currentPath.includes("index.html") || currentPath === "/" || currentPath.endsWith("/")) {
      if (activeUser) {
        window.location.href = "dashboard.html";
      }
    }
  });
  
  // --- REGISTRATION AND ACCOUNT AUTH SERVICE RULES ---
  function switchAuthTab(targetPanel) {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const tabLogin = document.getElementById("tab-login");
    const tabSignup = document.getElementById("tab-signup");
  
    if (targetPanel === 'login') {
      loginForm.classList.add("active");
      signupForm.classList.remove("active");
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
    } else {
      signupForm.classList.add("active");
      loginForm.classList.remove("active");
      tabSignup.classList.add("active");
      tabLogin.classList.add("active");
    }
  }
  
  function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const role = document.getElementById("signup-role").value;
    const password = document.getElementById("signup-password").value;
    const errorEl = document.getElementById("signup-error");
  
    errorEl.classList.add("hidden");
  
    let users = JSON.parse(localStorage.getItem("sync_users")) || [];
  
    if (users.some(u => u.email === email)) {
      errorEl.textContent = "❌ Account already exists under this email address.";
      errorEl.classList.remove("hidden");
      return;
    }
  
    const newUser = { name, email, role, password };
    users.push(newUser);
    localStorage.setItem("sync_users", JSON.stringify(users));
  
    localStorage.setItem("sync_active_user", JSON.stringify({ name, email, role }));
    window.location.href = "dashboard.html";
  }
  
  function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");
  
    errorEl.classList.add("hidden");
  
    const users = JSON.parse(localStorage.getItem("sync_users")) || [];
    const verifiedUser = users.find(u => u.email === email && u.password === password);
  
    if (!verifiedUser) {
      errorEl.textContent = "❌ Invalid account email or security password match.";
      errorEl.classList.remove("hidden");
      return;
    }
  
    localStorage.setItem("sync_active_user", JSON.stringify({ 
      name: verifiedUser.name, 
      email: verifiedUser.email, 
      role: verifiedUser.role 
    }));
    window.location.href = "dashboard.html";
  }
  
  function handleLogout() {
    localStorage.removeItem("sync_active_user");
    window.location.href = "index.html";
  }
  
  // ============================================================
  // RELATIONAL DATA DESIGN MODEL ARCHITECTURE LABS
  // ============================================================
  
  // [TEACHER WRITE RUNTIME]
  function handleCreateAssignment(event) {
    event.preventDefault();
  
    const title = document.getElementById("task-title").value.trim();
    const desc = document.getElementById("task-desc").value.trim();
    const date = document.getElementById("task-date").value;
    const priority = document.getElementById("task-priority").value;
    const activeUser = JSON.parse(localStorage.getItem("sync_active_user"));
  
    const newAssignment = {
      id: "assign-" + Date.now(),
      instructor: activeUser.name,
      instructorEmail: activeUser.email,
      title,
      desc,
      date,
      priority,
      responses: {} // Relational Map: { "student_email": "Pending" | "Progress" | "Completed" }
    };
  
    let assignments = JSON.parse(localStorage.getItem("sync_assignments")) || [];
    assignments.push(newAssignment);
    localStorage.setItem("sync_assignments", JSON.stringify(assignments));
  
    document.getElementById("assignment-creation-form").reset();
    renderWorkspaceFeed();
  }
  
  // [STUDENT STATUS CHANGE TRANSACTION UPDATE]
  function handleUpdateStudentStatus(assignmentId, newStatusValue) {
    const activeUser = JSON.parse(localStorage.getItem("sync_active_user"));
    let assignments = JSON.parse(localStorage.getItem("sync_assignments")) || [];
  
    const index = assignments.findIndex(a => a.id === assignmentId);
    if (index !== -1) {
      // Inject or change status code tracking node mapping
      assignments[index].responses[activeUser.email] = newStatusValue;
      localStorage.setItem("sync_assignments", JSON.stringify(assignments));
      renderWorkspaceFeed();
    }
  }
  
  // [TEACHER DELETE OPERATION ENTRY] - Task removal feature implementation
  function handleDeleteAssignment(assignmentId) {
    if (!confirm("⚠️ WARNING: Are you sure you want to retract and delete this assignment track permanently? All student progress logs recorded for it will be lost.")) return;
  
    let assignments = JSON.parse(localStorage.getItem("sync_assignments")) || [];
    assignments = assignments.filter(a => a.id !== assignmentId);
    localStorage.setItem("sync_assignments", JSON.stringify(assignments));
    renderWorkspaceFeed();
  }
  
  // [COMPLEX SEPARATION LOG DATA RENDER ENGINE]
  function renderWorkspaceFeed() {
    const activeUser = JSON.parse(localStorage.getItem("sync_active_user"));
    const assignments = JSON.parse(localStorage.getItem("sync_assignments")) || [];
    const container = document.getElementById("assignments-container");
    
    container.innerHTML = "";
    document.getElementById("total-assignments-count").textContent = `${assignments.length} Total Assignments Published`;
  
    // Student Metrics Counters
    let studentStats = { Pending: 0, Progress: 0, Completed: 0 };
  
    if (assignments.length === 0) {
      container.innerHTML = `<div class="widget-card" style="text-align:center; color:var(--text-muted); padding: 40px 20px;">📡 No assignments have been posted to this workspace feed yet.</div>`;
    }
  
    assignments.forEach(task => {
      const card = document.createElement("div");
      card.className = "assignment-card";
  
      // Read response value or default to Pending if the student has not interacted yet
      const currentStudentStatus = task.responses[activeUser.email] || "Pending";
  
      // 1. COMPILATION LOGIC FOR TEACHERS (Aggregating responses across all students)
      let analyticalControlsHTML = "";
      if (activeUser.role === "Teacher") {
        let breakdown = { Pending: 0, Progress: 0, Completed: 0 };
        
        // Count responses
        Object.values(task.responses).forEach(statusValue => {
          if (statusValue === "Pending") breakdown.Pending++;
          if (statusValue === "Progress") breakdown.Progress++;
          if (statusValue === "Completed") breakdown.Completed++;
        });
  
        const totalResponses = Object.keys(task.responses).length || 0;
        
        // Calculate display percentage bars
        const pctPending = totalResponses ? (breakdown.Pending / totalResponses) * 100 : 0;
        const pctProgress = totalResponses ? (breakdown.Progress / totalResponses) * 100 : 0;
        const pctComplete = totalResponses ? (breakdown.Completed / totalResponses) * 100 : 0;
  
        analyticalControlsHTML = `
          <div class="teacher-analytics-zone">
            <span class="analytics-title">📊 Class Progress Metrics (${totalResponses} Student Responses)</span>
            <div class="bar-row">
              <span class="label-span">Not Started</span>
              <div class="bar-track"><div class="bar-fill fill-pending" style="width: ${pctPending}%"></div></div>
              <span class="count-span">${breakdown.Pending}</span>
            </div>
            <div class="bar-row">
              <span class="label-span">In Progress</span>
              <div class="bar-track"><div class="bar-fill fill-progress" style="width: ${pctProgress}%"></div></div>
              <span class="count-span">${breakdown.Progress}</span>
            </div>
            <div class="bar-row">
              <span class="label-span">Completed</span>
              <div class="bar-track"><div class="bar-fill fill-complete" style="width: ${pctComplete}%"></div></div>
              <span class="count-span">${breakdown.Completed}</span>
            </div>
          </div>
        `;
      } 
      
      // 2. INTERACTION CONTROLS FOR STUDENTS
      else {
        // Tally individual metrics for the logged-in student
        if (currentStudentStatus === "Pending") studentStats.Pending++;
        if (currentStudentStatus === "Progress") studentStats.Progress++;
        if (currentStudentStatus === "Completed") studentStats.Completed++;
  
        analyticalControlsHTML = `
          <div class="student-status-control-box">
            <span class="analytics-title">⚙️ Update Your Submission State:</span>
            <div class="status-options-group">
              <label class="status-radio-label">
                <input type="radio" name="status-${task.id}" value="Pending" ${currentStudentStatus === 'Pending' ? 'checked' : ''} onchange="handleUpdateStudentStatus('${task.id}', 'Pending')">
                🔴 Not Started
              </label>
              <label class="status-radio-label">
                <input type="radio" name="status-${task.id}" value="Progress" ${currentStudentStatus === 'Progress' ? 'checked' : ''} onchange="handleUpdateStudentStatus('${task.id}', 'Progress')">
                🟡 Ongoing
              </label>
              <label class="status-radio-label">
                <input type="radio" name="status-${task.id}" value="Completed" ${currentStudentStatus === 'Completed' ? 'checked' : ''} onchange="handleUpdateStudentStatus('${task.id}', 'Completed')">
                🟢 Completed
              </label>
            </div>
          </div>
        `;
      }
  
      // Determine status text badge properties to display
      let studentStatusBadgeHTML = "";
      if (activeUser.role === "Student") {
        let badgeClass = currentStudentStatus === 'Completed' ? 'low' : (currentStudentStatus === 'Progress' ? 'medium' : 'high');
        let displayLabel = currentStudentStatus === 'Completed' ? 'Completed' : (currentStudentStatus === 'Progress' ? 'Ongoing' : 'Not Started');
        studentStatusBadgeHTML = `<span class="priority-tag ${badgeClass}">${displayLabel}</span>`;
      }
  
      // Dynamic Injection Template: Conditional display mapping of trash can symbol exclusively for teachers
      card.innerHTML = `
        <div class="card-top-row">
          <div class="card-badge-row">
            <span class="priority-tag ${task.priority.toLowerCase()}">Rank: ${task.priority}</span>
            ${studentStatusBadgeHTML}
          </div>
          ${activeUser.role === "Teacher" ? 
            `<button class="btn-delete-assignment" onclick="handleDeleteAssignment('${task.id}')" title="Retract Assignment Permanently">🗑️ Delete Task</button>` : ''
          }
        </div>
        <h4>${escapeHTML(task.title)}</h4>
        <p>${escapeHTML(task.desc)}</p>
        <div class="card-footer-metrics">
          <span>👨‍🏫 Issued By: <strong>${escapeHTML(task.instructor)}</strong></span>
          <span>📅 Deadline Date: <strong>${task.date}</strong></span>
        </div>
        ${analyticalControlsHTML}
      `;
  
      container.appendChild(card);
    });
  
    // Render individual live analytics if logged in as a student
    if (activeUser.role === "Student") {
      document.getElementById("student-stat-pending").textContent = studentStats.Pending;
      document.getElementById("student-stat-progress").textContent = studentStats.Progress;
      document.getElementById("student-stat-complete").textContent = studentStats.Completed;
    }
  }
  
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }