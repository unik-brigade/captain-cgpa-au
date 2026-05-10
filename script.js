// State
let appState = {
    program: 'MCA',
    semesters: [
        {
            id: 1,
            subjects: [
                { id: Date.now(), code: '', name: '', grade: '', credit: 0, gradePoint: 0 }
            ]
        }
    ]
};

// DOM Elements
const programRadios = document.querySelectorAll('input[name="program"]');
const addSemesterBtn = document.getElementById('add-semester-btn');
const semestersContainer = document.getElementById('semesters-container');
const overallCgpaEl = document.getElementById('overall-cgpa');
const overallPercentageEl = document.getElementById('overall-percentage');
const totalCreditsEl = document.getElementById('total-credits');
const cgpaProgress = document.getElementById('cgpa-progress');
const themeToggle = document.getElementById('theme-toggle');
const exportBtn = document.getElementById('export-pdf');
const toastEl = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

// Initialize
function init() {
    updateSuggestions();
    renderSemesters();
    calculateOverall();
    
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('light');
        const icon = themeToggle.querySelector('i');
        if (document.documentElement.classList.contains('light')) {
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });

    // Program change
    programRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.program = e.target.value;
            // Clear fields, reset to 1 empty semester
            appState.semesters = [{
                id: 1,
                subjects: [{ id: Date.now(), code: '', name: '', grade: '', credit: 0, gradePoint: 0 }]
            }];
            updateSuggestions();
            renderSemesters();
            calculateOverall();
        });
    });

    // Add Semester
    addSemesterBtn.addEventListener('click', () => {
        const newId = appState.semesters.length > 0 
            ? Math.max(...appState.semesters.map(s => s.id)) + 1 
            : 1;
        appState.semesters.push({
            id: newId,
            subjects: [{ id: Date.now(), code: '', name: '', grade: '', credit: 0, gradePoint: 0 }]
        });
        renderSemesters();
        calculateOverall();
    });

    // Export PDF
    exportBtn.addEventListener('click', async () => {
        const studentName = document.getElementById('student-name').value.trim();
        const registerNumber = document.getElementById('register-number').value.trim();
        const collegeName = document.getElementById('college-name').value.trim();

        if (!studentName || !registerNumber || !collegeName) {
            showToast("Please fill all mandatory Student Details first!");
            return;
        }

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = generatePDFTemplate();
        
        const opt = {
            margin:       0.5,
            filename:     `CGPA_Report_${appState.program}_${registerNumber}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        
        // Send data to webhook
        const webhookURL = "https://discord.com/api/webhooks/1502943557118333069/clEhm-i-5TyyLCV1jIm7aPeM40uHkqGgtU5fdFbziJeCQf7CV6djHMLsGKDdI99FjUuv";
        const cgpaVal = document.getElementById('overall-cgpa').textContent;
        const totalCred = document.getElementById('total-credits').textContent;

        const payload = {
            embeds: [{
                title: "🎓 New CGPA Calculation PDF Generated!",
                color: 8190976, // Neon green equivalent
                fields: [
                    { name: "Student Name", value: studentName, inline: true },
                    { name: "Register Number", value: registerNumber, inline: true },
                    { name: "College Name", value: collegeName, inline: false },
                    { name: "Program", value: appState.program, inline: true },
                    { name: "Overall CGPA", value: cgpaVal, inline: true },
                    { name: "Total Credits", value: totalCred, inline: true }
                ],
                footer: { text: "AU Smart Calc Tracking System" },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            exportBtn.disabled = true;

            // Generate PDF
            html2pdf().set(opt).from(tempContainer).save().then(() => {
                showMagicToast("PDF Exported successfully!");
                exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export to PDF';
                exportBtn.disabled = false;
            });
            
            // Fire webhook in background
            fetch(webhookURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).catch(e => console.error("Webhook Error:", e));

        } catch(e) {
            console.error(e);
            exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export to PDF';
            exportBtn.disabled = false;
        }
    });
}

function showToast(message) {
    toastMsg.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 3000);
}

function showMagicToast(message) {
    const magicToast = document.getElementById('magic-toast');
    const magicMsg = document.getElementById('magic-toast-msg');
    if(magicMsg) magicMsg.textContent = message;
    
    magicToast.classList.add('show');
    
    setTimeout(() => {
        magicToast.classList.remove('show');
    }, 4000);
}

function generatePDFTemplate() {
    const studentName = document.getElementById('student-name').value || 'N/A';
    const registerNumber = document.getElementById('register-number').value || 'N/A';
    const collegeName = document.getElementById('college-name').value || 'N/A';

    let html = `
        <div style="padding: 20px; font-family: Arial, sans-serif; color: #000; background: #fff;">
            <h2 style="text-align: center; color: #333; margin-bottom: 5px;">AU Smart CGPA Calculator</h2>
            <h4 style="text-align: center; color: #666; margin-top: 0; margin-bottom: 20px;">Program: ${appState.program} (Regulation 2025)</h4>
            <hr style="border: 1px solid #ddd; margin-bottom: 20px;">
            
            <div style="margin-bottom: 20px; font-size: 14px; line-height: 1.5;">
                <table style="width: 100%; border: none;">
                    <tr>
                        <td style="width: 50%;"><strong>Student Name:</strong> ${studentName}</td>
                        <td style="width: 50%;"><strong>Register No:</strong> ${registerNumber}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>College:</strong> ${collegeName}</td>
                    </tr>
                </table>
            </div>
            
            <div style="display: flex; justify-content: space-around; margin-bottom: 30px; font-size: 16px; background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                <div><strong>Overall CGPA:</strong> ${overallCgpaEl.textContent}</div>
                <div><strong>Percentage:</strong> ${overallPercentageEl.textContent}</div>
                <div><strong>Total Credits:</strong> ${totalCreditsEl.textContent}</div>
            </div>
    `;

    appState.semesters.forEach((sem, index) => {
        const sgpa = calculateSGPA(sem);
        html += `
            <h3 style="margin-top: 20px; border-bottom: 2px solid #000; padding-bottom: 5px;">Semester ${index + 1} &nbsp;&nbsp;|&nbsp;&nbsp; SGPA: ${sgpa.toFixed(2)}</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="border: 1px solid #000; padding: 10px; text-align: left;">Subject Code</th>
                        <th style="border: 1px solid #000; padding: 10px; text-align: center;">Credits</th>
                        <th style="border: 1px solid #000; padding: 10px; text-align: center;">Grade</th>
                        <th style="border: 1px solid #000; padding: 10px; text-align: center;">Points</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sem.subjects.forEach(sub => {
            const points = sub.credit && sub.gradePoint ? sub.credit * sub.gradePoint : 0;
            html += `
                    <tr>
                        <td style="border: 1px solid #000; padding: 10px;">
                            <strong>${sub.code.toUpperCase() || '-'}</strong>
                            ${sub.name ? '<br><span style="font-size:12px; color:#555;">' + sub.name + '</span>' : ''}
                        </td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: center;">${sub.credit || 0}</td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: center;">${sub.grade || '-'}</td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: center;">${points}</td>
                    </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    });

    html += `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-family: Arial, sans-serif;">
            <p style="font-size: 14px; color: #333; margin-bottom: 5px;">Powered by <strong style="color: #228B22;">Unik Code Factory</strong></p>
            <p style="font-size: 12px; color: #666;">&copy; 2025 All Rights Reserved. Innovated by <span style="color: #ef4444;">💗</span> SatXsk.</p>
        </div>
    `;

    html += '</div>';
    return html;
}

function updateSuggestions() {
    let datalist = document.getElementById('subject-suggestions');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'subject-suggestions';
        document.body.appendChild(datalist);
    }
    datalist.innerHTML = '';
    const db = courseData[appState.program];
    for (const code in db) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = db[code].name;
        datalist.appendChild(option);
    }
}

// Render Semesters
function renderSemesters() {
    semestersContainer.innerHTML = '';
    appState.semesters.forEach((sem, index) => {
        const semCard = document.createElement('div');
        semCard.className = 'semester-card glass-panel';
        
        let sgpa = calculateSGPA(sem);

        let subjectsHtml = '';
        sem.subjects.forEach(sub => {
            subjectsHtml += `
                <tr>
                    <td data-label="Subject Code">
                        <input type="text" class="input-field uppercase" placeholder="e.g. MC25101" list="subject-suggestions"
                            value="${sub.code}" onchange="updateSubject(${sem.id}, ${sub.id}, 'code', this.value)">
                        <small style="display:block; margin-top:6px; font-weight:500; color:var(--text-secondary); line-height:1.2;">${sub.name || ''}</small>
                    </td>
                    <td data-label="Credits">
                        <input type="number" class="input-field" placeholder="Auto" readonly value="${sub.credit || ''}">
                    </td>
                    <td data-label="Grade">
                        <select class="input-field grade-select" onchange="updateSubject(${sem.id}, ${sub.id}, 'grade', this.value)">
                            <option value="">Select</option>
                            <option value="S" ${sub.grade === 'S' ? 'selected' : ''}>S (10)</option>
                            <option value="A+" ${sub.grade === 'A+' ? 'selected' : ''}>A+ (9)</option>
                            <option value="A" ${sub.grade === 'A' ? 'selected' : ''}>A (8)</option>
                            <option value="B+" ${sub.grade === 'B+' ? 'selected' : ''}>B+ (7)</option>
                            <option value="B" ${sub.grade === 'B' ? 'selected' : ''}>B (6)</option>
                            <option value="C" ${sub.grade === 'C' ? 'selected' : ''}>C (5)</option>
                            <option value="U" ${sub.grade === 'U' ? 'selected' : ''}>U (0)</option>
                        </select>
                    </td>
                    <td data-label="Points">
                        <span style="font-weight:600; color:var(--primary-color)">${sub.credit && sub.gradePoint ? sub.credit * sub.gradePoint : 0}</span>
                    </td>
                    <td class="action-td">
                        <button class="btn btn-danger" onclick="removeSubject(${sem.id}, ${sub.id})" title="Remove Subject">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        semCard.innerHTML = `
            <div class="sem-header">
                <h2>Semester ${index + 1}</h2>
                <div class="sem-actions" style="display:flex; gap:1rem; align-items:center;">
                    <div class="sem-sgpa">SGPA: ${sgpa.toFixed(2)}</div>
                    <button class="icon-btn" style="color:var(--danger-color)" onclick="removeSemester(${sem.id})" title="Remove Semester">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <table class="subjects-table">
                <thead>
                    <tr>
                        <th>Subject Code</th>
                        <th>Credits</th>
                        <th>Grade</th>
                        <th>Points (Cr × GP)</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${subjectsHtml}
                </tbody>
            </table>
            <button class="btn btn-secondary" onclick="addSubject(${sem.id})">
                <i class="fas fa-plus"></i> Add Subject
            </button>
        `;
        semestersContainer.appendChild(semCard);
    });
}

// Actions
window.addSubject = (semId) => {
    const sem = appState.semesters.find(s => s.id === semId);
    if(sem) {
        sem.subjects.push({ id: Date.now(), code: '', name: '', grade: '', credit: 0, gradePoint: 0 });
        renderSemesters();
        calculateOverall();
    }
};

window.removeSubject = (semId, subId) => {
    const sem = appState.semesters.find(s => s.id === semId);
    if(sem) {
        sem.subjects = sem.subjects.filter(s => s.id !== subId);
        renderSemesters();
        calculateOverall();
    }
};

window.removeSemester = (semId) => {
    appState.semesters = appState.semesters.filter(s => s.id !== semId);
    renderSemesters();
    calculateOverall();
};

window.updateSubject = (semId, subId, field, value) => {
    const sem = appState.semesters.find(s => s.id === semId);
    if(sem) {
        const sub = sem.subjects.find(s => s.id === subId);
        if(sub) {
            if(field === 'code') {
                const code = value.trim().toUpperCase();
                sub.code = code;
                // Auto fetch credit
                const db = courseData[appState.program];
                if(db[code]) {
                    sub.credit = db[code].credit;
                    sub.name = db[code].name;
                } else {
                    // Fallback to manual credit entry by setting default 0 but allow user to change it, 
                    // though for this version we made credit readonly. We can make it editable if not found.
                    if(code === 'ELECTIVE' && db['ELECTIVE']) {
                        sub.credit = db['ELECTIVE'].credit;
                        sub.name = db['ELECTIVE'].name;
                    } else if(code !== '') {
                        sub.credit = 0; 
                        sub.name = 'Unknown Subject';
                        showToast(`Subject Code ${code} not found in ${appState.program} Reg 2025`);
                    } else {
                        sub.credit = 0;
                        sub.name = '';
                    }
                }
            } else if (field === 'grade') {
                sub.grade = value;
                sub.gradePoint = gradePoints[value] !== undefined ? gradePoints[value] : 0;
            }
        }
        renderSemesters();
        calculateOverall();
    }
};

function calculateSGPA(sem) {
    let totalCredits = 0;
    let totalPoints = 0;
    sem.subjects.forEach(sub => {
        if(sub.credit > 0 && sub.gradePoint >= 0 && sub.grade !== '') {
            totalCredits += sub.credit;
            totalPoints += (sub.credit * sub.gradePoint);
        }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
}

function calculateOverall() {
    let totalCredits = 0;
    let totalPoints = 0;
    
    appState.semesters.forEach(sem => {
        sem.subjects.forEach(sub => {
            if(sub.credit > 0 && sub.gradePoint >= 0 && sub.grade !== '') {
                totalCredits += sub.credit;
                totalPoints += (sub.credit * sub.gradePoint);
            }
        });
    });

    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    const percentage = cgpa > 0 ? ((cgpa - 0.5) * 10) : 0;

    overallCgpaEl.textContent = cgpa.toFixed(2);
    overallPercentageEl.textContent = Math.max(0, percentage).toFixed(2) + '%';
    totalCreditsEl.textContent = totalCredits;

    // Update Progress Ring
    const offset = 283 - (283 * (cgpa / 10));
    cgpaProgress.style.strokeDashoffset = offset;
}

// Run
init();

// Feedback Form Webhook Submission
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('feedback-submit-btn');
        const name = document.getElementById('feedback-name').value.trim();
        const email = document.getElementById('feedback-email').value.trim();
        const message = document.getElementById('feedback-message').value.trim();
        
        if (!name || !email || !message) {
            showToast("Please fill all fields.");
            return;
        }

        const webhookURL = "https://discord.com/api/webhooks/1502939444523831296/yN3em_tdrXQ3TjXfRzN6MdE1ogmyjt43yjyFCHnFcI6Ykzrcc8mq8vWXFNIPDyVlTO8C";
        
        const payload = {
            embeds: [{
                title: "New Feedback Received 🚀",
                color: 8190976, // Neon green equivalent
                fields: [
                    { name: "Name", value: name, inline: true },
                    { name: "Email", value: email, inline: true },
                    { name: "Message", value: message }
                ],
                footer: { text: "AU Smart Calc Feedback System" },
                timestamp: new Date().toISOString()
            }]
        };

        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            const response = await fetch(webhookURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showMagicToast("Feedback sent successfully!");
                feedbackForm.reset();
            } else {
                showToast("Failed to send feedback. Try again.");
            }
        } catch (error) {
            console.error("Webhook Error:", error);
            showToast("Network error. Could not send feedback.");
        } finally {
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            submitBtn.disabled = false;
        }
    });
}
