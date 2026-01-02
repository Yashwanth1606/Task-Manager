const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://taskmanager-05hb.onrender.com";



const userId = localStorage.getItem('userId');
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
  if (!userId) return;

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
      <span>Created: ${
        task.createdAt
          ? new Date(task.createdAt).toLocaleDateString()
          : 'N/A'
      }</span>
      <span>Due: ${task.dueDate || 'N/A'}</span>
    </div>

    <div class="focus-task-desc">
      ${task.description || 'No description provided.'}
    </div>
  `;
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
  display.textContent = `${m}:${String(s).padStart(2,'0')}`;
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

loadTasks();
updateDisplay();
updateRing();

