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

// Forgot password form submission
const forgotForm = document.getElementById('forgotPasswordForm');
const submitBtn = document.getElementById('submitBtn');

forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    if (!email) {
        toast.warning('Missing field', 'Please enter your email address');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        toast.warning('Invalid email', 'Please enter a valid email address');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        const response = await fetch('https://safespace-back.onrender.com/api/v1/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email.trim().toLowerCase()
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Show success message
            toast.success('Reset link sent!', 'Check your email for password reset instructions', {
                duration: 5000
            });
            
            // Clear the form
            document.getElementById('email').value = '';
            
            // Optional: redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        } else {
            // Even if email not found, the API returns success for security
            // So we show success message anyway
            toast.success('If your email is registered', 'You will receive a password reset link if your email is registered', {
                duration: 5000
            });
            
            // Clear the form
            document.getElementById('email').value = '';
            
            // Optional: redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        toast.error('Connection error', 'Unable to connect to server. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});