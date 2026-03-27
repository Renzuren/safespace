// law-mapper.js
(function() {
    'use strict';

    // Mapping ng law names sa kanilang corresponding policy arrays
    const lawToPolicyMapping = {
        'Anti Sexual Harassment Code': antiSexualHarassmentCode || [],
        'OASH Code for Students': antiSexualHarassmentCode || [],
        'OASH Code for Employees': antiSexualHarassmentCode || [],
        'RA 11313 (Safe Spaces Act)': irrRA11313 || [],
        'RA 7877 (Anti-Sexual Harassment Act)': ra7877 || [],
        'RA 9262 (VAWC) - If victim is a woman/child': ra9262 || [],
        'RACCS (RA 9710)': raccs || []
    };

    function determineApplicableLaws(data) {
        const {
            victimClassification,
            complainedClassification,
            victimConstituent,
            complainedConstituent,
            relationshipType
        } = data;
        
        let applicableLaws = [];
        
        // Check if victim is Student
        if (victimClassification === 'Student') {
            const validComplainedForStudent = [
                'Student', 'Professor', 'Instructor', 'Teacher', 
                "Gov't Employee", 'Stranger', 'Co-worker', 'Colleague'
            ];
            
            if (validComplainedForStudent.includes(complainedClassification)) {
                if (complainedConstituent === 'Yes') {
                    // Perpetrator is UP Constituent
                    if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Students'];
                    } else if (relationshipType === 'intimate') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'OASH Code for Students'];
                    } else if (relationshipType === 'authority') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'OASH Code for Employees'];
                    } else if (relationshipType === 'stranger') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Students'];
                    } else if (relationshipType === 'same-level') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Employees'];
                    } else if (relationshipType === 'none') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Students'];
                    }
                } else if (complainedConstituent === 'No') {
                    // Perpetrator is NOT UP Constituent - pero may laws pa rin!
                    if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'External Assistance - Contact Student Services Office (SSO)'];
                    } else if (relationshipType === 'intimate') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'External Assistance - Contact SSO'];
                    } else if (relationshipType === 'authority') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'External Assistance - Contact SSO'];
                    } else if (relationshipType === 'stranger') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'External Assistance - File complaint with local authorities'];
                    } else if (relationshipType === 'same-level') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'External Assistance - Contact SSO'];
                    } else if (relationshipType === 'none') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'External Assistance - Contact SSO'];
                    }
                }
            } else {
                applicableLaws = ['Please select a valid complained classification'];
            }
        } 
        // Non-student victims
        else {
            const validComplainedForNonStudent = [
                'Co-worker', 'Colleague', "Gov't Employee", 
                'Student', 'Stranger', 'Professor', 'Instructor', 'Teacher'
            ];
            
            if (validComplainedForNonStudent.includes(complainedClassification)) {
                if (complainedConstituent === 'Yes') {
                    // Perpetrator is UP Constituent
                    if (relationshipType === 'same-level') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'OASH Code for Employees'];
                    } else if (relationshipType === 'authority') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'OASH Code for Employees'];
                    } else if (relationshipType === 'intimate') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'RACCS (RA 9710)', 'OASH Code for Employees'];
                    } else if (relationshipType === 'none') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Employees'];
                    } else if (relationshipType === 'stranger') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Employees'];
                    } else if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Students'];
                    }
                } else if (complainedConstituent === 'No') {
                    // Perpetrator is NOT UP Constituent - pero may laws pa rin!
                    if (relationshipType === 'same-level') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'External Assistance - Contact appropriate government agency'];
                    } else if (relationshipType === 'authority') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'External Assistance - Contact appropriate government agency'];
                    } else if (relationshipType === 'intimate') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'RACCS (RA 9710)', 'External Assistance - Contact appropriate government agency'];
                    } else if (relationshipType === 'none') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'External Assistance - Contact appropriate government agency'];
                    } else if (relationshipType === 'stranger') {
                        applicableLaws = ['RA 11313 (Safe Spaces Act)', 'External Assistance - File complaint with local authorities (PNP/City Hall)'];
                    }
                }
            } else {
                applicableLaws = ['Please select a valid complained classification'];
            }
        }
        
        // Remove duplicates
        applicableLaws = [...new Set(applicableLaws)];
        
        // Separate external assistance from actual laws
        const actualLaws = applicableLaws.filter(law => !law.includes('External Assistance'));
        const externalAssistance = applicableLaws.filter(law => law.includes('External Assistance'));
        
        return { 
            applicableLaws: actualLaws,
            externalAssistance: externalAssistance
        };
    }

    // Helper function to get relevant policies from the law arrays
    function getPoliciesForLaws(lawNames) {
        let allPolicies = [];
        
        lawNames.forEach(lawName => {
            let policyArray = null;
            let displayName = lawName;
            
            // Determine which policy array to use
            if (lawName.includes('OASH Code for Students')) {
                policyArray = antiSexualHarassmentCode;
                // Filter for student-specific policies
                if (policyArray) {
                    const studentPolicies = policyArray.filter(p => 
                        p.applicable_to && p.applicable_to.includes('students')
                    );
                    allPolicies.push(...studentPolicies.map(p => ({ ...p, law_display_name: lawName })));
                }
            } 
            else if (lawName.includes('OASH Code for Employees')) {
                policyArray = antiSexualHarassmentCode;
                // Filter for employee-specific policies
                if (policyArray) {
                    const employeePolicies = policyArray.filter(p => 
                        p.applicable_to && p.applicable_to.includes('employees')
                    );
                    allPolicies.push(...employeePolicies.map(p => ({ ...p, law_display_name: lawName })));
                }
            }
            else if (lawName.includes('RA 11313') || lawName.includes('Safe Spaces Act')) {
                policyArray = irrRA11313;
                if (policyArray) {
                    allPolicies.push(...policyArray.map(p => ({ ...p, law_display_name: lawName })));
                }
            }
            else if (lawName.includes('RA 7877')) {
                policyArray = ra7877;
                if (policyArray) {
                    allPolicies.push(...policyArray.map(p => ({ ...p, law_display_name: lawName })));
                }
            }
            else if (lawName.includes('RA 9262') || lawName.includes('VAWC')) {
                policyArray = ra9262;
                if (policyArray) {
                    allPolicies.push(...policyArray.map(p => ({ ...p, law_display_name: lawName })));
                }
            }
            else if (lawName.includes('RACCS')) {
                policyArray = raccs;
                if (policyArray) {
                    allPolicies.push(...policyArray.map(p => ({ ...p, law_display_name: lawName })));
                }
            }
        });
        
        // Remove duplicates by policy_id
        const uniquePolicies = [];
        const seenIds = new Set();
        for (const policy of allPolicies) {
            if (!seenIds.has(policy.policy_id)) {
                seenIds.add(policy.policy_id);
                uniquePolicies.push(policy);
            }
        }
        
        return uniquePolicies;
    }

    // Display laws with tabbed interface
    function displayApplicableLaws(applicableLaws, externalAssistance) {
        const lawsContainer = document.getElementById('applicableLawsContainer');
        
        if (!lawsContainer) return;
        
        if (applicableLaws && applicableLaws.length > 0 && applicableLaws[0] !== 'Please select a valid complained classification') {
            // Get actual policy details
            const policyDetails = getPoliciesForLaws(applicableLaws);
            
            // Group policies by law name
            const groupedPolicies = {};
            policyDetails.forEach(policy => {
                const lawName = policy.law_display_name;
                if (!groupedPolicies[lawName]) {
                    groupedPolicies[lawName] = [];
                }
                groupedPolicies[lawName].push(policy);
            });
            
            const lawNames = Object.keys(groupedPolicies);
            
            // Create tabs HTML
            let tabsHtml = `
                <div class="flex items-start gap-3">
                    <i class="fas fa-gavel text-up text-xl mt-1"></i>
                    <div class="flex-1">
                        <h4 class="font-semibold text-up-dark mb-3">Applicable Laws & Policies</h4>
                        
                        <!-- Tab Headers -->
                        <div class="border-b border-gray-200 mb-4">
                            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="lawTabs" role="tablist">
            `;
            
            lawNames.forEach((lawName, index) => {
                const isActive = index === 0;
                const icon = getLawIcon(lawName);
                tabsHtml += `
                    <li class="mr-2" role="presentation">
                        <button class="inline-block p-3 rounded-t-lg border-b-2 ${isActive ? 'border-up text-up' : 'border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-500'}" 
                                id="tab-${index}" 
                                data-tab-target="tabpanel-${index}"
                                type="button" 
                                role="tab" 
                                aria-controls="tabpanel-${index}" 
                                aria-selected="${isActive}">
                            <i class="${icon} mr-2"></i>${lawName}
                            <span class="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">${groupedPolicies[lawName].length}</span>
                        </button>
                    </li>
                `;
            });
            
            // Add External Assistance tab if exists
            if (externalAssistance && externalAssistance.length > 0) {
                tabsHtml += `
                    <li class="mr-2" role="presentation">
                        <button class="inline-block p-3 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 text-gray-500" 
                                id="tab-external" 
                                data-tab-target="tabpanel-external"
                                type="button" 
                                role="tab" 
                                aria-controls="tabpanel-external" 
                                aria-selected="false">
                            <i class="fas fa-hand-holding-heart mr-2"></i>External Assistance
                            <span class="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">${externalAssistance.length}</span>
                        </button>
                    </li>
                `;
            }
            
            tabsHtml += `
                            </ul>
                        </div>
                        
                        <!-- Tab Panels -->
                        <div class="tab-content">
            `;
            
            // Policy tabs
            lawNames.forEach((lawName, index) => {
                const isActive = index === 0;
                const policies = groupedPolicies[lawName];
                
                tabsHtml += `
                    <div id="tabpanel-${index}" 
                         role="tabpanel" 
                         aria-labelledby="tab-${index}" 
                         class="${isActive ? '' : 'hidden'}">
                        <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                `;
                
                policies.forEach(policy => {
                    tabsHtml += `
                        <div class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                <h6 class="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <i class="fas fa-file-alt text-up text-xs"></i>
                                    ${escapeHtml(policy.title)}
                                </h6>
                                <span class="text-xs text-up font-mono bg-up-muted px-2 py-1 rounded">${policy.policy_id}</span>
                            </div>
                            <div class="p-4">
                                ${policy.section ? `
                                    <div class="mb-2">
                                        <span class="text-xs font-semibold text-gray-500 uppercase">Section</span>
                                        <p class="text-xs text-gray-700 mt-1">${escapeHtml(policy.section)}</p>
                                    </div>
                                ` : ''}
                                
                                <div class="mb-2">
                                    <span class="text-xs font-semibold text-gray-500 uppercase">Content</span>
                                    <p class="text-sm text-gray-700 mt-1 leading-relaxed">${escapeHtml(policy.content)}</p>
                                </div>
                                
                                ${policy.punishment ? `
                                    <div class="mt-2 p-2 bg-red-50 rounded border-l-2 border-red-500">
                                        <span class="text-xs font-semibold text-red-700 uppercase flex items-center gap-1">
                                            <i class="fas fa-gavel"></i> Penalty
                                        </span>
                                        <p class="text-xs text-red-600 mt-1">${escapeHtml(policy.punishment)}</p>
                                    </div>
                                ` : ''}
                                
                                ${policy.keywords && policy.keywords.length > 0 ? `
                                    <div class="mt-2 flex flex-wrap gap-1">
                                        ${policy.keywords.slice(0, 5).map(keyword => `
                                            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#${escapeHtml(keyword)}</span>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                
                                ${policy.applicable_to && policy.applicable_to.length > 0 ? `
                                    <div class="mt-2 text-xs text-gray-400">
                                        <i class="fas fa-users mr-1"></i> Applies to: ${policy.applicable_to.join(', ')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                });
                
                tabsHtml += `
                        </div>
                    </div>
                `;
            });
            
            // External Assistance tab
            if (externalAssistance && externalAssistance.length > 0) {
                tabsHtml += `
                    <div id="tabpanel-external" 
                         role="tabpanel" 
                         aria-labelledby="tab-external" 
                         class="hidden">
                        <div class="space-y-3">
                `;
                
                externalAssistance.forEach(assistance => {
                    tabsHtml += `
                        <div class="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <div class="flex items-start gap-3">
                                <i class="fas fa-info-circle text-blue-600 text-xl mt-1"></i>
                                <div class="flex-1">
                                    <h6 class="font-semibold text-blue-800 mb-2">${escapeHtml(assistance)}</h6>
                                    <div class="mt-2 p-3 bg-white rounded-lg">
                                        <p class="text-xs font-medium mb-2">📞 Available Resources:</p>
                                        <ul class="text-xs space-y-1 text-gray-600">
                                            <li>• Email: oash.uplb@up.edu.ph</li>
                                            <li>• UP OASH: +63 49 501 1844</li>
                                            <li>• Location: Mezzanine, Graduate School Bldg., International House Complex, UPLB, Los Baños, Laguna</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                tabsHtml += `
                        </div>
                    </div>
                `;
            }
            
            tabsHtml += `
                        </div>
                        
                        <div class="mt-4 pt-3 border-t border-amber-200 text-xs text-amber-700 flex items-center justify-between">
                            <div>
                                <i class="fas fa-info-circle mr-1"></i> 
                                Note: Laws are mapped based on the provided context. For formal legal advice, please consult the Office of the University Legal Counsel.
                            </div>
                            <button onclick="LawMapper.exportPolicies()" class="text-xs bg-up text-white px-3 py-1 rounded hover:bg-up-light transition-colors">
                                <i class="fas fa-download mr-1"></i> Export
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            lawsContainer.innerHTML = tabsHtml;
            lawsContainer.style.display = 'block';
            
            // Add tab switching functionality
            const tabs = document.querySelectorAll('[data-tab-target]');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetId = tab.getAttribute('data-tab-target');
                    
                    // Remove active class from all tabs
                    document.querySelectorAll('[role="tab"]').forEach(t => {
                        t.classList.remove('border-up', 'text-up');
                        t.classList.add('border-transparent', 'text-gray-500');
                        t.setAttribute('aria-selected', 'false');
                    });
                    
                    // Add active class to clicked tab
                    tab.classList.add('border-up', 'text-up');
                    tab.classList.remove('border-transparent', 'text-gray-500');
                    tab.setAttribute('aria-selected', 'true');
                    
                    // Hide all tab panels
                    document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
                        panel.classList.add('hidden');
                    });
                    
                    // Show selected tab panel
                    const targetPanel = document.getElementById(targetId);
                    if (targetPanel) {
                        targetPanel.classList.remove('hidden');
                    }
                });
            });
            
        } else if (applicableLaws && applicableLaws[0] === 'Please select a valid complained classification') {
            lawsContainer.innerHTML = `
                <div class="flex items-start gap-3">
                    <i class="fas fa-exclamation-triangle text-amber-600 text-xl mt-1"></i>
                    <div class="flex-1">
                        <h4 class="font-semibold text-amber-800 mb-2">⚠️ Incomplete Information</h4>
                        <p class="text-sm text-amber-700">Please ensure all fields are filled out correctly for accurate legal mapping.</p>
                    </div>
                </div>
            `;
            lawsContainer.style.display = 'block';
        }
    }

    function getLawIcon(lawName) {
        if (lawName.includes('Safe Spaces Act')) return 'fas fa-street-view';
        if (lawName.includes('RA 7877')) return 'fas fa-briefcase';
        if (lawName.includes('RA 9262') || lawName.includes('VAWC')) return 'fas fa-heart';
        if (lawName.includes('RACCS')) return 'fas fa-building';
        if (lawName.includes('OASH Code')) return 'fas fa-gavel';
        return 'fas fa-book';
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function exportPolicies() {
        const resultPanel = document.getElementById('resultPanel');
        if (!resultPanel || resultPanel.classList.contains('hidden')) return;
        
        const lawSections = document.querySelectorAll('[role="tabpanel"]');
        let exportText = 'UPLB OASH - Applicable Laws Report\n';
        exportText += '='.repeat(50) + '\n';
        exportText += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        lawSections.forEach((section, index) => {
            const tabButton = document.querySelector(`[data-tab-target="tabpanel-${index}"]`);
            if (tabButton) {
                const lawName = tabButton.textContent.replace(/[0-9]/g, '').trim();
                exportText += `📚 ${lawName}\n`;
                exportText += '-'.repeat(40) + '\n';
                
                const policies = section.querySelectorAll('.bg-white.rounded-lg');
                policies.forEach(policy => {
                    const title = policy.querySelector('h6')?.textContent || '';
                    const content = policy.querySelector('.text-gray-700')?.textContent || '';
                    const penalty = policy.querySelector('.bg-red-50 .text-red-600')?.textContent || '';
                    
                    exportText += `\n▪ ${title}\n`;
                    exportText += `  ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}\n`;
                    if (penalty) {
                        exportText += `  Penalty: ${penalty}\n`;
                    }
                    exportText += '\n';
                });
                exportText += '\n';
            }
        });
        
        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uplb-oash-report-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Helper function to get form data
    function getFormData() {
        const victimClass = document.getElementById('victimClass')?.value || '';
        const perpClass = document.getElementById('perpClass')?.value || '';
        const victimUP = document.querySelector('input[name="victimUP"]:checked')?.value || '';
        const perpUP = document.querySelector('input[name="perpUP"]:checked')?.value || '';
        const relationship = document.getElementById('relationship')?.value || '';
        
        return {
            victimClassification: victimClass,
            complainedClassification: perpClass,
            victimConstituent: victimUP,
            complainedConstituent: perpUP,
            relationshipType: relationship
        };
    }

    // Main function to analyze and display laws
    function analyzeAndDisplayLaws() {
        const formData = getFormData();
        
        if (!formData.victimClassification || !formData.complainedClassification || 
            !formData.victimConstituent || !formData.complainedConstituent || 
            !formData.relationshipType) {
            displayApplicableLaws(['Please complete all legal context fields'], []);
            return;
        }
        
        const result = determineApplicableLaws(formData);
        displayApplicableLaws(result.applicableLaws, result.externalAssistance);
        
        return result;
    }

    // Export public methods
    window.LawMapper = {
        determineApplicableLaws: determineApplicableLaws,
        displayApplicableLaws: displayApplicableLaws,
        getFormData: getFormData,
        analyzeAndDisplayLaws: analyzeAndDisplayLaws,
        exportPolicies: exportPolicies
    };
})();

// // law-mapper.js
// (function() {
//     'use strict';

//     function determineApplicableLaws(data) {
//         const {
//             victimClassification,
//             complainedClassification,
//             victimConstituent,
//             complainedConstituent,
//             relationshipType
//         } = data;
        
//         let applicableLaws = [];
        
//         // Check if victim is Student
//         if (victimClassification === 'Student') {
//             // Valid complained classifications for student victims
//             const validComplainedForStudent = [
//                 'Student', 'Professor', 'Instructor', 'Teacher', 
//                 "Gov't Employee", 'Stranger', 'Co-worker', 'Colleague'
//             ];
            
//             if (validComplainedForStudent.includes(complainedClassification)) {
//                 if (complainedConstituent === 'Yes') {
//                     // Perpetrator is UP Constituent
//                     if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Students'];
//                     } else if (relationshipType === 'intimate') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'OASH Code for Students'];
//                     } else if (relationshipType === 'authority') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'OASH Code for Employees'];
//                     } else if (relationshipType === 'stranger') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'If UP student: OASH Code for Students', 'If UP employee: OASH Code for Employees'];
//                     } else if (relationshipType === 'same-level') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Employees'];
//                     } else if (relationshipType === 'none') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Students'];
//                     }
//                 } else if (complainedConstituent === 'No') {
//                     // Perpetrator is NOT UP Constituent
//                     if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'Contact Student Services Office (SSO) for external assistance'];
//                     } else if (relationshipType === 'intimate') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'Contact SSO for external assistance'];
//                     } else if (relationshipType === 'authority') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'Contact SSO for external assistance'];
//                     } else if (relationshipType === 'stranger') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'Contact SSO or file complaint with local authorities'];
//                     } else if (relationshipType === 'same-level') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'Contact SSO for external assistance'];
//                     } else if (relationshipType === 'none') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'Contact SSO for external assistance'];
//                     }
//                 }
//             } else {
//                 applicableLaws = ['Please select a valid complained classification'];
//             }
//         } 
//         // Non-student victims
//         else {
//             // Valid complained classifications for non-student victims
//             const validComplainedForNonStudent = [
//                 'Co-worker', 'Colleague', "Gov't Employee", 
//                 'Student', 'Stranger', 'Professor', 'Instructor', 'Teacher'
//             ];
            
//             if (validComplainedForNonStudent.includes(complainedClassification)) {
//                 if (complainedConstituent === 'Yes') {
//                     // Perpetrator is UP Constituent
//                     if (relationshipType === 'same-level') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'OASH Code for Employees'];
//                     } else if (relationshipType === 'authority') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'OASH Code for Employees'];
//                     } else if (relationshipType === 'intimate') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'RACCS (RA 9710)', 'OASH Code for Employees'];
//                     } else if (relationshipType === 'none') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Employees'];
//                     } else if (relationshipType === 'stranger') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'If UP employee: OASH Code for Employees', 'If UP student: OASH Code for Students'];
//                     } else if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'OASH Code for Students'];
//                     }
//                 } else if (complainedConstituent === 'No') {
//                     // Perpetrator is NOT UP Constituent
//                     if (relationshipType === 'same-level') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'Contact appropriate government agency'];
//                     } else if (relationshipType === 'authority') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RACCS (RA 9710)', 'RA 7877 (Anti-Sexual Harassment Act)', 'Contact appropriate government agency'];
//                     } else if (relationshipType === 'intimate') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'RA 9262 (VAWC) - If victim is a woman/child', 'RACCS (RA 9710)', 'Contact appropriate government agency'];
//                     } else if (relationshipType === 'none') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'Contact appropriate government agency'];
//                     } else if (relationshipType === 'stranger') {
//                         applicableLaws = ['RA 11313 (Safe Spaces Act)', 'File complaint with local authorities (PNP/City Hall)'];
//                     }
//                 }
//             } else {
//                 applicableLaws = ['Please select a valid complained classification'];
//             }
//         }
        
//         // Remove duplicates
//         applicableLaws = [...new Set(applicableLaws)];
        
//         return { applicableLaws };
//     }

//     // Helper function to open law search in new window
//     function openLawSearch(lawName) {
//         const searchQuery = encodeURIComponent(lawName);
//         window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
//     }

//     function displayApplicableLaws(applicableLaws) {
//         const lawsContainer = document.getElementById('applicableLawsContainer');
        
//         if (!lawsContainer) return;
        
//         if (applicableLaws && applicableLaws.length > 0 && applicableLaws[0] !== 'Please select a valid complained classification') {
//             lawsContainer.innerHTML = `
//                 <div class="flex items-start gap-3">
//                     <i class="fas fa-gavel text-up text-xl mt-1"></i>
//                     <div class="flex-1">
//                         <h4 class="font-semibold text-up-dark mb-3">Applicable Laws & Policies</h4>
//                         <div class="space-y-2">
//                             <ul class="list-disc list-inside text-sm text-gray-700 space-y-1.5">
//                                 ${applicableLaws.map(law => `<li class="law-badge cursor-pointer text-blue-600 hover:text-blue-800 hover:underline" onclick="LawMapper.openLawSearch('${law.replace(/'/g, "\\'")}')">${law}</li>, `).join('')}
//                             </ul>
//                         </div>
//                         <div class="mt-4 pt-3 border-t border-amber-200 text-xs text-amber-700">
//                             <i class="fas fa-info-circle mr-1"></i> 
//                             Note: Laws are mapped based on the provided context. For formal legal advice, please consult the Office of the University Legal Counsel.
//                         </div>
//                     </div>
//                 </div>
//             `;
//             lawsContainer.classList.remove('hidden');
//             lawsContainer.style.display = 'block';
//         } else if (applicableLaws && applicableLaws[0] === 'Please select a valid complained classification') {
//             lawsContainer.innerHTML = `
//                 <div class="flex items-start gap-3">
//                     <i class="fas fa-exclamation-triangle text-amber-600 text-xl mt-1"></i>
//                     <div class="flex-1">
//                         <h4 class="font-semibold text-amber-800 mb-2">⚠️ Incomplete Information</h4>
//                         <p class="text-sm text-amber-700">Please ensure all fields are filled out correctly for accurate legal mapping.</p>
//                     </div>
//                 </div>
//             `;
//             lawsContainer.style.display = 'block';
//         } else {
//             lawsContainer.innerHTML = `
//                 <div class="flex items-start gap-3">
//                     <i class="fas fa-scale-balanced text-gray-400 text-xl mt-1"></i>
//                     <div class="flex-1">
//                         <p class="text-sm text-gray-500">No applicable laws mapped. Please complete all fields and try again.</p>
//                     </div>
//                 </div>
//             `;
//             lawsContainer.style.display = 'block';
//         }
//     }

//     // Helper function to get form data
//     function getFormData() {
//         const victimClass = document.getElementById('victimClass')?.value || '';
//         const perpClass = document.getElementById('perpClass')?.value || '';
        
//         // Get radio button values
//         const victimUP = document.querySelector('input[name="victimUP"]:checked')?.value || '';
//         const perpUP = document.querySelector('input[name="perpUP"]:checked')?.value || '';
        
//         const relationship = document.getElementById('relationship')?.value || '';
        
//         return {
//             victimClassification: victimClass,
//             complainedClassification: perpClass,
//             victimConstituent: victimUP,
//             complainedConstituent: perpUP,
//             relationshipType: relationship
//         };
//     }

//     // Main function to analyze and display laws
//     function analyzeAndDisplayLaws() {
//         const formData = getFormData();
        
//         // Check if all required fields are filled
//         if (!formData.victimClassification || !formData.complainedClassification || 
//             !formData.victimConstituent || !formData.complainedConstituent || 
//             !formData.relationshipType) {
//             displayApplicableLaws(['Please complete all legal context fields']);
//             return;
//         }
        
//         const result = determineApplicableLaws(formData);
//         displayApplicableLaws(result.applicableLaws);
        
//         return result;
//     }

//     // Export public methods
//     window.LawMapper = {
//         determineApplicableLaws: determineApplicableLaws,
//         displayApplicableLaws: displayApplicableLaws,
//         getFormData: getFormData,
//         analyzeAndDisplayLaws: analyzeAndDisplayLaws,
//         openLawSearch: openLawSearch  // Added this so it can be called from onclick
//     };
// })();