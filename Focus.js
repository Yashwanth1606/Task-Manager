const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://taskmanager-05hb.onrender.com";


const userId = localStorage.getItem('userId');
let isInternalNavigation = false;
const IDLE_LIMIT = 2 * 60 * 60 * 1000; // 2 hours


// ACTIVITY TRACKING (AUTO LOGOUT)

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
const expandedTaskEl = document.getElementById('expandedTask');
const searchInput = document.getElementById('taskSearch');
let remaining = 25 * 60;
const ring = document.querySelector('.focus-ring-progress');
const RING_CIRCUMFERENCE = 603; // must match CSS
let totalSeconds = remaining;



let allTasks = [];
let selectedTask = null;
let isExpanded = false;
/* =========================
   LOAD TASKS (NOT COMPLETED)
========================= */
async function loadTasks() {
  if (!userId) {
    console.warn('Focus page: userId missing');
    return;
  }

  const res = await fetch(`${API_BASE}/tasks?userId=${userId}`);
  const data = await res.json();

  allTasks = (data.tasks || []).filter(
    t => t.status !== 'Completed'
  );

  renderTasks(allTasks);
}

function renderTasks(tasks) {
  taskListEl.innerHTML = '';

  // Always reset expanded UI when rendering list
  isExpanded = false;
  expandedTaskEl.hidden = true;
  taskListEl.classList.remove('hidden');

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'focus-task';
    div.textContent = task.title;

    div.addEventListener('click', () => {
      if (!isExpanded) {
        expandTask(task);
      }
    });

    taskListEl.appendChild(div);
  });
}

function expandTask(task) {
  isExpanded = true;
  selectedTask = task;

  // Hide task list
  taskListEl.classList.add('hidden');

  // Show expanded task
  expandedTaskEl.hidden = false;

  expandedTaskEl.innerHTML = `
    <h4>${task.title}</h4>

    <div class="focus-task-meta">
      <span>Status: <strong>${task.status || 'Not Started'}</strong></span>
      <span>Created: ${task.date
      ? new Date(task.date).toLocaleDateString()
      : 'N/A'}
      </span>
      <span>Due: ${task.dueDate || 'N/A'}</span>
    </div>

    <div class="focus-task-desc">
      ${task.description || 'No description provided.'}
    </div>

    <div class="focus-task-action">
      ${renderStatusButton(task)}
    </div>
  `;
}
function renderStatusButton(task) {
  const status = task.status || 'Not Started';

  if (status === 'Completed') {
    return `<button class="focus-status-btn done" disabled>
              ✅ Completed
            </button>`;
  }

  if (status === 'In Progress') {
    return `<button class="focus-status-btn complete"
              onclick="updateTaskStatus('${task.id}', 'Completed')">
              ✔ Mark as Completed
            </button>`;
  }

  // Default → Not Started
  return `<button class="focus-status-btn start"
            onclick="updateTaskStatus('${task.id}', 'In Progress')">
            ▶ Start Task
          </button>`;
}



expandedTaskEl.addEventListener('dblclick', () => {
  resetFocusView();
});



/* =========================
   SEARCH
========================= */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();

  if (!q) {
    renderTasks(allTasks);
    return;
  }

  const filtered = allTasks.filter(t =>
    t.title.toLowerCase().includes(q)
  );

  renderTasks(filtered);
});

/* =========================
   TIMER
========================= */
let timer = null;


const display = document.getElementById('timerDisplay');
const durationSelect = document.getElementById('focusDuration');

durationSelect.addEventListener('change', () => {
  totalSeconds = Number(durationSelect.value) * 60;
  remaining = totalSeconds;
  updateDisplay();
  updateRing();
});


function updateDisplay() {
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  // Split into digits
  const mStr = String(m).padStart(2, '0');
  const sStr = String(s).padStart(2, '0');

  updateFlipUnit('minTen', mStr[0]);
  updateFlipUnit('minOne', mStr[1]);
  updateFlipUnit('secTen', sStr[0]);
  updateFlipUnit('secOne', sStr[1]);
}

function updateFlipUnit(id, val) {
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.querySelector('.flip-top');
  const bottom = el.querySelector('.flip-bottom');

  // Simple update (no animation for now)
  if (top) top.textContent = val;
  if (bottom) bottom.textContent = val;
}

function updateRing() {
  if (!ring) return;

  const progress = 1 - remaining / totalSeconds;
  const offset = RING_CIRCUMFERENCE * (1 - progress);

  ring.style.strokeDashoffset = offset;
}
function resetFocusView() {
  // Stop timer
  clearInterval(timer);
  timer = null;

  // Reset timer
  totalSeconds = Number(durationSelect.value) * 60;
  remaining = totalSeconds;

  updateDisplay();
  updateRing();

  // Reset expanded state
  isExpanded = false;
  selectedTask = null;

  // Restore full task list
  renderTasks(allTasks);
}


document.getElementById('startTimer').onclick = () => {
  if (!selectedTask) {
    alert('Select a task first');
    return;
  }
  if (timer) return;

  timer = setInterval(() => {
    remaining = Math.max(remaining - 1, 0);
    updateDisplay();
    updateRing();

    if (remaining <= 0) {
      clearInterval(timer);
      timer = null;
      alert('Focus session completed 🎉');
    }
  }, 1000);

};

document.getElementById('pauseTimer').onclick = () => {
  clearInterval(timer);
  timer = null;
};

// =========================
// BACK TO DASHBOARD (FOCUS PAGE)
// =========================

const backBtn = document.getElementById('backBtn');

if (backBtn) {
  backBtn.addEventListener('click', () => {
    // ✅ Mark internal navigation
    isInternalNavigation = true;

    // Navigate safely
    window.location.href = 'index.html';
  });
}


loadTasks();
updateDisplay();
updateRing();



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
async function updateTaskStatus(taskId, newStatus) {
  try {
    await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    // Update local task
    const task = allTasks.find(t => String(t.id) === String(taskId));
    if (task) task.status = newStatus;

    // If completed → reset view
    if (newStatus === 'Completed') {
      resetFocusView();
      loadTasks();
      return;
    }

    // Otherwise re-render expanded view
    expandTask(task);
    loadTasks();

  } catch (err) {
    console.error('Failed to update task status', err);
    alert('Failed to update task status');
  }
}
