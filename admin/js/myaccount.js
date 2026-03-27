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

// Helper functions
function getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    if (typeof toast !== 'undefined') {
        toast.success('Logged out', 'You have been successfully logged out.');
    }
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1500);
}

// Check authentication
function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        if (typeof toast !== 'undefined') {
            toast.warning('Authentication required', 'Please log in to view your account.');
        }
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return false;
    }
    return true;
}

// Format date to readable format
function formatDate(dateString) {
    if (!dateString) return 'Not available';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

// Generate avatar initials from full name
function getInitials(fullName) {
    if (!fullName) return 'AD';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

// Populate UI with admin data
function populateAdminData(adminData) {
    const fullName = adminData.fullName || 'Admin User';
    const email = adminData.email || '';
    const createdAt = adminData.createdAt || '';
    const role = adminData.role || 'admin';
    
    // Set form fields
    document.getElementById('fullName').value = fullName;
    document.getElementById('email').value = email;
    document.getElementById('memberSince').value = formatDate(createdAt);
    
    // Set role badge
    const roleBadgeSpan = document.getElementById('roleBadge');
    if (roleBadgeSpan) {
        if (role === 'admin') {
            roleBadgeSpan.innerHTML = '<i class="fas fa-shield-alt mr-1"></i> System Administrator';
        } else {
            roleBadgeSpan.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        }
    }
    
    // Update avatar initials
    const avatarDiv = document.getElementById('avatar');
    if (avatarDiv) {
        avatarDiv.textContent = getInitials(fullName);
    }
    
    // Update sidebar info
    const sidebarFullName = document.getElementById('sidebarFullName');
    const sidebarEmail = document.getElementById('sidebarEmail');
    if (sidebarFullName) {
        sidebarFullName.textContent = fullName.split(' ')[0] || 'Admin';
    }
    if (sidebarEmail) {
        sidebarEmail.textContent = email;
    }
}

// Fetch admin profile from API
async function fetchAdminProfile() {
    const token = getAuthToken();
    
    if (!token) {
        console.warn('No authentication token found');
        if (typeof toast !== 'undefined') {
            toast.warning('Authentication required', 'Please log in to view your account.');
        }
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return false;
    }
    
    // Show loading state in avatar and form
    const avatarDiv = document.getElementById('avatar');
    if (avatarDiv) avatarDiv.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const response = await fetch('https://safespace-back.onrender.com/api/v1/admin/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('API error:', result);
            if (response.status === 401 || response.status === 403) {
                if (typeof toast !== 'undefined') {
                    toast.error('Session expired', 'Please log in again.');
                }
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                if (typeof toast !== 'undefined') {
                    toast.error('Error', result.message || 'Failed to load account information');
                }
            }
            // Reset avatar to error state
            if (avatarDiv) avatarDiv.textContent = '!';
            return false;
        }
        
        // Expected structure: { success: true, data: { ...adminData } }
        if (result.success && result.data) {
            populateAdminData(result.data);
            if (typeof toast !== 'undefined') {
                toast.success('Account loaded', 'Your profile information has been loaded.');
            }
            return true;
        } else {
            if (typeof toast !== 'undefined') {
                toast.error('Invalid response', 'Unable to load account data.');
            }
            return false;
        }
        
    } catch (error) {
        console.error('Network error:', error);
        if (typeof toast !== 'undefined') {
            toast.error('Connection error', 'Unable to connect to server. Please check your connection.');
        }
        if (avatarDiv) avatarDiv.textContent = '!';
        return false;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Configure toast first
    if (typeof toast !== 'undefined') {
        toast.defaults = {
            position: 'top-right',
            duration: 4000,
            showProgress: true,
            pauseOnHover: true,
            spring: true
        };
    }
    
    // Check auth and load profile
    if (checkAuth()) {
        fetchAdminProfile();
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Mobile logout if exists (not in current HTML but for consistency)
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
});