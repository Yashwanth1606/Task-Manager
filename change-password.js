// =========================
// BACK BUTTON (CHANGE PASSWORD)
// =========================
const backBtn = document.getElementById('backToDashboard');

if (backBtn) {
  backBtn.addEventListener('click', () => {
    // ✅ mark internal navigation
    localStorage.setItem('internalNav', 'true');

    window.location.href = 'index.html';
  });
}
