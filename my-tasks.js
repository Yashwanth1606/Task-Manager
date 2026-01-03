const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://taskmanager-05hb.onrender.com";


const userId = localStorage.getItem('userId');
let isInternalNavigation = false;
const IDLE_LIMIT = 2 * 60 * 60 * 1000; // 2 hours


// =========================
// ACTIVITY TRACKING (AUTO LOGOUT)
// =========================

function updateLastActivity() {
  localStorage.setItem('lastActivityTime', Date.now().toString());
}

['click', 'mousemove', 'keydown', 'scroll'].forEach(event => {
  document.addEventListener(event, updateLastActivity, true);
});

async function autoLogout(message = 'Session expired') {
  const userId = localStorage.getItem('userId');

  try {
    if (userId) {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    }
  } catch (err) {
    console.warn('Auto logout API failed');
  }

  localStorage.clear();
  alert(message);
  window.location.href = 'login.html';
}

setInterval(() => {
  const userId = localStorage.getItem('userId');
  const lastActivity = Number(localStorage.getItem('lastActivityTime'));
  if (!userId || !lastActivity) return;

  if (Date.now() - lastActivity > IDLE_LIMIT) {
    autoLogout('You were logged out due to inactivity');
  }
}, 60 * 1000);


const taskListEl = document.getElementById('taskList');
const taskDetailsEl = document.getElementById('taskDetails');
const searchInput = document.getElementById('taskSearch');
const calendarBtn = document.getElementById('calendarBtn');
const calendarInput = document.getElementById('calendarInput');
const backBtn = document.getElementById('backBtn');

let allTasks = [];
let filteredTasks = [];

/* =========================
   LOAD TASKS
========================= */
async function loadTasks() {
  const res = await fetch(`${API_BASE}/tasks?userId=${userId}`);
  const data = await res.json();

  allTasks = (data.tasks || []).sort((a, b) => {
    const da = new Date(`${a.date}T${a.time || '00:00'}`);
    const db = new Date(`${b.date}T${b.time || '00:00'}`);
    return db - da; // newest first
  });

  filteredTasks = [...allTasks];
  renderTaskList();
}

function renderTaskList() {
  taskListEl.innerHTML = '';

  filteredTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task-item';
    div.textContent = task.title;
    div.onclick = () => selectTask(task, div);
    taskListEl.appendChild(div);
  });
}

/* =========================
   TASK DETAILS
========================= */
function selectTask(task, el) {
  document
    .querySelectorAll('.task-item')
    .forEach(t => t.classList.remove('active'));

  el.classList.add('active');

  taskDetailsEl.innerHTML = `
    <h3>${task.title}</h3>
    <p><strong>Priority:</strong> ${task.priority}</p>
    <p><strong>Status:</strong> ${task.status}</p>
    <p><strong>Created on:</strong> ${task.date}</p>
    <br/>
    <p>${task.description || ''}</p>
  `;
}

/* =========================
   SEARCH
========================= */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  filteredTasks = allTasks.filter(t =>
    t.title.toLowerCase().includes(q)
  );
  renderTaskList();
});

/* =========================
   CALENDAR FILTER
========================= */
calendarBtn.onclick = () => calendarInput.click();

calendarInput.onchange = () => {
  const selected = calendarInput.value;
  filteredTasks = allTasks.filter(t => t.date === selected);
  renderTaskList();
};

/* =========================
   BACK
========================= */
backBtn.onclick = () => {
  isInternalNavigation = true;
  window.location.href = 'index.html';
};

loadTasks();

// =========================
// LOGOUT ON TAB / BROWSER CLOSE
// =========================

window.addEventListener('beforeunload', () => {
  // ✅ DO NOT logout on internal navigation
  if (isInternalNavigation) return;

  const userId = localStorage.getItem('userId');
  if (!userId) return;

  navigator.sendBeacon(
    `${API_BASE}/logout`,
    JSON.stringify({ userId })
  );

  localStorage.clear();
});
