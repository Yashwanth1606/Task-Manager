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

// =========================
// DOM ELEMENTS
// =========================

const backBtn = document.getElementById('backBtn');
const addTaskBtn = document.getElementById('addTaskBtn');
const addTaskModal = document.getElementById('addTaskModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const taskNameInput = document.getElementById('taskNameInput');
const dateHeaders = document.getElementById('dateHeaders');
const taskRows = document.getElementById('taskRows');

// =========================
// DATA MANAGEMENT
// =========================

let dailyTasks = [];
let taskCompletions = {}; // { taskId: { 'YYYY-MM-DD': true/false } }

// Load from localStorage
function loadData() {
    const savedTasks = localStorage.getItem('dailyTasks');
    const savedCompletions = localStorage.getItem('taskCompletions');

    if (savedTasks) {
        dailyTasks = JSON.parse(savedTasks);
    } else {
        // Initialize with default tasks
        dailyTasks = [
            { id: generateId(), name: 'Read', icon: '📚' },
            { id: generateId(), name: 'Workout', icon: '💪' },
            { id: generateId(), name: 'Post Video', icon: '🎥' }
        ];
        saveData();
    }

    if (savedCompletions) {
        taskCompletions = JSON.parse(savedCompletions);
    }
}

function saveData() {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
    localStorage.setItem('taskCompletions', JSON.stringify(taskCompletions));
}

function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// =========================
// DATE UTILITIES
// =========================

function getLast7Days() {
    const dates = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }

    return dates;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateDisplay(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
        day: days[date.getDay()],
        number: date.getDate()
    };
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// =========================
// RENDER FUNCTIONS
// =========================

function renderDateHeaders() {
    const dates = getLast7Days();
    dateHeaders.innerHTML = '';

    dates.forEach(date => {
        const display = formatDateDisplay(date);
        const dateCol = document.createElement('div');
        dateCol.className = 'date-column';
        if (isToday(date)) {
            dateCol.classList.add('today');
        }

        dateCol.innerHTML = `
      <span class="date-day">${display.day}</span>
      <span class="date-number">${display.number}</span>
    `;

        dateHeaders.appendChild(dateCol);
    });
}

function renderTaskRows() {
    taskRows.innerHTML = '';

    if (dailyTasks.length === 0) {
        taskRows.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">No daily tasks yet</div>
        <div class="empty-state-subtext">Click "Add Task" to create your first daily task</div>
      </div>
    `;
        return;
    }

    const dates = getLast7Days();

    dailyTasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row';

        // Task name cell
        const nameCell = document.createElement('div');
        nameCell.className = 'task-name-cell';
        nameCell.innerHTML = `
      <div class="task-icon">${task.icon}</div>
      <span class="task-name">${task.name}</span>
      <button class="task-delete-btn" data-task-id="${task.id}">×</button>
    `;

        // Checkboxes cell
        const checkboxesCell = document.createElement('div');
        checkboxesCell.className = 'task-checkboxes';

        dates.forEach(date => {
            const dateStr = formatDate(date);
            const isChecked = taskCompletions[task.id]?.[dateStr] || false;

            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';
            wrapper.innerHTML = `
        <label class="custom-checkbox">
          <input type="checkbox" 
                 data-task-id="${task.id}" 
                 data-date="${dateStr}"
                 ${isChecked ? 'checked' : ''}>
          <span class="checkbox-display"></span>
        </label>
      `;

            checkboxesCell.appendChild(wrapper);
        });

        row.appendChild(nameCell);
        row.appendChild(checkboxesCell);
        taskRows.appendChild(row);
    });

    // Add event listeners
    attachEventListeners();
}

function attachEventListeners() {
    // Checkbox listeners
    document.querySelectorAll('.custom-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });

    // Delete button listeners
    document.querySelectorAll('.task-delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteTask);
    });
}

// =========================
// EVENT HANDLERS
// =========================

function handleCheckboxChange(e) {
    const taskId = e.target.dataset.taskId;
    const date = e.target.dataset.date;
    const isChecked = e.target.checked;

    if (!taskCompletions[taskId]) {
        taskCompletions[taskId] = {};
    }

    taskCompletions[taskId][date] = isChecked;
    saveData();

    // Add a nice animation
    const display = e.target.nextElementSibling;
    if (isChecked) {
        display.style.animation = 'none';
        setTimeout(() => {
            display.style.animation = 'checkPop 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 10);
    }
}

function handleDeleteTask(e) {
    const taskId = e.target.dataset.taskId;
    const task = dailyTasks.find(t => t.id === taskId);

    if (confirm(`Are you sure you want to delete "${task.name}"?`)) {
        dailyTasks = dailyTasks.filter(t => t.id !== taskId);
        delete taskCompletions[taskId];
        saveData();
        renderTaskRows();
    }
}

function handleAddTask() {
    const taskName = taskNameInput.value.trim();

    if (!taskName) {
        alert('Please enter a task name');
        return;
    }

    // Get a random icon
    const icons = ['📚', '💪', '🎥', '✍️', '🧘', '🎨', '🎵', '🍳', '🌱', '💻', '📝', '🏃', '🎯', '📖', '🎬'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newTask = {
        id: generateId(),
        name: taskName,
        icon: randomIcon
    };

    dailyTasks.push(newTask);
    saveData();
    renderTaskRows();

    // Close modal and reset
    addTaskModal.style.display = 'none';
    taskNameInput.value = '';
}

// =========================
// MODAL HANDLERS
// =========================

addTaskBtn.onclick = () => {
    addTaskModal.style.display = 'flex';
    setTimeout(() => taskNameInput.focus(), 100);
};

closeModal.onclick = () => {
    addTaskModal.style.display = 'none';
    taskNameInput.value = '';
};

cancelBtn.onclick = () => {
    addTaskModal.style.display = 'none';
    taskNameInput.value = '';
};

saveTaskBtn.onclick = handleAddTask;

// Close modal on backdrop click
addTaskModal.onclick = (e) => {
    if (e.target === addTaskModal) {
        addTaskModal.style.display = 'none';
        taskNameInput.value = '';
    }
};

// Enter key to submit
taskNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleAddTask();
    }
});

// =========================
// BACK BUTTON
// =========================

backBtn.onclick = () => {
    isInternalNavigation = true;
    window.location.href = 'index.html';
};

// =========================
// LOGOUT ON TAB / BROWSER CLOSE
// =========================

window.addEventListener('beforeunload', () => {
    if (isInternalNavigation) return;

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    navigator.sendBeacon(
        `${API_BASE}/logout`,
        JSON.stringify({ userId })
    );

    localStorage.clear();
});

// =========================
// INITIALIZE
// =========================

loadData();
renderDateHeaders();
renderTaskRows();

// Add check animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes checkPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);
