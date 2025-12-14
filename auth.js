/* =========================
   LOGIN
========================= */
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      // ✅ SAVE LOGIN STATE
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('firstName', data.firstName);

      // redirect to dashboard
      window.location.href = 'index.html';

    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
}

/* =========================
   REGISTER
========================= */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fullName = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'U';

    try {
      const res = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          dob: '01-01-2000', // TEMP — update later
          email,
          phone: '',
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Registration failed');
        return;
      }

      alert('Registration successful. Please login.');
      window.location.href = 'login.html';

    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  });
}
