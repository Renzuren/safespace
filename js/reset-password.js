// Configure physics toast
if (typeof toast !== 'undefined') {
    toast.defaults = {
        position: 'top-right',
        duration: 4000,
        showProgress: true,
        pauseOnHover: true,
        spring: true
    };
}

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    toast.error('Invalid link', 'No reset token found. Please request a new password reset link.');
    setTimeout(() => {
        window.location.href = '/forgot-password.html';
    }, 3000);
}

// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    document.addEventListener('click', function(event) {
        if (!menuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
}

// Password visibility toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });
}

if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye');
        toggleConfirmPassword.querySelector('i').classList.toggle('fa-eye-slash');
    });
}

// Password strength and validation
function checkPasswordStrength(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const metCount = Object.values(requirements).filter(Boolean).length;
    
    // Update requirement indicators
    document.getElementById('req-length').className = requirements.length ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-uppercase').className = requirements.uppercase ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-lowercase').className = requirements.lowercase ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-number').className = requirements.number ? 'requirement-met' : 'requirement-unmet';
    document.getElementById('req-special').className = requirements.special ? 'requirement-met' : 'requirement-unmet';
    
    // Update strength bar
    const strengthBars = document.querySelectorAll('.strength-bar');
    strengthBars.forEach(bar => bar.className = 'strength-bar h-1 rounded-full bg-gray-200 flex-1');
    
    let strengthLevel = 0;
    let strengthText = '';
    
    if (metCount <= 2) {
        strengthLevel = 1;
        strengthText = 'Weak';
        if (strengthBars[0]) strengthBars[0].classList.add('bg-orange-500');
    } else if (metCount <= 4) {
        strengthLevel = 2;
        strengthText = 'Medium';
        if (strengthBars[0]) strengthBars[0].classList.add('bg-yellow-500');
        if (strengthBars[1]) strengthBars[1].classList.add('bg-yellow-500');
    } else {
        strengthLevel = 3;
        strengthText = 'Strong';
        if (strengthBars[0]) strengthBars[0].classList.add('bg-green-500');
        if (strengthBars[1]) strengthBars[1].classList.add('bg-green-500');
        if (strengthBars[2]) strengthBars[2].classList.add('bg-green-500');
    }
    
    document.getElementById('strengthText').innerHTML = `Password strength: <span class="font-medium">${strengthText}</span>`;
    
    return requirements;
}

// Check if passwords match
function checkPasswordsMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const matchMessage = document.getElementById('matchMessage');
    
    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            matchMessage.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Passwords match';
            matchMessage.className = 'text-xs mt-1 text-green-600';
            matchMessage.classList.remove('hidden');
            return true;
        } else {
            matchMessage.innerHTML = '<i class="fas fa-exclamation-circle mr-1"></i> Passwords do not match';
            matchMessage.className = 'text-xs mt-1 text-red-600';
            matchMessage.classList.remove('hidden');
            return false;
        }
    } else {
        matchMessage.classList.add('hidden');
        return false;
    }
}

// Real-time validation
passwordInput.addEventListener('input', () => {
    const requirements = checkPasswordStrength(passwordInput.value);
    checkPasswordsMatch();
});

confirmPasswordInput.addEventListener('input', checkPasswordsMatch);

// Reset password form submission
const resetForm = document.getElementById('resetPasswordForm');
const submitBtn = document.getElementById('submitBtn');

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Validate password requirements
    const requirements = checkPasswordStrength(password);
    const isPasswordValid = Object.values(requirements).every(Boolean);
    
    if (!isPasswordValid) {
        toast.warning('Weak password', 'Please meet all password requirements');
        return;
    }
    
    if (password !== confirmPassword) {
        toast.warning('Password mismatch', 'Passwords do not match');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting password...';
    
    try {
        const response = await fetch('https://safespace-back.onrender.com/api/v1/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                token: token,
                password: password,
                confirmPassword: confirmPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            toast.success('Password reset successful!', 'You can now log in with your new password', {
                duration: 4000
            });
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        } else {
            toast.error('Reset failed', data.message || 'Failed to reset password. Please request a new link.');
            setTimeout(() => {
                window.location.href = '/forgot-password.html';
            }, 3000);
        }
    } catch (error) {
        console.error('Reset password error:', error);
        toast.error('Connection error', 'Unable to connect to server. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});