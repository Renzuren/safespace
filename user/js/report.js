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

function getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function updateUserInfo() {
    const token = getAuthToken();
    if (token) {
        document.getElementById('sidebarUserName').textContent = 'User';
        document.getElementById('sidebarUserEmail').textContent = 'user@uplb.edu.ph';
    } else {
        document.getElementById('sidebarUserName').textContent = 'Not logged in';
        document.getElementById('sidebarUserEmail').textContent = 'Please login';
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    toast.success('Logged out', 'You have been successfully logged out.');
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 1500);
}

function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        toast.warning('Authentication required', 'Please log in to file a report.');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
        return false;
    }
    return true;
}

function updateComplainedClassificationOptions() {
    const classification = document.getElementById('classification').value;
    const complainedClassificationSelect = document.getElementById('complainedClassification');
    
    complainedClassificationSelect.innerHTML = '<option value="">Select classification</option>';
    
    let options = [];
    
    if (classification === 'Student') {
        options = [
            { value: "Student", text: "Student" },
            { value: "Professor", text: "Professor" },
            { value: "Instructor", text: "Instructor" },
            { value: "Teacher", text: "Teacher" },
            { value: "Gov't Employee", text: "Gov't Employee" },
            { value: "Stranger", text: "Stranger" }
        ];
    } else if (classification && classification !== '') {
        options = [
            { value: "Co-worker", text: "Co-worker" },
            { value: "Colleague", text: "Colleague" },
            { value: "Gov't Employee", text: "Gov't Employee" },
            { value: "Student", text: "Student" },
            { value: "Stranger", text: "Stranger" }
        ];
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        complainedClassificationSelect.appendChild(optionElement);
    });
}

function updateRelationshipOptions() {
    const classification = document.getElementById('classification').value;
    const relationshipSelect = document.getElementById('relationshipType');
    
    relationshipSelect.innerHTML = '<option value="">Select relationship type</option>';
    
    let options = [];
    
    if (classification === 'Student') {
        options = [
            { value: "classmate", text: "Classmate" },
            { value: "orgmate", text: "Organization Mate" },
            { value: "stranger", text: "Stranger" },
            { value: "intimate", text: "Within intimate, dating, marital, family relationship, or former intimate relationship" },
            { value: "authority", text: "With authority, influence, or moral ascendacy over victim" }
        ];
    } else if (classification && classification !== '') {
        options = [
            { value: "same-level", text: "Same level" },
            { value: "authority", text: "With authority, influence, or moral ascendacy over victim" },
            { value: "intimate", text: "Within intimate, dating, marital, family relationship, or former intimate relationship" },
            { value: "none", text: "None" },
            { value: "stranger", text: "Stranger" }
        ];
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        relationshipSelect.appendChild(optionElement);
    });
}

function collectFormData() {
    const victimConstituentRadio = document.querySelector('input[name="victimConstituent"]:checked');
    const complainedConstituentRadio = document.querySelector('input[name="complainedConstituent"]:checked');
    const insideCampusRadio = document.querySelector('input[name="complainedInsideCampus"]:checked');
    
    return {
        firstName: document.getElementById('firstName').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        age: document.getElementById('age').value,
        biologicalSex: document.getElementById('biologicalSex').value,
        identifiedAs: document.getElementById('identifiedAs').value, 
        civilStatus: document.getElementById('civilStatus').value,
        mobileNumber: document.getElementById('mobileNumber').value.trim(),
        landLineNumber: document.getElementById('landLineNumber').value.trim(),
        presentAddress: document.getElementById('presentAddress').value.trim(),
        permanentAddress: document.getElementById('permanentAddress').value.trim(),
        classification: document.getElementById('classification').value,
        college: document.getElementById('college').value.trim(),
        department: document.getElementById('department').value.trim(),
        victimConstituent: victimConstituentRadio ? victimConstituentRadio.value : '',
        complainedFullName: document.getElementById('complainedFullName').value.trim(),
        complainedSex: document.getElementById('complainedSex').value,
        complainedClassification: document.getElementById('complainedClassification').value,
        complainedCollege: document.getElementById('complainedCollege').value.trim(),
        complainedDepartment: document.getElementById('complainedDepartment').value.trim(),
        complainedConstituent: complainedConstituentRadio ? complainedConstituentRadio.value : '',
        complainedInsideCampus: insideCampusRadio ? insideCampusRadio.value : '',
        relationshipType: document.getElementById('relationshipType').value,
        complainantStory: document.getElementById('complainantStory').value.trim(),
        complainedIncidentHappened: document.getElementById('complainedIncidentHappened').value.trim(),
        complainedPhysicalAppearance: document.getElementById('complainedPhysicalAppearance').value.trim(),
        procedureType: document.getElementById('procedureType').value,
        remarks: document.getElementById('remarks').value.trim(),
        whereDidYouHearAboutUs: document.getElementById('whereDidYouHearAboutUs').value,
        otherWhereDidYouHearAboutUs: document.getElementById('otherWhereDidYouHearAboutUs').value.trim(),
        // New fields for incident date/time
        incidentDate: document.getElementById('incidentDate').value,
        incidentTime: document.getElementById('incidentTime').value
    };
}

function validateForm(data) {
    const required = [
        'firstName', 'middleName', 'lastName', 'age', 'biologicalSex', 'identifiedAs',
        'civilStatus', 'mobileNumber', 'presentAddress', 'permanentAddress',
        'classification', 'college', 'department', 'victimConstituent',
        'complainedFullName', 'complainedSex', 'complainedClassification', 
        'complainedConstituent', 'complainedInsideCampus', 'relationshipType',
        'complainantStory', 'complainedIncidentHappened', 'complainedPhysicalAppearance', 
        'procedureType', 'whereDidYouHearAboutUs'
        // Optional: add 'incidentDate', 'incidentTime' if they are required
    ];
    
    for (let field of required) {
        if (!data[field] || data[field] === '') {
            const fieldNames = {
                firstName: 'First name', middleName: 'Middle name', lastName: 'Last name',
                age: 'Age', biologicalSex: 'Biological sex', identifiedAs: 'Identified as',
                civilStatus: 'Civil status', mobileNumber: 'Mobile number', presentAddress: 'Present address',
                permanentAddress: 'Permanent address', classification: 'Classification', college: 'College',
                department: 'Department', victimConstituent: 'Victim is UP Constituent',
                complainedFullName: 'Complained full name', complainedSex: 'Complained sex',
                complainedClassification: 'Complained classification', complainedConstituent: 'Perpetrator is UP Constituent', 
                complainedInsideCampus: 'Incident happened inside campus', relationshipType: 'Relationship with Respondent',
                complainantStory: 'Complainant story', complainedIncidentHappened: 'Incident happened',
                complainedPhysicalAppearance: 'Physical appearance', procedureType: 'Procedure type', 
                whereDidYouHearAboutUs: 'Where did you hear about us'
            };
            toast.warning('Missing field', `${fieldNames[field] || field} is required`);
            return false;
        }
    }
    
    const confirmAccuracy = document.getElementById('confirmAccuracy').checked;
    const confirmConfidentiality = document.getElementById('confirmConfidentiality').checked;
    
    if (!confirmAccuracy || !confirmConfidentiality) {
        toast.warning('Confirmation required', 'Please confirm the accuracy and confidentiality agreements.');
        return false;
    }
    
    return true;
}

function updateApplicableLaws() {
    const formData = collectFormData();
    
    if (formData.victimConstituent && formData.complainedConstituent && formData.relationshipType && formData.complainedClassification) {
        const { applicableLaws } = determineApplicableLaws(formData);
        displayApplicableLaws(applicableLaws);
    } else {
        const lawsContainer = document.getElementById('applicableLawsContainer');
        if (lawsContainer) {
            lawsContainer.style.display = 'none';
        }
    }
}

async function predictHarassment(description) {
    try {
        const response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                description: description
            })
        });
        
        if (!response.ok) {
            throw new Error('Prediction API request failed');
        }        
        const predictionData = await response.json();
        return {
            offenseLabel: predictionData.offense.label,
            offenseConfidence: predictionData.offense.confidence,
            severityLabel: predictionData.severity.label,
            severityConfidence: predictionData.severity.confidence
        };
    } catch (error) {
        console.error('Error calling prediction API:', error);
        return null;
    }
}

async function submitReport() {
    const token = getAuthToken();
    if (!token) {
        toast.error('Not authenticated', 'Please log in to submit a report.');
        window.location.href = '/login.html';
        return;
    }
    
    const formData = collectFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    const { applicableLaws } = determineApplicableLaws(formData);
    formData.applicableLaws = applicableLaws;
    
    // Add loading indicator for prediction
    const submitBtn = document.getElementById('submitReportBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    
    submitBtn.disabled = true;
    saveDraftBtn.disabled = true;
    const originalSubmitHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing report...';
    
    try {
        // Call prediction API first
        const predictionResult = await predictHarassment(formData.complainantStory);
        
        if (predictionResult) {
            formData.predictedOffense = predictionResult.offenseLabel;
            formData.predictedOffenseConfidence = predictionResult.offenseConfidence;
            formData.predictedSeverity = predictionResult.severityLabel;
            formData.predictedSeverityConfidence = predictionResult.severityConfidence;
        } else {
            // Set default values if prediction fails
            formData.predictedOffense = 'Not Available';
            formData.predictedOffenseConfidence = 0;
            formData.predictedSeverity = 'Not Available';
            formData.predictedSeverityConfidence = 0;
            toast.warning('Prediction service unavailable', 'Continuing with report submission without AI analysis.');
        }
        
        // Update button text for actual submission
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        const response = await fetch('https://safespace-back.onrender.com/api/v1/user/report', {
        // const response = await fetch('http://localhost:3000/api/v1/user/report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            toast.success('Report submitted!', 'Your report has been successfully filed.');
            document.getElementById('reportForm').reset();
            document.getElementById('confirmAccuracy').checked = false;
            document.getElementById('confirmConfidentiality').checked = false;
            
            const radioGroups = ['victimConstituent', 'complainedConstituent', 'complainedInsideCampus'];
            radioGroups.forEach(group => {
                const radios = document.querySelectorAll(`input[name="${group}"]`);
                radios.forEach(radio => radio.checked = false);
            });
            
            const lawsContainer = document.getElementById('applicableLawsContainer');
            if (lawsContainer) {
                lawsContainer.style.display = 'none';
            }
        } else {
            let errorMsg = data.message || 'Failed to submit report. Please try again.';
            toast.error('Submission failed', errorMsg);
        }
    } catch (error) {
        console.error('Report submission error:', error);
        toast.error('Connection error', 'Unable to connect to the server. Please check your connection.');
    } finally {
        submitBtn.disabled = false;
        saveDraftBtn.disabled = false;
        submitBtn.innerHTML = originalSubmitHTML;
    }
}

function saveDraft() {
    const formData = collectFormData();
    localStorage.setItem('reportDraft', JSON.stringify(formData));
    toast.info('Draft saved', 'Your report has been saved as a draft.');
}

function loadDraft() {
    const draft = localStorage.getItem('reportDraft');
    if (draft) {
        const formData = JSON.parse(draft);
        
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'radio') {
                    const radio = document.querySelector(`input[name="${key}"][value="${formData[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    element.value = formData[key] || '';
                }
            }
        });
        
        // Explicitly set incident date/time (already covered by the loop if IDs match)
        // But ensure they are set:
        if (document.getElementById('incidentDate') && formData.incidentDate) {
            document.getElementById('incidentDate').value = formData.incidentDate;
        }
        if (document.getElementById('incidentTime') && formData.incidentTime) {
            document.getElementById('incidentTime').value = formData.incidentTime;
        }
        
        updateApplicableLaws();
        toast.info('Draft loaded', 'Your saved draft has been loaded.');
    }
}

document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitReport();
});

document.getElementById('saveDraftBtn').addEventListener('click', () => {
    saveDraft();
});

document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
});

document.getElementById('mobileLogoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
});

document.getElementById('whereDidYouHearAboutUs').addEventListener('change', (e) => {
    const otherInput = document.getElementById('otherWhereDidYouHearAboutUs');
    if (e.target.value === 'Others:') {
        otherInput.parentElement.style.display = 'block';
    } else {
        otherInput.parentElement.style.display = 'none';
    }
});

document.getElementById('classification').addEventListener('change', () => {
    updateComplainedClassificationOptions();
    updateRelationshipOptions();
    updateApplicableLaws();
});

document.querySelectorAll('input[name="victimConstituent"], input[name="complainedConstituent"]').forEach(radio => {
    radio.addEventListener('change', () => {
        updateApplicableLaws();
    });
});

document.getElementById('relationshipType').addEventListener('change', () => {
    updateApplicableLaws();
});

document.getElementById('complainedClassification').addEventListener('change', () => {
    updateApplicableLaws();
});

if (checkAuth()) {
    updateUserInfo();
    updateComplainedClassificationOptions();
    updateRelationshipOptions();
    loadDraft();
}