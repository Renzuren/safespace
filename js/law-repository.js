// Configuration
const ITEMS_PER_PAGE = 10;

// State
let currentPage = 1;
let totalPages = 1;
let filteredPolicies = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Merge all policy arrays into one
    const all_policies = [
        ...antiSexualHarassmentCode,
        ...irrRA11313,
        ...ra7877,
        ...ra9262,
        ...raccs
    ];
    
    // Check if we have any policies
    if (!all_policies || all_policies.length === 0) {
        console.error('Policy database is empty.');
        return;
    }
    
    // Populate filter dropdowns dynamically
    populateFilters(all_policies);
    
    // Initialize the law repository
    initLawRepository(all_policies);
});

function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!menuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

function initLawRepository(policies) {
    // DOM elements
    const elements = {
        searchInput: document.getElementById('searchInput'),
        categoryFilter: document.getElementById('categoryFilter'),
        legalBasisFilter: document.getElementById('legalBasisFilter'),
        policyList: document.getElementById('policyList'),
        noResults: document.getElementById('noResults'),
        visibleCount: document.getElementById('visibleCount'),
        clearFiltersBtn: document.getElementById('clearFilters'),
        totalCount: document.getElementById('totalCount'),
        harassmentCount: document.getElementById('harassmentCount'),
        academicCount: document.getElementById('academicCount'),
        penaltiesCount: document.getElementById('penaltiesCount'),
        paginationContainer: document.getElementById('paginationContainer'),
        prevPageBtn: document.getElementById('prevPage'),
        nextPageBtn: document.getElementById('nextPage'),
        pageInfo: document.getElementById('pageInfo')
    };
    
    // Validate required elements
    if (!validateElements(elements)) return;
    
    // Update statistics
    updateStatistics(policies, elements);
    
    // Initial filter and render
    filterAndRender(policies, elements);
    
    // Event listeners
    elements.searchInput.addEventListener('input', () => {
        currentPage = 1; // Reset to first page on new search
        filterAndRender(policies, elements);
    });
    
    elements.categoryFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on filter change
        filterAndRender(policies, elements);
    });
    
    elements.legalBasisFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page on filter change
        filterAndRender(policies, elements);
    });
    
    elements.clearFiltersBtn.addEventListener('click', () => {
        clearFilters(elements);
        currentPage = 1; // Reset to first page
        filterAndRender(policies, elements);
    });
    
    // Pagination event listeners
    if (elements.prevPageBtn) {
        elements.prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCurrentPage(elements);
            }
        });
    }
    
    if (elements.nextPageBtn) {
        elements.nextPageBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCurrentPage(elements);
            }
        });
    }
}

function validateElements(elements) {
    const required = ['searchInput', 'categoryFilter', 'legalBasisFilter', 'policyList', 
                      'noResults', 'visibleCount', 'clearFiltersBtn'];
    
    for (const key of required) {
        if (!elements[key]) {
            console.error(`Required element ${key} not found`);
            return false;
        }
    }
    return true;
}

function updateStatistics(policies, elements) {
    // Total count
    if (elements.totalCount) {
        elements.totalCount.textContent = policies.length;
    }
    
    // Harassment-related policies
    if (elements.harassmentCount) {
        const harassmentCount = policies.filter(p => 
            p.category?.includes('sexual_harassment') || 
            p.title?.toLowerCase().includes('harassment') ||
            p.keywords?.some(k => k.toLowerCase().includes('harassment'))
        ).length;
        elements.harassmentCount.textContent = harassmentCount;
    }
    
    // Academic policies (POL- prefix without RA)
    if (elements.academicCount) {
        const academicCount = policies.filter(p => 
            p.policy_id?.startsWith('POL-') && !p.policy_id?.includes('RA')
        ).length;
        elements.academicCount.textContent = academicCount;
    }
    
    // Penalties
    if (elements.penaltiesCount) {
        const penaltiesCount = policies.filter(p => 
            p.category === 'penalties' || 
            p.title?.toLowerCase().includes('penalt') ||
            p.keywords?.some(k => k.toLowerCase().includes('penalt'))
        ).length;
        elements.penaltiesCount.textContent = penaltiesCount;
    }
}

function filterPolicies(policies, elements) {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const category = elements.categoryFilter.value;
    const legalBasis = elements.legalBasisFilter.value;
    
    return policies.filter(policy => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            policy.title?.toLowerCase().includes(searchTerm) ||
            policy.policy_id?.toLowerCase().includes(searchTerm) ||
            policy.content?.toLowerCase().includes(searchTerm) ||
            policy.section?.toLowerCase().includes(searchTerm) ||
            policy.keywords?.some(k => k.toLowerCase().includes(searchTerm));
        
        // Category filter
        const matchesCategory = category === 'all' || policy.category === category;
        
        // Legal basis filter - improved logic
        let matchesLegal = legalBasis === 'all';
        
        if (!matchesLegal) {
            // Check if policy has legal_basis field
            if (policy.legal_basis) {
                matchesLegal = policy.legal_basis === legalBasis;
            } else {
                // Derive legal basis from source or policy_id
                if (legalBasis === 'RA 11313' && (policy.source?.includes('RA 11313') || policy.source?.includes('Safe Spaces'))) {
                    matchesLegal = true;
                } else if (legalBasis === 'RA 7877' && (policy.source?.includes('RA 7877') || policy.source?.includes('Anti-Sexual Harassment'))) {
                    matchesLegal = true;
                } else if (legalBasis === 'RA 9262' && (policy.source?.includes('RA 9262') || policy.source?.includes('VAWC'))) {
                    matchesLegal = true;
                } else if (legalBasis === 'CSC' && policy.source?.includes('CSC')) {
                    matchesLegal = true;
                } else if (legalBasis === '2017 RACCS' && policy.source?.includes('RACCS')) {
                    matchesLegal = true;
                } else if (legalBasis === 'DOLE' && policy.source?.includes('DOLE')) {
                    matchesLegal = true;
                }
            }
        }
        
        return matchesSearch && matchesCategory && matchesLegal;
    });
}

function filterAndRender(policies, elements) {
    filteredPolicies = filterPolicies(policies, elements);
    
    // Calculate total pages
    totalPages = Math.ceil(filteredPolicies.length / ITEMS_PER_PAGE) || 1;
    
    // Ensure current page is valid
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    // Update visible count
    elements.visibleCount.textContent = filteredPolicies.length;
    
    // Render current page
    renderCurrentPage(elements);
}

function renderCurrentPage(elements) {
    // Calculate slice indices
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPolicies.length);
    const pagePolicies = filteredPolicies.slice(startIndex, endIndex);
    
    // Show/hide no results
    if (filteredPolicies.length === 0) {
        elements.policyList.innerHTML = '';
        elements.noResults.classList.remove('hidden');
        if (elements.paginationContainer) {
            elements.paginationContainer.classList.add('hidden');
        }
        return;
    }
    
    elements.noResults.classList.add('hidden');
    
    // Build HTML for current page
    elements.policyList.innerHTML = pagePolicies.map(policy => createPolicyCard(policy)).join('');
    
    // Update pagination UI
    updatePaginationUI(elements);
}

function updatePaginationUI(elements) {
    if (!elements.paginationContainer || !elements.prevPageBtn || !elements.nextPageBtn || !elements.pageInfo) {
        return;
    }
    
    // Hide pagination if only one page
    if (totalPages <= 1) {
        elements.paginationContainer.classList.add('hidden');
        return;
    }
    
    elements.paginationContainer.classList.remove('hidden');
    
    // Update page info
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Update button states
    elements.prevPageBtn.disabled = currentPage === 1;
    elements.prevPageBtn.classList.toggle('opacity-50', currentPage === 1);
    elements.prevPageBtn.classList.toggle('cursor-not-allowed', currentPage === 1);
    
    elements.nextPageBtn.disabled = currentPage === totalPages;
    elements.nextPageBtn.classList.toggle('opacity-50', currentPage === totalPages);
    elements.nextPageBtn.classList.toggle('cursor-not-allowed', currentPage === totalPages);
}

function clearFilters(elements) {
    elements.searchInput.value = '';
    elements.categoryFilter.value = 'all';
    elements.legalBasisFilter.value = 'all';
}

function createPolicyCard(policy) {
    const legalBadge = policy.legal_basis ? 
        `<span class="bg-[#EDE4E4] text-[#4B4B4B] px-2 py-0.5 rounded text-xs">${policy.legal_basis}</span>` : '';
    
    const severityBadge = policy.severity_level ? 
        `<span class="severity-badge ml-2">${formatSeverity(policy.severity_level)}</span>` : '';
    
    const keywords = policy.keywords?.slice(0, 5).map(k => 
        `<span class="bg-[#F5F0F0] px-2 py-1 rounded-full text-[#6F5E5E]">${escapeHtml(k)}</span>`
    ).join('') || '';
    
    const keywordRemainder = policy.keywords?.length > 5 ? 
        `<span class="text-[#8A7A7A]">+${policy.keywords.length - 5} more</span>` : '';
    
    const appliesTo = policy.applicable_to?.length ? 
        `<div class="mt-3 text-xs text-[#8A7A7A] border-t border-[#EDE4E4] pt-2">
            <i class="fas fa-users mr-1"></i> Applies to: ${escapeHtml(policy.applicable_to.join(', '))}
        </div>` : '';
    
    const section = policy.section ? 
        `<div class="text-xs text-[#8A7A7A] mb-2">${escapeHtml(policy.section)}</div>` : '';
    
    return `
        <div class="policy-card bg-white rounded-lg p-5">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-mono text-[#8A7A7A]">${escapeHtml(policy.policy_id)}</span>
                    <span class="category-badge">${formatCategory(policy.category)}</span>
                    ${legalBadge}
                    ${severityBadge}
                </div>
            </div>
            <h3 class="font-semibold text-lg text-[#2A2424] mb-1">${escapeHtml(policy.title)}</h3>
            ${section}
            <p class="text-sm text-[#4F4444] mb-3 leading-relaxed">${escapeHtml(policy.content)}</p>
            <div class="flex flex-wrap gap-2 text-xs">
                ${keywords}
                ${keywordRemainder}
            </div>
            ${appliesTo}
        </div>
    `;
}

function formatCategory(cat) {
    if (!cat) return 'General';
    return cat.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatSeverity(severity) {
    if (!severity) return '';
    return severity.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Options
function populateFilters(policies) {
    // Get unique categories from policies
    const categories = new Set();
    const legalBasis = new Set();
    
    policies.forEach(policy => {
        // Add category if it exists
        if (policy.category) {
            categories.add(policy.category);
        }
        
        // Add legal basis if it exists
        if (policy.legal_basis) {
            legalBasis.add(policy.legal_basis);
        } else if (policy.source) {
            // If no legal_basis, derive from source or policy_id
            if (policy.source.includes('RA 11313') || policy.source.includes('Safe Spaces')) {
                legalBasis.add('RA 11313');
            } else if (policy.source.includes('RA 7877') || policy.source.includes('Anti-Sexual Harassment')) {
                legalBasis.add('RA 7877');
            } else if (policy.source.includes('RA 9262') || policy.source.includes('VAWC')) {
                legalBasis.add('RA 9262');
            } else if (policy.source.includes('CSC')) {
                legalBasis.add('CSC');
            } else if (policy.source.includes('RACCS')) {
                legalBasis.add('2017 RACCS');
            } else if (policy.source.includes('DOLE')) {
                legalBasis.add('DOLE');
            }
        }
    });
    
    // Get the select elements
    const categorySelect = document.getElementById('categoryFilter');
    const legalBasisSelect = document.getElementById('legalBasisFilter');
    
    if (!categorySelect || !legalBasisSelect) return;
    
    // Clear existing options (keep the "All categories" option)
    categorySelect.innerHTML = '<option value="all">All categories</option>';
    legalBasisSelect.innerHTML = '<option value="all">All laws</option>';
    
    // Sort categories alphabetically
    const sortedCategories = Array.from(categories).sort();
    const sortedLegalBasis = Array.from(legalBasis).sort();
    
    // Add category options
    sortedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = formatCategoryForDisplay(category);
        categorySelect.appendChild(option);
    });
    
    // Add legal basis options
    sortedLegalBasis.forEach(basis => {
        const option = document.createElement('option');
        option.value = basis;
        
        // Format display text
        let displayText = basis;
        if (basis === 'RA 11313') displayText = 'RA 11313 (Safe Spaces Act)';
        else if (basis === 'RA 7877') displayText = 'RA 7877 (Anti-Sexual Harassment)';
        else if (basis === 'RA 9262') displayText = 'RA 9262 (VAWC)';
        else if (basis === 'CSC') displayText = 'CSC Rules';
        else if (basis === '2017 RACCS') displayText = '2017 RACCS';
        else if (basis === 'DOLE') displayText = 'DOLE';
        else displayText = basis;
        
        option.textContent = displayText;
        legalBasisSelect.appendChild(option);
    });
}

function formatCategoryForDisplay(category) {
    // Convert category names to readable format
    const categoryMap = {
        'sexual_harassment_classification': 'Sexual Harassment Classification',
        'administrative_penalties': 'Administrative Penalties',
        'student_discipline': 'Student Discipline',
        'general_provisions': 'General Provisions',
        'definitions': 'Definitions',
        'safe_spaces_act': 'Safe Spaces Act',
        'employer_duties': 'Employer Duties',
        'safe_spaces_act_penalties': 'SSA Penalties',
        'anti_sexual_harassment_act': 'Anti-Sexual Harassment Act',
        'anti_sexual_harassment_act_penalties': 'ASH Penalties',
        'civil_service_harassment': 'Civil Service Harassment',
        'vawc_act': 'VAWC Act',
        'vawc_act_penalties': 'VAWC Penalties',
        'rac_civil_service': 'RACCS Civil Service'
    };
    
    if (categoryMap[category]) {
        return categoryMap[category];
    }
    
    // Fallback: convert snake_case to Title Case
    return category.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
