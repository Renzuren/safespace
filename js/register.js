(function() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
        document.addEventListener('click', function(event) {
            if (!menuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
})();

// Configure physics toast defaults: dynamic island style with top-right position (modern)
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

const registerForm = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;
    
    if (!terms) {
        toast.warning('Terms required', 'Please agree to the Terms of Use and Privacy Policy');
        return;
    }
    
    submitBtn.disabled = true;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    
    try {
        const requestBody = {
            fullName: fullname.trim(),
            email: email.trim().toLowerCase(),
            role: role,
            password: password,
            confirmPassword: confirmPassword
        };
        
        const response = await fetch('https://safespace-back.onrender.com/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            toast.success('Account created!', 'Registration successful. Redirecting to login page...', {
                duration: 3500
            });
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            let errorMsg = 'Registration failed. Please try again.';
            if (data.message) errorMsg = data.message;
            else if (data.error) errorMsg = data.error;
            
            toast.error('Registration failed', errorMsg);
        }
    } catch (error) {
        console.error('Registration error:', error);
        toast.error('Network error', 'Unable to connect. Please check your connection and try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});