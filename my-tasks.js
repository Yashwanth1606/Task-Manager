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
const calendarDropdown = document.getElementById('calendarDropdown');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const currentMonthEl = document.getElementById('currentMonth');
const calendarDaysEl = document.getElementById('calendarDays');
const clearDateBtn = document.getElementById('clearDate');
const todayBtn = document.getElementById('todayBtn');
const backBtn = document.getElementById('backBtn');

let allTasks = [];
let filteredTasks = [];
let currentDate = new Date();
let selectedDate = null;

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
   CUSTOM CALENDAR
========================= */

// Toggle calendar dropdown
calendarBtn.onclick = (e) => {
  e.stopPropagation();
  const isVisible = calendarDropdown.style.display === 'block';
  calendarDropdown.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) {
    renderCalendar();
  }
};

// Close calendar when clicking outside
document.addEventListener('click', (e) => {
  if (!calendarDropdown.contains(e.target) && e.target !== calendarBtn) {
    calendarDropdown.style.display = 'none';
  }
});

// Prevent calendar from closing when clicking inside
calendarDropdown.onclick = (e) => {
  e.stopPropagation();
};

// Month navigation
prevMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

nextMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

// Render calendar
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  currentMonthEl.textContent = `${monthNames[month]} ${year}`;

  // Clear days
  calendarDaysEl.innerHTML = '';

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayEl = createDayElement(day, true);
    calendarDaysEl.appendChild(dayEl);
  }

  // Add current month's days
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = createDayElement(day, false);

    // Check if today
    if (year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()) {
      dayEl.classList.add('today');
    }

    // Check if selected
    if (selectedDate &&
      year === selectedDate.getFullYear() &&
      month === selectedDate.getMonth() &&
      day === selectedDate.getDate()) {
      dayEl.classList.add('selected');
    }

    calendarDaysEl.appendChild(dayEl);
  }

  // Add next month's days to fill grid
  const totalCells = calendarDaysEl.children.length;
  const remainingCells = 42 - totalCells; // 6 rows * 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const dayEl = createDayElement(day, true);
    calendarDaysEl.appendChild(dayEl);
  }
}

function createDayElement(day, isOtherMonth) {
  const dayEl = document.createElement('div');
  dayEl.className = 'calendar-day';
  dayEl.textContent = day;

  if (isOtherMonth) {
    dayEl.classList.add('other-month');
  } else {
    dayEl.onclick = () => selectDate(day);
  }

  return dayEl;
}

function selectDate(day) {
  selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  filterTasksByDate(selectedDate);
  renderCalendar();
  calendarDropdown.style.display = 'none';
}

function filterTasksByDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  filteredTasks = allTasks.filter(t => {
    if (!t.date) return false;
    const taskDate = new Date(t.date);
    if (isNaN(taskDate.getTime())) return false;

    const taskYyyy = taskDate.getFullYear();
    const taskMm = String(taskDate.getMonth() + 1).padStart(2, '0');
    const taskDd = String(taskDate.getDate()).padStart(2, '0');
    const taskDateStr = `${taskYyyy}-${taskMm}-${taskDd}`;

    return taskDateStr === dateStr;
  });

  renderTaskList();
}

// Clear date filter
clearDateBtn.onclick = () => {
  selectedDate = null;
  filteredTasks = [...allTasks];
  renderTaskList();
  renderCalendar();
  calendarDropdown.style.display = 'none';
};

// Go to today
todayBtn.onclick = () => {
  const today = new Date();
  currentDate = new Date(today);
  selectedDate = new Date(today);
  filterTasksByDate(selectedDate);
  renderCalendar();
  calendarDropdown.style.display = 'none';
};

/* =========================
   BACK
========================= */
backBtn.onclick = () => {
  isInternalNavigation = true;
  window.location.href = 'index.html';
};

loadTasks();

// LOGOUT ON TAB / BROWSER CLOSE

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
