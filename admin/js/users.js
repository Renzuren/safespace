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
        // ---------- Helper Functions ----------
function getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    if (typeof toast !== 'undefined') toast.success('Logged out', 'You have been successfully logged out.');
    setTimeout(() => { window.location.href = '/login.html'; }, 1500);
}

function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        if (typeof toast !== 'undefined') toast.warning('Authentication required', 'Please log in to continue.');
        setTimeout(() => { window.location.href = '/login.html'; }, 2000);
        return false;
    }
    return true;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDate(isoDate) {
    if (!isoDate) return 'N/A';
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---------- Global State ----------
let allUsers = [];
let currentPage = 1;
let totalPages = 1;
let totalItems = 0;
const rowsPerPage = 10;

let currentFilters = {
    search: '',
    role: 'all'
};
let debounceTimer = null;

// ---------- API Calls ----------
async function fetchUsers(page = 1) {
    const token = getAuthToken();
    if (!token) return;

    // Show loading state
    const tbody = document.getElementById('desktop-table-body');
    const mobileContainer = document.getElementById('mobile-cards-container');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8"><div class="loading-spinner mx-auto"></div> Loading... </tr>';
    if (mobileContainer) mobileContainer.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto"></div> Loading...</div>';

    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', rowsPerPage);
        
        if (currentFilters.search && currentFilters.search.trim()) {
            params.append('search', currentFilters.search.trim());
        }
        if (currentFilters.role && currentFilters.role !== 'all') {
            params.append('role', currentFilters.role);
        }
        
        const url = `https://safespace-back.onrender.com/api/v1/admin/users?${params.toString()}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                if (typeof toast !== 'undefined') toast.error('Session expired', 'Please login again.');
                localStorage.removeItem('token');
                setTimeout(() => window.location.href = '/login.html', 1500);
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
            allUsers = result.data.map(user => ({
                id: user.userId || user.id,
                fullName: user.fullName || 'Unknown',
                email: user.email || 'No email',
                role: user.role || 'user',
                createdAt: user.createdAt,
                userId: user.userId
            }));
            
            if (result.pagination) {
                totalPages = result.pagination.totalPages;
                totalItems = result.pagination.total;
                currentPage = result.pagination.page;
            } else {
                totalPages = Math.ceil(allUsers.length / rowsPerPage);
                totalItems = allUsers.length;
            }
            
            renderDesktop();
            renderMobile();
            updateSidebarInfo();
        } else {
            allUsers = [];
            renderDesktop();
            renderMobile();
        }
    } catch (err) {
        console.error(err);
        if (typeof toast !== 'undefined') toast.error('Error', 'Failed to load users.');
        const tbody = document.getElementById('desktop-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-red-600">Error loading data</tr>';
    }
}

async function updateSidebarInfo() {
    const token = getAuthToken();
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.email) document.getElementById('sidebarEmail').innerText = payload.email;
            if (payload.fullName) document.getElementById('sidebarFullName').innerText = payload.fullName;
        } catch(e) {}
    }
}

// Update user role via API - CORRECT ENDPOINT
async function updateUserRole(userId, newRole) {
    const token = getAuthToken();
    if (!token) return false;
    try {
        // Using the correct endpoint: /api/v1/admin/users/:userId
        const response = await fetch(`https://safespace-back.onrender.com/api/v1/admin/users/${userId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ role: newRole })
        });
        const result = await response.json();
        if (response.ok && result.success) {
            if (typeof toast !== 'undefined') toast.success('Role updated', `User role changed to ${newRole}`);
            // Refresh current page to reflect changes
            fetchUsers(currentPage);
            return true;
        } else {
            if (typeof toast !== 'undefined') toast.error('Update failed', result.message || 'Could not update role');
            return false;
        }
    } catch (err) {
        console.error('Error updating role:', err);
        if (typeof toast !== 'undefined') toast.error('Network error', 'Please check connection');
        return false;
    }
}

// Global handler for role select changes
window.handleRoleChange = async function(userId, selectElement) {
    const newRole = selectElement.value;
    // Disable select temporarily
    selectElement.disabled = true;
    const success = await updateUserRole(userId, newRole);
    if (!success) {
        // revert selected option to previous role
        const currentUser = allUsers.find(u => u.id === userId);
        if (currentUser) selectElement.value = currentUser.role;
    }
    selectElement.disabled = false;
};

// View user details modal
window.openViewModal = function(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        if (typeof toast !== 'undefined') toast.error('Not found', 'User details missing');
        return;
    }
    const modal = document.getElementById('viewModal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="detail-row"><div class="detail-label">Full Name</div><div class="detail-value">${escapeHtml(user.fullName)}</div></div>
        <div class="detail-row"><div class="detail-label">Email</div><div class="detail-value">${escapeHtml(user.email)}</div></div>
        <div class="detail-row"><div class="detail-label">Role</div><div class="detail-value"><span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">${user.role.toUpperCase()}</span></div></div>
        <div class="detail-row"><div class="detail-label">User ID</div><div class="detail-value text-xs">${escapeHtml(user.id)}</div></div>
        <div class="detail-row"><div class="detail-label">Joined</div><div class="detail-value">${formatDate(user.createdAt)}</div></div>
    `;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

function closeModal() {
    const modal = document.getElementById('viewModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function applyFilters() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        currentFilters = {
            search: document.getElementById('searchInput')?.value || '',
            role: document.getElementById('roleFilter')?.value || 'all'
        };
        currentPage = 1;
        fetchUsers(1);
    }, 400);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('roleFilter').value = 'all';
    currentFilters = { search: '', role: 'all' };
    currentPage = 1;
    fetchUsers(1);
}

function renderDesktop() {
    const tbody = document.getElementById('desktop-table-body');
    if (!tbody) return;
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-[#8F7E7E]">No users found</tr>';
    } else {
        tbody.innerHTML = allUsers.map(user => `
            <tr>
                <td><div class="font-medium">${escapeHtml(user.fullName)}</div></td>
                <td><div class="text-sm">${escapeHtml(user.email)}</div></td>
                <td>
                    <select class="role-select ${user.role}" data-user-id="${user.id}" onchange="handleRoleChange('${user.id}', this)">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn" onclick="openViewModal('${user.id}')" title="View details"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    }
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(start + rowsPerPage - 1, totalItems);
    document.getElementById('desktop-pagination-info').innerHTML = totalItems > 0 ? `Showing ${start}–${end} of ${totalItems}` : 'No results';
    renderPagination('desktop');
}

function renderMobile() {
    const container = document.getElementById('mobile-cards-container');
    if (!container) return;
    if (allUsers.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-[#8F7E7E] bg-white rounded-xl border p-8">No users found</div>';
        return;
    }
    container.innerHTML = allUsers.map(user => `
        <div class="user-card">
            <div class="flex justify-between items-start mb-2">
                <div class="font-semibold">${escapeHtml(user.fullName)}</div>
                <select class="role-select ${user.role}" onchange="handleRoleChange('${user.id}', this)">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
            <div class="user-card-row"><span class="user-card-label">Email</span><span class="user-card-value">${escapeHtml(user.email)}</span></div>
            <div class="flex justify-end gap-2 mt-3 pt-2 border-t border-[#F0E4E4]">
                <button class="action-btn" onclick="openViewModal('${user.id}')"><i class="fas fa-eye mr-1"></i> View</button>
            </div>
        </div>
    `).join('');
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(start + rowsPerPage - 1, totalItems);
    document.getElementById('mobile-pagination-info').innerHTML = totalItems > 0 ? `Showing ${start}–${end} of ${totalItems}` : 'No results';
    renderPagination('mobile');
}

function renderPagination(view) {
    const container = document.getElementById(`${view}-pagination-buttons`);
    if (!container) return;
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let buttons = '';
    buttons += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            buttons += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            buttons += `<span class="px-2 text-[#8F7E7E]">...</span>`;
        }
    }
    buttons += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    container.innerHTML = buttons;
}

function changePage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    fetchUsers(newPage);
}

// Event listeners
document.getElementById('searchInput')?.addEventListener('input', applyFilters);
document.getElementById('roleFilter')?.addEventListener('change', applyFilters);
document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
document.getElementById('viewModal')?.addEventListener('click', (e) => { if(e.target === document.getElementById('viewModal')) closeModal(); });

window.changePage = changePage;

// Initialize
if (checkAuth()) {
    fetchUsers(1);
}