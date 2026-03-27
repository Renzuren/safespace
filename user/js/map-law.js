function determineApplicableLaws(data) {
    const {
        classification,
        victimConstituent,
        complainedClassification,
        complainedConstituent,
        relationshipType
    } = data;
    
    let applicableLaws = [];
    
    if (classification === 'Student') {
        if (victimConstituent === 'Yes' || victimConstituent === 'No') {
          if (complainedClassification === 'Student'
            || complainedClassification === 'Professor'
            || complainedClassification === 'Instructor'
            || complainedClassification === 'Teacher'
            || complainedClassification === `Gov't Employee`
            || complainedClassification === 'Stranger'
          ) {
            if (complainedConstituent === 'Yes') {
              if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
                applicableLaws = ['RA 11313', 'OASH Code for Students'];
              } else if (relationshipType === 'intimate') {
                applicableLaws = ['RA 11313', 'RA 9262 (If victim is a woman/child)', 'OASH Code for Student'];
              } else if (relationshipType === 'authority') {
                applicableLaws = ['RA 11313', 'RACCS', 'RA 7877', 'OASH Code for Employee'];
              } else if (relationshipType === 'stranger') {
                applicableLaws = ['RA 11313', 'If UP student, OASH Code for Student', 'If UP Employee, OASH Code for Employee'];
              }
            } else if (complainedConstituent === 'No') {
              if (relationshipType === 'classmate' || relationshipType === 'orgmate') {
                applicableLaws = ['RA 11313', 'Contact details of SSO'];
              } else if (relationshipType === 'intimate') {
                applicableLaws = ['RA 11313', 'RA 9262 (If victim is a woman/child)', 'Contact details of SSO'];
              } else if (relationshipType === 'authority') {
                applicableLaws = ['RA 11313', 'RACCS', 'RA 7877', 'Contact details of SSO'];
              } else if (relationshipType === 'stranger') {
                applicableLaws = ['RA 11313', 'Contact details of SSO'];
              }
            }
          } else {
            applicableLaws = ['Invalid complained classification'];
          }
        }
    } else {
        if (victimConstituent === 'Yes' || victimConstituent === 'No') {
          if (complainedClassification === 'Co-worker'
            || complainedClassification === 'Colleague'
            || complainedClassification === `Gov't Employee`
            || complainedClassification === 'Student'
            || complainedClassification === 'Stranger'
          ) {
            if (complainedConstituent === 'Yes') {
              if (relationshipType === 'same-level') {
                applicableLaws = ['RA 11313', 'RACCS', 'OASH Code for Emloyee'];
              } else if (relationshipType === 'authority') {
                applicableLaws = ['RA 11313', 'RACCS', 'RA7877', 'OASH Code for Employee'];
              } else if (relationshipType === 'intimate') {
                applicableLaws = ['RA 11313', 'RA9626 (If victim is a woman/child)', 'RACCS', 'OASH Code for Employee'];
              } else if (relationshipType === 'none') {
                applicableLaws = ['RA 11313', 'OASH Code for Students'];
              } else if (relationshipType === 'stranger') {
                applicableLaws = ['RA11313', 'If UP student, OASH Code for Student', 'If UP employee, OASH Code for Employee'];
              }
            } else if (complainedConstituent === 'No') {
              if (relationshipType === 'same-level') {
                applicableLaws = ['RA 11313', 'RACCS', 'Contact details of SSO'];
              } else if (relationshipType === 'authority') {
                applicableLaws = ['RA 11313', 'RACCS', 'RA7877', 'Contact details of SSO'];
              } else if (relationshipType === 'intimate') {
                applicableLaws = ['RA 11313', 'RA9626 (If victim is a woman/child)', 'RACCS', 'Contact details of SSO'];
              } else if (relationshipType === 'none') {
                applicableLaws = ['RA 11313', 'Contact details of SSO'];
              } else if (relationshipType === 'stranger') {
                applicableLaws = ['RA11313', 'Contact details of SSO'];
              }
            }
          } else {
            applicableLaws = ['Invalid complained classification'];
          }
        }
    }
    
    applicableLaws = [...new Set(applicableLaws)];
    
    return { applicableLaws };
}

function displayApplicableLaws(applicableLaws) {
    let lawsContainer = document.getElementById('applicableLawsContainer');
    
    if (!lawsContainer) {
        lawsContainer = document.createElement('div');
        lawsContainer.id = 'applicableLawsContainer';
        lawsContainer.className = 'mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg';
        
        const relationshipSection = document.getElementById('relationshipType').closest('.grid');
        if (relationshipSection && relationshipSection.parentNode) {
            relationshipSection.parentNode.insertBefore(lawsContainer, relationshipSection.nextSibling);
        }
    }
    
    if (applicableLaws.length > 0) {
        lawsContainer.innerHTML = `
            <div class="flex items-start gap-3">
                <i class="fas fa-gavel text-blue-600 text-xl mt-1"></i>
                <div class="flex-1">
                    <h4 class="font-semibold text-blue-900 mb-2">Applicable Laws & Policies</h4>
                    <div class="space-y-2">
                        <div>
                            <p class="text-sm font-medium text-blue-800 mb-1">Legal Frameworks:</p>
                            <ul class="list-disc list-inside text-sm text-blue-700 space-y-1">
                                ${applicableLaws.map(law => `<li>${law}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lawsContainer.style.display = 'block';
    } else {
        lawsContainer.style.display = 'none';
    }
}