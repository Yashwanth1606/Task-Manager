// script.js - renders tasks and status donuts and includes examples for Google Sheets fetching

// start with an empty list — the UI will show only the To-Do header and Add task button
const sampleTasks = [];

const taskListEl = document.getElementById('taskList');
const completedListEl = document.getElementById('completedList');
const pctCompletedEl = document.getElementById('pctCompleted');
const pctInProgressEl = document.getElementById('pctInProgress');
const pctNotStartedEl = document.getElementById('pctNotStarted');

function renderTasks(tasks){
  taskListEl.innerHTML = '';
  completedListEl.innerHTML = '';
  const totals = {completed:0, inProgress:0, notStarted:0};

  tasks.forEach(task=>{
    // main task card
    const t = document.createElement('div');
    t.className = 'task';
    const marker = document.createElement('div');
    marker.className = 'left-marker';
    if (task.status === 'Completed') marker.style.background = '#0dbb7b';
    else if (task.status === 'In Progress') marker.style.background = '#1e90ff';
    else marker.style.background = '#ff6b6b';

    const content = document.createElement('div');
    content.className = 'content';
    const title = document.createElement('h4');
    title.textContent = task.title;
    const desc = document.createElement('p');
    desc.textContent = task.description;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<span>Priority: ${task.priority}</span><span>Status: ${task.status}</span><span>Created: ${task.created}</span>`;

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(meta);

    t.appendChild(marker);
    t.appendChild(content);

    if(task.status === 'Completed'){
      // add to completed area
      totals.completed++;
      const citem = document.createElement('div');
      citem.className = 'completed-item';
      citem.innerHTML = `<div class="info"><h5>${task.title}</h5><p>${task.description}</p></div><div class="when">Completed</div>`;
      completedListEl.appendChild(citem);
    } else {
      taskListEl.appendChild(t);
      if(task.status === 'In Progress') totals.inProgress++;
      else totals.notStarted++;
    }
  });

  // totals for percentage calculations
  const totalCount = tasks.length || 1;
  const pctCompleted = Math.round((totals.completed/totalCount)*100);
  const pctInProgress = Math.round((totals.inProgress/totalCount)*100);
  const pctNotStarted = Math.round((totals.notStarted/totalCount)*100);

  pctCompletedEl.textContent = `${pctCompleted}%`;
  pctInProgressEl.textContent = `${pctInProgress}%`;
  pctNotStartedEl.textContent = `${pctNotStarted}%`;

  // update donut visuals
  document.querySelectorAll('.donut').forEach((d,i)=>{
    let pct = 0;
    if(i===0) pct = pctCompleted;
    if(i===1) pct = pctInProgress;
    if(i===2) pct = pctNotStarted;
    d.style.setProperty('--pct', pct);
    const color = d.dataset.color || '#0dbb7b';
    d.style.setProperty('--c', color);
    d.style.background = `conic-gradient(${color} ${pct}%, #e6eef6 ${pct}%)`;
  });

}

// initial render: no tasks by default so the To-Do card is empty and only shows header/button
renderTasks(sampleTasks);

// Update the header date dynamically so it always shows today's day and date
function updateHeaderDate() {
  const headerDateEl = document.querySelector('.top-right .date');
  if (!headerDateEl) return;
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  headerDateEl.innerHTML = `${dayName} <span>${dd}/${mm}/${yyyy}</span>`;
}

// call it once on load
updateHeaderDate();

// set avatar initials and welcome first name based on the profile name in the sidebar
function syncProfileDisplay(){
  const nameEl = document.querySelector('.profile .name');
  const avatarEl = document.querySelector('.profile .avatar');
  const welcomeNameEl = document.querySelector('.welcome-name');
  if(!nameEl) return;

  const full = String(nameEl.textContent || '').trim();
  if(!full) return;
  const parts = full.split(/\s+/);
  const firstName = parts[0] || full;

  // initials: first char of first and last (if present)
  let initials = '';
  if(parts.length === 1){
    initials = (parts[0][0] || '').toUpperCase();
  } else {
    initials = ((parts[0][0] || '') + (parts[parts.length-1][0] || '')).toUpperCase();
  }

  if(avatarEl) avatarEl.textContent = initials;
  // make avatar focusable + create tooltip with email (hide the visible email in the sidebar)
  const emailEl = document.querySelector('.profile .email');
  if(emailEl && avatarEl){
    const emailText = String(emailEl.textContent || '').trim();
    // hide the visible email in the sidebar
    emailEl.style.display = 'none';

      // make avatar keyboard-focusable to reveal tooltip
      avatarEl.setAttribute('tabindex','0');

      // attach tooltip to the .profile container but position it above the avatar
      const profileEl = document.querySelector('.profile');
      const avatarElLocal = avatarEl; // use existing avatar element
      let tooltip = profileEl ? profileEl.querySelector('.avatar-tooltip') : null;
      if(!tooltip && profileEl){
        tooltip = document.createElement('div');
        tooltip.className = 'avatar-tooltip';
        profileEl.appendChild(tooltip);
      }
    tooltip.textContent = emailText;
    // also put email on data-email attribute if needed
    avatarEl.dataset.email = emailText;
      // connect accessible relation
      if(tooltip) {
        tooltip.id = tooltip.id || 'avatar-tooltip';
        avatarEl.setAttribute('aria-describedby', tooltip.id);
      }

      // position tooltip above the avatar so it doesn't overlap other elements
          // expose a shared helper to accurately position the avatar tooltip above the avatar
          function positionTooltipAbove(){
            if(!tooltip || !avatarElLocal || !profileEl) return;
            // measure positions relative to profileEl
            const avatarRect = avatarElLocal.getBoundingClientRect();
            const profileRect = profileEl.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            // compute left so tooltip is centered above avatar
            const left = (avatarRect.left - profileRect.left) + (avatarRect.width / 2) - (tooltipRect.width / 2);
            const top = (avatarRect.top - profileRect.top) - tooltipRect.height - 8; // 8px gap

            tooltip.style.left = Math.max(6, left) + 'px';
            tooltip.style.top = Math.max(-9999, top) + 'px';
          }

      // update position after DOM paint when tooltip is added
      requestAnimationFrame(()=>{
        positionTooltipAbove();
      });

      // reposition on resize or scroll
      window.addEventListener('resize', positionTooltipAbove);
      window.addEventListener('scroll', positionTooltipAbove, true);
  }
  if(welcomeNameEl) welcomeNameEl.textContent = firstName;
}

// run it on load
syncProfileDisplay();

// tap/click support for touch devices — toggle tooltip on the .profile element
// Config: how long (ms) to auto-dismiss tooltip on touch devices after opening
const TOOLTIP_AUTO_DISMISS_MS = 3000;

function attachTooltipTapSupport(){
  const profileEl = document.querySelector('.profile');
  if(!profileEl) return;
  const avatarEl = profileEl.querySelector('.avatar');
  if(!avatarEl) return;

  let autoDismissTimer = null;

  const closeTooltip = () => {
    profileEl.classList.remove('tooltip-visible');
    avatarEl.setAttribute('aria-expanded','false');
    if(autoDismissTimer){
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
  };

  const toggleTooltip = (e) => {
    // keep clicks on the avatar from bubbling to the document close handler
    e.stopPropagation();
    const isVisible = profileEl.classList.toggle('tooltip-visible');
    avatarEl.setAttribute('aria-expanded', String(isVisible));

    // If this is a touch/coarse pointer device and tooltip opened, auto-dismiss after a timeout
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if(isVisible && isTouch){
      if(autoDismissTimer) clearTimeout(autoDismissTimer);
      autoDismissTimer = setTimeout(()=>{
        closeTooltip();
      }, TOOLTIP_AUTO_DISMISS_MS);
    }
    // if closed manually clear timer
    if(!isVisible && autoDismissTimer){
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
  };

  // toggle on click/tap for touch / small-pointer devices. Also works for mouse if user clicks.
  avatarEl.addEventListener('click', (e)=>{
    // only toggle where appropriate (touch/small pointer) but allow click too
    toggleTooltip(e);
    // reposition if tooltip is shown (wrapped content may change tooltip width/height)
    setTimeout(()=>{
      // small delay to allow layout changes
      const evt = new Event('resize');
      window.dispatchEvent(evt);
    }, 0);
  });

  // accessibility: toggle with Enter / Space when avatar focused
  avatarEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggleTooltip(e);
    }
  });

  // close when clicking anywhere outside the profile
  document.addEventListener('click', (e)=>{
    if(profileEl.classList.contains('tooltip-visible') && !profileEl.contains(e.target)){
      closeTooltip();
    }
  });

  // close on Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeTooltip();
  });
}

attachTooltipTapSupport();

/* -------------------------
  Google Sheets connection examples

  1) If your sheet is PUBLIC (easiest):
     - In Google Sheets: File → Publish to web → choose CSV for the sheet.
     - You get a URL like:
       https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
     - Then fetch from frontend:
       const csvUrl = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0';
       fetch(csvUrl)
         .then(r => r.text())
         .then(txt => {
           // simple CSV parse (doesn't handle quotes/commas inside fields)
           const rows = txt.trim().split('\\n').map(r => r.split(','));
           const headers = rows.shift().map(h => h.trim());
           const data = rows.map(row => {
             const obj = {};
             row.forEach((c,i)=> obj[headers[i]] = c || '');
             return obj;
           });
           // map your sheet columns to task shape
           const tasks = data.map((r, idx)=>({
             id: idx+1,
             title: r.Title || r.title,
             description: r.Description || r.description,
             priority: r.Priority || 'Low',
             status: r.Status || 'Not Started',
             created: r.Created || '',
             image: ''
           }));
           renderTasks(tasks);
         });

  2) If your sheet is PRIVATE: use the Google Sheets API server-side
     - Use service account or OAuth credentials on your server.
     - Server fetches sheet via Google Sheets API and returns JSON to the frontend.
     - This keeps API keys/credentials secret and avoids CORS/public exposure.

  Note on CORS & security:
   - Public CSV approach is easiest for quick prototypes but makes data public.
   - Private sheets require a backend proxy (recommended for production).

------------------------- */
