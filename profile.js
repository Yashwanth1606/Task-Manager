// =========================
// PROFILE PAGE SCRIPT
// =========================

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://taskmanager-05hb.onrender.com";

/* =========================
   AUTH GUARD
========================= */
const userId = localStorage.getItem('userId');
if (!userId) {
  window.location.href = 'login.html';
}

/* =========================
   BACK BUTTON
========================= */
const backBtn = document.getElementById('backToDashboard');

if (backBtn) {
  backBtn.addEventListener('click', () => {
    // mark internal navigation
    localStorage.setItem('internalNav', 'true');
    window.location.href = 'index.html';
  });
}

/* =========================
   LOAD PROFILE DATA
========================= */
document.getElementById('profileFirstName').value =
  localStorage.getItem('firstName') || '';

document.getElementById('profileLastName').value =
  localStorage.getItem('lastName') || '';

document.getElementById('profileEmail').value =
  localStorage.getItem('email') || '';

document.getElementById('profilePhone').value =
  localStorage.getItem('phone') || '';

/* =========================
   SAVE PROFILE
========================= */
const saveBtn = document.getElementById('saveProfileBtn');

if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    const firstName = document.getElementById('profileFirstName').value.trim();
    const lastName = document.getElementById('profileLastName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();

    if (!firstName || !email) {
      alert('First name and email are required');
      return;
    }

    const res = await fetch(`${API_BASE}/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        firstName,
        lastName,
        email,
        phone
      })
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.error || 'Failed to update profile');
      return;
    }

    // Update localStorage
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('email', email);
    localStorage.setItem('phone', phone);

    localStorage.setItem(
      'fullName',
      `${firstName} ${lastName}`.trim()
    );

    alert('Profile updated successfully');
  });
}

/* =========================
   PREVENT LOGOUT ON BACK
========================= */
window.addEventListener('beforeunload', () => {
  const internalNav = localStorage.getItem('internalNav');
  if (internalNav === 'true') {
    localStorage.removeItem('internalNav');
    return;
  }
});
