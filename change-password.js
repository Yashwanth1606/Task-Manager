// Password validation requirements
const requirements = {
    length: (pwd) => pwd.length >= 8,
    uppercase: (pwd) => /[A-Z]/.test(pwd),
    lowercase: (pwd) => /[a-z]/.test(pwd),
    number: (pwd) => /[0-9]/.test(pwd),
    special: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
};

// Get DOM elements
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordForm = document.getElementById('passwordForm');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const confirmError = document.getElementById('confirmError');
const successMessage = document.getElementById('successMessage');

// Toggle password visibility
const toggleButtons = document.querySelectorAll('.toggle-password');
toggleButtons.forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);

        if (input.type === 'password') {
            input.type = 'text';
            this.innerHTML = `
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        } else {
            input.type = 'password';
            this.innerHTML = `
                <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        }
    });
});


function checkPasswordStrength(password) {
    let score = 0;

    if (requirements.length(password)) score++;
    if (requirements.uppercase(password)) score++;
    if (requirements.lowercase(password)) score++;
    if (requirements.number(password)) score++;
    if (requirements.special(password)) score++;

    return score;
}

function updateRequirements(password) {
    const reqElements = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special')
    };

    Object.keys(requirements).forEach(key => {
        const isValid = requirements[key](password);
        if (isValid) {
            reqElements[key].classList.add('valid');
        } else {
            reqElements[key].classList.remove('valid');
        }
    });
}

// Update strength indicator
function updateStrengthIndicator(password) {
    const score = checkPasswordStrength(password);

    strengthFill.className = 'strength-fill';

    if (password.length === 0) {
        strengthText.textContent = 'Password strength';
        strengthFill.style.width = '0%';
    } else if (score <= 2) {
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak password';
        strengthText.style.color = '#f56565';
    } else if (score <= 4) {
        strengthFill.classList.add('medium');
        strengthText.textContent = 'Medium password';
        strengthText.style.color = '#ed8936';
    } else {
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong password';
        strengthText.style.color = '#48bb78';
    }
}

// Validate password meets all requirements
function isPasswordValid(password) {
    return Object.values(requirements).every(fn => fn(password));
}


function checkPasswordsMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword.length === 0) {
        confirmError.textContent = '';
        confirmPasswordInput.classList.remove('error');
        return true;
    }

    if (newPassword !== confirmPassword) {
        confirmError.textContent = 'Passwords do not match';
        confirmPasswordInput.classList.add('error');
        return false;
    } else {
        confirmError.textContent = '';
        confirmPasswordInput.classList.remove('error');
        return true;
    }
}

// Event listeners for new password input
newPasswordInput.addEventListener('input', function () {
    const password = this.value;
    updateStrengthIndicator(password);
    updateRequirements(password);
    checkPasswordsMatch();
});

// Event listener for confirm password input
confirmPasswordInput.addEventListener('input', checkPasswordsMatch);

// Form submission
passwordForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate current password is not empty
    if (!currentPassword) {
        alert('Please enter your current password');
        return;
    }

    // Validate new password meets requirements
    if (!isPasswordValid(newPassword)) {
        alert('New password does not meet all requirements');
        return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate new password is different from current
    if (currentPassword === newPassword) {
        alert('New password must be different from current password');
        return;
    }

    // Simulate password change (replace with actual API call)
    setTimeout(() => {
        // Hide form
        passwordForm.style.display = 'none';

        // Show success message
        successMessage.classList.add('show');

        // Reset form after 3 seconds
        setTimeout(() => {
            passwordForm.reset();
            passwordForm.style.display = 'block';
            successMessage.classList.remove('show');
            updateStrengthIndicator('');
            updateRequirements('');
        }, 3000);
    }, 500);
});