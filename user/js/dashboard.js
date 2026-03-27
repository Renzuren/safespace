// --- Helper: get token from localStorage ---
const getAuthToken = () => localStorage.getItem('token');

// --- Logout handler ---
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = '/login.html';
};

// --- API caller with Bearer token ---
const apiRequest = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
        // No token, redirect to login
        window.location.href = '/login.html';
        throw new Error('No token found');
    }
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    
    if (response.status === 401 || response.status === 403) {
        // token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/login.html';
        throw new Error('Unauthorized');
    }
    
    const json = await response.json();
    if (!json.success) {
        throw new Error(json.message || 'API error');
    }
    return json;
};

// --- format date from ISO to readable: Apr 12, 2025 · 2:00 PM ---
const formatAppointmentDate = (preferredDate, preferredTime) => {
    try {
        const date = new Date(preferredDate);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        const dateStr = date.toLocaleDateString('en-US', options);
        // preferredTime format maybe "14:00" or "2:00 PM"? API gave "12:00"
        let timeStr = preferredTime;
        if (typeof preferredTime === 'string' && preferredTime.includes(':')) {
            const [hour, minute] = preferredTime.split(':');
            let hourNum = parseInt(hour, 10);
            const ampm = hourNum >= 12 ? 'PM' : 'AM';
            hourNum = hourNum % 12 || 12;
            timeStr = `${hourNum}:${minute} ${ampm}`;
        }
        return `${dateStr} · ${timeStr}`;
    } catch(e) { return `${preferredDate} · ${preferredTime}`; }
};

// --- format report date (createdAt) ---
const formatReportDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- get status badge color & label ---
const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved') return '<span class="inline-block text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resolved</span>';
    if (s === 'pending') return '<span class="inline-block text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending review</span>';
    if (s === 'in review') return '<span class="inline-block text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">In review</span>';
    return `<span class="inline-block text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">${status || 'Draft'}</span>`;
};

// --- Load dashboard stats (/api/v1/user/dashboard) ---
const loadDashboardStats = async () => {
    try {
        const response = await apiRequest('https://safespace-back.onrender.com/api/v1/user/dashboard');
        const data = response.data;
        document.getElementById('totalReports').innerText = data.totalReports ?? 0;
        document.getElementById('pendingReports').innerText = data.pending ?? 0;
        document.getElementById('totalAppointments').innerText = data.appointments ?? 0;
        document.getElementById('resolvedReports').innerText = data.resolved ?? 0;
        
        // Optional: extra info for pending text
        const pendingCount = data.pending ?? 0;
        document.getElementById('pendingStatusText').innerText = pendingCount === 0 ? 'No pending cases' : `${pendingCount} under review`;
        
        // delta text for total reports (mock trend from previous month? just use dynamic text)
        const total = data.totalReports ?? 0;
        const deltaSpan = document.getElementById('totalReportsDelta');
        if (total > 0) deltaSpan.innerHTML = `<i class="fas fa-chart-line"></i> Total reports to date`;
        else deltaSpan.innerHTML = `<i class="fas fa-chart-line"></i> No reports yet`;
        
        // next appointment hint (if we have appointments from upcoming we can fill later, but we can try to fetch the first upcoming)
        // will improve after appointments load
    } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        document.getElementById('totalReports').innerText = 'Error';
    }
};

// --- Load recent reports (limit 3) ---
const loadRecentReports = async () => {
    const container = document.getElementById('recentReportsList');
    container.innerHTML = '<div class="py-3 text-center text-gray-400 text-sm">Loading reports...</div>';
    try {
        const response = await apiRequest('https://safespace-back.onrender.com/api/v1/user/reports?page=1&limit=3');
        const reports = response.data || [];
        if (!reports.length) {
            container.innerHTML = '<div class="py-4 text-center text-gray-400 text-sm">No reports found.<br>Click "File a report" to get started.</div>';
            return;
        }
        let html = '';
        reports.forEach(report => {
            // extract complaint title: use complainantStory short version or a fallback
            let title = report.complainantStory ? (report.complainantStory.length > 50 ? report.complainantStory.substring(0, 50) + '...' : report.complainantStory) : 'Anonymous report';
            // also we can use procedureType or incident description, but story is good
            const reportNumber = report.reportId ? report.reportId.substring(0, 12) : `#${report.id?.substring(0,8)}`;
            const dateStr = formatReportDate(report.createdAt);
            const statusBadge = getStatusBadge(report.status);
            html += `
                <div class="pb-3 border-b border-[#F0E4E4]">
                    <p class="text-sm font-medium text-[#2A2424]">${escapeHtml(title)}</p>
                    <p class="text-xs text-[#8F7E7E]">Report ${reportNumber} · ${dateStr}</p>
                    ${statusBadge}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error('Failed to load reports:', err);
        container.innerHTML = '<div class="py-4 text-center text-red-400 text-sm">Could not load reports. Please try again later.</div>';
    }
};

// --- Load upcoming appointments (limit 3) ---
const loadUpcomingAppointments = async () => {
    const container = document.getElementById('upcomingAppointmentsList');
    container.innerHTML = '<div class="py-3 text-center text-gray-400 text-sm">Loading appointments...</div>';
    try {
        const response = await apiRequest('https://safespace-back.onrender.com/api/v1/user/appointments?page=1&limit=3');
        const appointments = response.data || [];
        if (!appointments.length) {
            container.innerHTML = '<div class="py-4 text-center text-gray-400 text-sm">No upcoming appointments.<br>Click "Schedule" to book one.</div>';
            // update next hint in stats card
            document.getElementById('nextAppointmentHint').innerHTML = 'No upcoming';
            return;
        }
        // sort by preferredDate ascending
        appointments.sort((a,b) => new Date(a.preferredDate) - new Date(b.preferredDate));
        const nextApp = appointments[0];
        if (nextApp) {
            const nextDateFormatted = formatAppointmentDate(nextApp.preferredDate, nextApp.preferredTime);
            document.getElementById('nextAppointmentHint').innerHTML = `Next: ${nextDateFormatted}`;
        } else {
            document.getElementById('nextAppointmentHint').innerHTML = 'No upcoming';
        }

        let html = '';
        appointments.forEach(app => {
            const mode = app.consultationMode === 'in-person' ? 'In-person' : 'Virtual';
            const locationText = app.consultationMode === 'in-person' ? 'OASH / Guidance' : 'Online';
            const dateDisplay = formatAppointmentDate(app.preferredDate, app.preferredTime);
            let statusText = app.status === 'confirmed' ? 'Confirmed' : (app.status === 'pending' ? 'Pending' : app.status);
            let statusColor = app.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
            if (app.status === 'cancelled') statusColor = 'bg-red-100 text-red-700';
            html += `
                <div class="pb-3 border-b border-[#F0E4E4] last:border-0">
                    <p class="text-sm font-medium text-[#2A2424]">${escapeHtml(app.purpose || 'Counseling')} (${mode})</p>
                    <p class="text-xs text-[#8F7E7E]">${dateDisplay}</p>
                    <span class="inline-block mt-1 text-[10px] ${statusColor} px-2 py-0.5 rounded-full">${statusText}</span>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error('Failed to load appointments:', err);
        container.innerHTML = '<div class="py-4 text-center text-red-400 text-sm">Could not load appointments.</div>';
    }
};

// --- Load user info from token or localStorage to display name/email (decoded from JWT or stored) ---
const loadUserInfo = async () => {
    try {
        const token = getAuthToken();
        if (token) {
            // simple decode to extract name/email if JWT payload exists (we also store userData on login)
            const storedUser = localStorage.getItem('userData');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                document.getElementById('sidebarFullName').innerText = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
                document.getElementById('sidebarEmail').innerText = user.email || '';
                const firstName = user.firstName || user.fullName?.split(' ')[0] || 'User';
                document.getElementById('userFirstName').innerText = firstName;
                document.getElementById('welcomeHeading').innerHTML = `Welcome back, ${firstName}`;
            } else {
                // fallback: try to fetch /api/v1/user/profile if endpoint exists? but we just show generic
                document.getElementById('sidebarFullName').innerText = 'UPLB User';
                document.getElementById('sidebarEmail').innerText = 'student@uplb.edu.ph';
                document.getElementById('userFirstName').innerText = 'Student';
            }
        } else {
            // no token, redirect
            window.location.href = '/login.html';
        }
    } catch(e) { console.warn(e); }
};

// Helper to escape HTML
const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
};

// --- init dashboard: load all data sequentially ---
const initDashboard = async () => {
    // Check token presence first
    if (!getAuthToken()) {
        window.location.href = '/login.html';
        return;
    }
    await loadUserInfo();
    await Promise.all([
        loadDashboardStats(),
        loadRecentReports(),
        loadUpcomingAppointments()
    ]);
};

// Attach logout event listeners
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
});
document.getElementById('mobileLogoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
});

// For mobile bottom nav dashboard link, ensure refresh stays but link active style (noop)
const mobileDashboard = document.querySelector('[data-mobile-nav="dashboard"]');
if (mobileDashboard) mobileDashboard.addEventListener('click', (e) => { e.preventDefault(); window.location.reload(); });

// run initialization
initDashboard();