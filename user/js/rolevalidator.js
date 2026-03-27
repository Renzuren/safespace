// roleValidator.js
// Middleware to check if user has access - only allows 'user' role

// Function to get current user role from localStorage/sessionStorage
function getUserRole() {
    // Get role from localStorage
    const role = localStorage.getItem('role');
    return role;
}

// Function to check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token !== null;
}

// Function to redirect to login page
function redirectToLogin() {
    window.location.href = '/login.html';
}

// Function to check if user has access (only allows 'user' role)
function validateUser() {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        console.log('User not authenticated, redirecting to login');
        redirectToLogin();
        return false;
    }
    
    // Get user role
    const userRole = getUserRole();
    
    if (!userRole) {
        console.log('User role not found, redirecting to login');
        redirectToLogin();
        return false;
    }
    
    // Check if user role is 'user'
    if (userRole === 'user') {
        console.log('Access granted for user');
        return true;
    } else {
        console.log('Access denied. Invalid role, redirecting to login');
        redirectToLogin();
        return false;
    }
}

// Function to logout user
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    redirectToLogin();
}

// Function to get current user token
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Export functions for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getUserRole,
        isAuthenticated,
        validateUser,
        logout,
        getToken,
        redirectToLogin
    };
}