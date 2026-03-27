// Configure physics toast
if (typeof toast !== 'undefined') {
    toast.defaults = {
        ...toast.defaults,
        position: 'top-right',
        duration: 4000,
        showProgress: true,
        pauseOnHover: true,
        spring: true
    };
}

// Mobile menu toggle
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
}

// Login form submission
const loginForm = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        toast.warning('Missing fields', 'Please enter both email and password');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        const response = await fetch('https://safespace-back.onrender.com/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                password: password,
                rememberMe: rememberMe
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            
            toast.success('Login successful!', 'Redirecting to dashboard...', {
                duration: 2500
            });
            
            setTimeout(() => {
                if (data.role === "admin"){
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/user/dashboard.html';
                }
            }, 2000);
        } else {
            let errorMsg = data.message || 'Login failed';
            toast.error('Login failed', errorMsg);
        }
    } catch (error) {
        console.error('Login error:', error);
        toast.error('Connection error', 'Unable to connect to server. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});