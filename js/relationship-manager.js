// relationship-manager.js
(function() {
    'use strict';

    // Relationship options for Student victims
    const STUDENT_OPTIONS = [
        { value: "classmate", text: "Classmate" },
        { value: "orgmate", text: "Organization Mate" },
        { value: "student_to_faculty", text: "Student to faculty/staff" },   // new
        { value: "stranger", text: "Stranger" },
        { value: "intimate", text: "Within intimate, dating, marital, family relationship, or former intimate relationship" },
        { value: "authority", text: "With authority, influence, or moral ascendancy over victim" }
    ];

    // Relationship options for Non-Student victims
    const NON_STUDENT_OPTIONS = [
        { value: "same-level", text: "Same level / Colleague" },
        { value: "staff_to_supervisor", text: "Staff to immediate supervisor/boss" },   // new
        { value: "authority", text: "With authority, influence, or moral ascendancy over victim" },
        { value: "intimate", text: "Within intimate, dating, marital, family relationship, or former intimate relationship" },
        { value: "none", text: "No specific relationship" },
        { value: "stranger", text: "Stranger" }
    ];

    // Complained classification options based on victim type
    const COMPLAINED_OPTIONS = {
        student: [
            { value: "Student", text: "Student" },
            { value: "Professor", text: "Professor" },
            { value: "Instructor", text: "Instructor" },
            { value: "Teacher", text: "Teacher" },
            { value: "Gov't Employee", text: "Gov't Employee" },
            { value: "Stranger", text: "Stranger" }
        ],
        nonStudent: [
            { value: "Co-worker", text: "Co-worker" },
            { value: "Colleague", text: "Colleague" },
            { value: "Gov't Employee", text: "Gov't Employee" },
            { value: "Student", text: "Student" },
            { value: "Stranger", text: "Stranger" }
        ]
    };

    // Cache DOM elements
    let victimSelect = null;
    let relationshipSelect = null;
    let perpSelect = null;

    /**
     * Update relationship dropdown options based on victim classification
     */
    function updateRelationshipOptions() {
        if (!victimSelect || !relationshipSelect) return;

        const selectedVictim = victimSelect.value;
        
        // Clear current options
        relationshipSelect.innerHTML = '';
        
        // Determine which options to use
        let optionsToUse = [];
        
        if (selectedVictim === 'Student') {
            optionsToUse = STUDENT_OPTIONS;
        } else if (selectedVictim && selectedVictim !== '') {
            optionsToUse = NON_STUDENT_OPTIONS;
        } else {
            // No selection yet - add placeholder only
            const placeholder = document.createElement('option');
            placeholder.value = "";
            placeholder.textContent = "— Select relationship —";
            placeholder.disabled = true;
            placeholder.selected = true;
            relationshipSelect.appendChild(placeholder);
            return;
        }
        
        // Add placeholder option
        const placeholderOpt = document.createElement('option');
        placeholderOpt.value = "";
        placeholderOpt.textContent = "— Select relationship —";
        placeholderOpt.disabled = true;
        placeholderOpt.selected = true;
        relationshipSelect.appendChild(placeholderOpt);
        
        // Add the dynamic options
        optionsToUse.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            relationshipSelect.appendChild(option);
        });
        
        // Dispatch event for law mapper to know relationship options updated
        const event = new CustomEvent('relationshipOptionsUpdated', { 
            detail: { victimType: selectedVictim, optionsCount: optionsToUse.length }
        });
        document.dispatchEvent(event);
    }

    /**
     * Update complained classification dropdown based on victim classification
     */
    function updateComplainedOptions() {
        if (!victimSelect || !perpSelect) return;

        const selectedVictim = victimSelect.value;
        
        // Clear current options
        perpSelect.innerHTML = '';
        
        // Determine which options to use
        let optionsToUse = [];
        
        if (selectedVictim === 'Student') {
            optionsToUse = COMPLAINED_OPTIONS.student;
        } else if (selectedVictim && selectedVictim !== '') {
            optionsToUse = COMPLAINED_OPTIONS.nonStudent;
        } else {
            // No selection yet - add placeholder only
            const placeholder = document.createElement('option');
            placeholder.value = "";
            placeholder.textContent = "— Select category —";
            placeholder.disabled = true;
            placeholder.selected = true;
            perpSelect.appendChild(placeholder);
            return;
        }
        
        // Add placeholder option
        const placeholderOpt = document.createElement('option');
        placeholderOpt.value = "";
        placeholderOpt.textContent = "— Select category —";
        placeholderOpt.disabled = true;
        placeholderOpt.selected = true;
        perpSelect.appendChild(placeholderOpt);
        
        // Add the dynamic options
        optionsToUse.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            perpSelect.appendChild(option);
        });
        
        // Dispatch event for law mapper
        const event = new CustomEvent('complainedOptionsUpdated', { 
            detail: { victimType: selectedVictim, optionsCount: optionsToUse.length }
        });
        document.dispatchEvent(event);
    }

    /**
     * Reset relationship dropdown to initial placeholder state
     */
    function resetRelationshipDropdown() {
        if (!relationshipSelect) return;
        
        relationshipSelect.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.textContent = "— Select relationship —";
        placeholder.disabled = true;
        placeholder.selected = true;
        relationshipSelect.appendChild(placeholder);
    }

    /**
     * Reset complained dropdown to initial placeholder state
     */
    function resetComplainedDropdown() {
        if (!perpSelect) return;
        
        perpSelect.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = "";
        placeholder.textContent = "— Select category —";
        placeholder.disabled = true;
        placeholder.selected = true;
        perpSelect.appendChild(placeholder);
    }

    /**
     * Get current relationship value
     * @returns {string} Selected relationship value or empty string
     */
    function getCurrentRelationship() {
        return relationshipSelect ? relationshipSelect.value : '';
    }

    /**
     * Get current victim classification
     * @returns {string} Selected victim classification or empty string
     */
    function getCurrentVictimClass() {
        return victimSelect ? victimSelect.value : '';
    }

    /**
     * Get current complained classification
     * @returns {string} Selected complained classification or empty string
     */
    function getCurrentComplainedClass() {
        return perpSelect ? perpSelect.value : '';
    }

    /**
     * Initialize relationship manager
     */
    function init() {
        victimSelect = document.getElementById('victimClass');
        relationshipSelect = document.getElementById('relationship');
        perpSelect = document.getElementById('perpClass');
        
        if (!victimSelect || !relationshipSelect || !perpSelect) {
            console.warn('Relationship Manager: Required elements not found');
            return;
        }
        
        // Initialize with placeholders
        resetRelationshipDropdown();
        resetComplainedDropdown();
        
        // Add event listener for victim classification change
        victimSelect.addEventListener('change', function() {
            updateRelationshipOptions();
            updateComplainedOptions();
        });
        
        // Also update when victim classification is set programmatically
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                    updateRelationshipOptions();
                    updateComplainedOptions();
                }
            });
        });
        observer.observe(victimSelect, { attributes: true });
        
        console.log('Relationship Manager initialized');
    }

    // Export public methods
    window.RelationshipManager = {
        init: init,
        getCurrentRelationship: getCurrentRelationship,
        getCurrentVictimClass: getCurrentVictimClass,
        getCurrentComplainedClass: getCurrentComplainedClass,
        resetDropdowns: function() {
            resetRelationshipDropdown();
            resetComplainedDropdown();
        },
        updateOptions: function() {
            updateRelationshipOptions();
            updateComplainedOptions();
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();