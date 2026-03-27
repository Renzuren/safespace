// Configure physics toast
if (typeof toast !== 'undefined') {
    toast.defaults = { position: 'top-right', duration: 4000, showProgress: true, pauseOnHover: true, spring: true };
}

function getAuthToken() { return localStorage.getItem('token') || sessionStorage.getItem('token'); }

function handleLogout() {
    localStorage.removeItem('token'); sessionStorage.removeItem('token');
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

// Offense levels list
const offenseLevels = ['Physical Harassment', 'Verbal Harassment', 'Non-Verbal Harassment', 'Cyber Sexual Harassment', 'Not Harassment'];

let allReports = [];
let currentPage = 1;
let totalPages = 1;
let totalItems = 0;
const rowsPerPage = 8;
let currentFilters = {
    search: '',
    status: 'all',
    offense: 'all'
};
let debounceTimer = null;

async function fetchReports(page = 1) {
    const token = getAuthToken();
    if (!token) { 
        if (typeof toast !== 'undefined') toast.error('No token', 'Please login.'); 
        return; 
    }
    
    // Show loading state
    const tbody = document.getElementById('desktop-table-body');
    const mobileContainer = document.getElementById('mobile-cards-container');
    if (tbody) tbody.innerHTML = '<td colspan="8" class="text-center py-8"><div class="loading-spinner mx-auto"></div> Loading...</td>';
    if (mobileContainer) mobileContainer.innerHTML = '<div class="text-center py-8"><div class="loading-spinner mx-auto"></div> Loading...</div>';
    
    try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', rowsPerPage);
        
        // Add filters
        if (currentFilters.search && currentFilters.search.trim()) {
            params.append('search', currentFilters.search.trim());
        }
        if (currentFilters.status && currentFilters.status !== 'all') {
            params.append('status', currentFilters.status);
        }
        if (currentFilters.offense && currentFilters.offense !== 'all') {
            params.append('offenseLevel', currentFilters.offense);
        }
        
        const url = `https://safespace-back.onrender.com/api/v1/admin/reports?${params.toString()}`;
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
            allReports = result.data.map(r => ({
                reportId: r.reportId,
                id: r.id,
                date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                complainant: `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Anonymous',
                respondent: r.complainedFullName || 'Unknown',
                offenseLevel: r.remarks || null,
                procedure: r.procedureType || 'Undecided',
                status: r.status || 'pending',
                fullDetails: r
            }));
            
            // Update pagination info from backend
            currentPage = result.pagination.page;
            totalPages = result.pagination.totalPages;
            totalItems = result.pagination.total;
            
            renderDesktop();
            renderMobile();
        } else {
            allReports = [];
            totalItems = 0;
            totalPages = 1;
            renderDesktop();
            renderMobile();
        }
    } catch (err) {
        console.error(err);
        if (typeof toast !== 'undefined') toast.error('Error', 'Failed to load reports.');
        const tbody = document.getElementById('desktop-table-body');
        if (tbody) tbody.innerHTML = '<td colspan="8" class="text-center py-8 text-red-600">Error loading data</td>';
    }
}

// Combined update API call (status and/or offenseLevel)
async function updateReport(reportId, updateData) {
    const token = getAuthToken();
    if (!token) { if (typeof toast !== 'undefined') toast.error('Auth required', 'Please login.'); return false; }
    try {
        const response = await fetch(`https://safespace-back.onrender.com/api/v1/admin/report/${reportId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        const result = await response.json();
        if (response.ok && result.success) {
            if (typeof toast !== 'undefined') {
                const messages = [];
                if (updateData.status) messages.push(`status to ${updateData.status}`);
                if (updateData.offenseLevel !== undefined) messages.push(`offense to ${updateData.offenseLevel || 'not set'}`);
                toast.success('Updated', `Report ${messages.join(', ')}`);
            }
            // Refresh current page to get updated data
            fetchReports(currentPage);
            return true;
        } else {
            if (typeof toast !== 'undefined') toast.error('Update failed', result.message || 'Could not update report');
            return false;
        }
    } catch (err) {
        if (typeof toast !== 'undefined') toast.error('Network error', 'Please check connection');
        return false;
    }
}

// Apply filters with debounce
function applyFilters() {
    // Clear previous debounce timer
    if (debounceTimer) clearTimeout(debounceTimer);
    
    // Debounce search to avoid too many requests
    debounceTimer = setTimeout(() => {
        currentFilters = {
            search: document.getElementById('searchInput')?.value || '',
            status: document.getElementById('statusFilter')?.value || 'all',
            offense: document.getElementById('offenseFilter')?.value || 'all'
        };
        // Reset to page 1 when filters change
        fetchReports(1);
    }, 500); // 500ms delay for search
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('offenseFilter').value = 'all';
    
    currentFilters = {
        search: '',
        status: 'all',
        offense: 'all'
    };
    fetchReports(1);
}

function renderDesktop() {
    const tbody = document.getElementById('desktop-table-body');
    if (!tbody) return;
    
    if (allReports.length === 0) {
        tbody.innerHTML = `<td colspan="8" class="text-center py-8 text-[#8F7E7E]">No reports found</td>`;
    } else {
        tbody.innerHTML = allReports.map(r => {
            const offenseValue = r.offenseLevel || '';
            return `
                 <tr>
                    <td class="text-sm">${r.date}</td>
                    <td><div class="font-medium">${escapeHtml(r.complainant)}</div></td>
                    <td class="text-sm">${escapeHtml(r.respondent)}</td>
                    <td>
                        <select class="offense-select" data-report-id="${r.reportId || r.id}" onchange="handleOffenseChange('${r.reportId || r.id}', this.value)">
                            <option value="">-- select offense --</option>
                            ${offenseLevels.map(level => `<option value="${level}" ${offenseValue === level ? 'selected' : ''}>${level}</option>`).join('')}
                        </select>
                    </td>
                    <td class="text-sm">${r.procedure}</td>
                    <td>
                        <select class="status-select ${r.status}" data-report-id="${r.reportId || r.id}" onchange="handleStatusChange('${r.reportId || r.id}', this.value)">
                            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="investigating" ${r.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                            <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </td>
                    <td><button class="action-btn" onclick="viewReportDetails('${r.reportId || r.id}')"><i class="fas fa-eye"></i> View</button></td>
                 </tr>
            `;
        }).join('');
    }
    
    // Update pagination info
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(start + rowsPerPage - 1, totalItems);
    document.getElementById('desktop-pagination-info').innerHTML = totalItems > 0 ? `Showing ${start}–${end} of ${totalItems}` : 'No results';
    renderPagination('desktop', totalPages);
}

function renderMobile() {
    const container = document.getElementById('mobile-cards-container');
    if (!container) return;
    
    if (allReports.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-[#8F7E7E] bg-white rounded-xl border p-8">No reports found</div>`;
    } else {
        container.innerHTML = allReports.map(r => {
            const offenseValue = r.offenseLevel || '';
            return `
                <div class="report-card">
                    <div class="flex justify-between items-start mb-2">
                        <div><div class="font-semibold text-sm">${r.reportId ? r.reportId.slice(0,12)+'…' : 'N/A'}</div><div class="text-xs text-[#8F7E7E]">${r.date}</div></div>
                        <select class="status-select ${r.status}" onchange="handleStatusChange('${r.reportId || r.id}', this.value)">
                            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="investigating" ${r.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                            <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </div>
                    <div class="report-card-row"><span class="report-card-label">Complainant</span><span class="report-card-value">${escapeHtml(r.complainant)}</span></div>
                    <div class="report-card-row"><span class="report-card-label">Respondent</span><span class="report-card-value">${escapeHtml(r.respondent)}</span></div>
                    <div class="report-card-row"><span class="report-card-label">Offense level</span><span class="report-card-value">
                        <select class="offense-select" onchange="handleOffenseChange('${r.reportId || r.id}', this.value)">
                            <option value="">-- select offense --</option>
                            ${offenseLevels.map(level => `<option value="${level}" ${offenseValue === level ? 'selected' : ''}>${level}</option>`).join('')}
                        </select>
                    </span></div>
                    <div class="report-card-row"><span class="report-card-label">Procedure</span><span class="report-card-value">${r.procedure}</span></div>
                    <div class="mt-3 text-right"><button class="text-up text-sm font-medium" onclick="viewReportDetails('${r.reportId || r.id}')"><i class="fas fa-eye mr-1"></i> View Details</button></div>
                </div>
            `;
        }).join('');
    }
    
    // Update pagination info
    const start = (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(start + rowsPerPage - 1, totalItems);
    document.getElementById('mobile-pagination-info').innerHTML = totalItems > 0 ? `Showing ${start}–${end} of ${totalItems}` : 'No results';
    renderPagination('mobile', totalPages);
}

function renderPagination(view, totalPages) {
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
    fetchReports(newPage);
}

// Handle status change using combined API
window.handleStatusChange = async function(reportId, newStatus) {
    const selects = document.querySelectorAll(`select[data-report-id="${reportId}"]`);
    selects.forEach(sel => sel.disabled = true);
    await updateReport(reportId, { status: newStatus });
    selects.forEach(sel => sel.disabled = false);
};

// Handle offense change using combined API
window.handleOffenseChange = async function(reportId, newOffense) {
    const selects = document.querySelectorAll(`select.offense-select`);
    selects.forEach(sel => { if(sel.getAttribute('data-report-id') === reportId) sel.disabled = true; });
    // Send offenseLevel (null if empty string selected)
    const offenseValue = newOffense === '' ? null : newOffense;
    await updateReport(reportId, { offenseLevel: offenseValue });
    selects.forEach(sel => sel.disabled = false);
};

window.viewReportDetails = function(reportId) {
    const report = allReports.find(r => (r.reportId === reportId) || (r.id === reportId));
    if (!report) { 
        if (typeof toast !== 'undefined') toast.error('Not found', 'Report details missing'); 
        return; 
    }
    const d = report.fullDetails || {};
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="max-h-[75vh] p-5">
            <!-- Status and ID Row -->
            <div class="flex flex-wrap justify-between items-center gap-3 pb-4 mb-4 border-b border-gray-200">
                <span class="text-xs text-gray-500 font-mono">ID: ${report.reportId || report.id || 'N/A'}</span>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(report.status)}">${(report.status || 'pending').toUpperCase()}</span>
            </div>
            
            <!-- All Fields in Simple Grid -->
            <div class="grid grid-cols-1 md:grid-cols-1 gap-x-6 gap-y-3">
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Full Name</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.firstName || '')} ${escapeHtml(d.middleName || '')} ${escapeHtml(d.lastName || '')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Age</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.age || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Biological Sex</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.biologicalSex || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Identified As</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.identifiedAs || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Civil Status</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.civilStatus || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Mobile Number</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.mobileNumber || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Landline Number</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.landLineNumber || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Present Address</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.presentAddress || 'N/A')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Permanent Address</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.permanentAddress || 'N/A')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Classification</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.classification || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">College</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.college || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Department/Unit</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.department || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Respondent Full Name</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.complainedFullName || 'N/A')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Respondent Sex</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.complainedSex || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Respondent Classification</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.complainedClassification || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Respondent College</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.complainedCollege || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Respondent Department</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.complainedDepartment || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Victim is UP Constituent?</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.victimConstituent || 'N/A')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Perpetrator is UP Constituent?</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.complainedConstituent || 'N/A')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Inside Campus Premises?</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.complainedInsideCampus || 'N/A')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Procedure Type</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.procedureType || 'Undecided'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Where did you hear about us?</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.whereDidYouHearAboutUs || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Other Source</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.otherWhereDidYouHearAboutUs || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Applicable Laws</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.applicableLaws || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Offense Level</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.offenseLevel || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Penalty</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.recommendedSanction || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Remarks</div>
                    <div class="w-3/5 text-sm text-gray-800">${escapeHtml(d.remarks || 'N/A')}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Predicted Offense</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.predictedOffense || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Predicted Severity</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.predictedSeverity || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Offense Level</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.offenseLevel || report.offenseLevel || 'Not set'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Penalty</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.recommendedSanction || 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Created</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A'}</div>
                </div>
                <div class="flex py-2 border-b border-gray-100">
                    <div class="w-2/5 text-xs text-gray-500 font-medium">Last Updated</div>
                    <div class="w-3/5 text-sm text-gray-800">${d.updatedAt ? new Date(d.updatedAt).toLocaleString() : 'N/A'}</div>
                </div>
            </div>
            
            <!-- Long Text Fields (Full Width) -->
            <div class="mt-6 space-y-4">
                <div>
                    <div class="text-xs text-gray-500 font-medium mb-2">Incident Details</div>
                    <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">${escapeHtml(d.complainantStory || 'N/A')}</div>
                </div>
                <div>
                    <div class="text-xs text-gray-500 font-medium mb-2">Incident Event</div>
                    <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">${escapeHtml(d.complainedIncidentHappened || 'N/A')}</div>
                </div>
                <div>
                    <div class="text-xs text-gray-500 font-medium mb-2">Physical Appearance</div>
                    <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">${escapeHtml(d.complainedPhysicalAppearance || 'N/A')}</div>
                </div>
            </div>
            
            <!-- Laws Container -->
            <div id="applicableLawsContainer"></div>
        </div>
    `;
    
    // Display applicable laws using LawMapper
    if (typeof LawMapper !== 'undefined') {
        const lawMapperData = {
            victimClassification: d.classification || '',
            complainedClassification: d.complainedClassification || '',
            victimConstituent: d.victimConstituent || 'No',
            complainedConstituent: d.complainedConstituent || 'No',
            relationshipType: d.relationshipType || 'none'
        };
        
        const result = LawMapper.determineApplicableLaws(lawMapperData);
        
        // Call LawMapper.displayApplicableLaws - it will find the container by ID
        LawMapper.displayApplicableLaws(result.applicableLaws, result.externalAssistance);
    } else {
        const lawsContainer = document.getElementById('applicableLawsContainer');
        if (lawsContainer) {
            lawsContainer.innerHTML = `
                <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div class="flex items-start gap-3">
                        <i class="fas fa-info-circle text-blue-500 mt-0.5"></i>
                        <div class="flex-1">
                            <p class="text-sm text-gray-700">Need legal guidance? Contact OASH: (049) 501-1844 | oash.uplb@up.edu.ph</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    document.getElementById('viewModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

// Add this helper function if not already present
function getStatusClass(status) {
    const statusMap = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'investigating': 'bg-blue-100 text-blue-800',
        'resolved': 'bg-green-100 text-green-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

function closeModal() {
    document.getElementById('viewModal').classList.add('hidden');
    document.body.style.overflow = '';
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

// Event listeners with debounced filtering
document.getElementById('searchInput')?.addEventListener('input', () => applyFilters());
document.getElementById('statusFilter')?.addEventListener('change', () => applyFilters());
document.getElementById('offenseFilter')?.addEventListener('change', () => applyFilters());
document.getElementById('clearFiltersBtn')?.addEventListener('click', () => clearFilters());
document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
document.getElementById('viewModal')?.addEventListener('click', (e) => { if(e.target === document.getElementById('viewModal')) closeModal(); });

window.changePage = changePage;

// Initialize
if (checkAuth()) {
    fetchReports(1);
}