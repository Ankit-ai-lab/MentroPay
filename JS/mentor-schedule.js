import { auth, db } from "./firebase-init.js";
import {
    ref,
    query,
    orderByChild,
    equalTo,
    onValue,
    get,
    update
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Store mentor data globally
let currentMentor = {
    uid: '',
    fullName: '',
    email: ''
};

// Initialize the page
function initializePage() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadMentorData(user.uid);
            loadMentorSessions();
            setupEventListeners();
        } else {
            window.location.href = '/src/login.html';
        }
    });
}

// Load mentor data
async function loadMentorData(uid) {
    const mentorRef = ref(db, `mentor/${uid}`);
    const snapshot = await get(mentorRef);
    
    if (snapshot.exists()) {
        const mentorData = snapshot.val();
        currentMentor = {
            uid: uid,
            fullName: mentorData.fullName,
            email: mentorData.email
        };
        
        // Update UI with mentor info
        document.getElementById('mentor-name').textContent = `Name: ${mentorData.fullName}`;
        document.getElementById('mentor-id').textContent = `Mentor ID: ${uid}`;
    }
}

// Load mentor sessions with filters
function loadMentorSessions() {
    const sessionsRef = ref(db, 'mentorSessionData');
    
    // Create two queries - one for UID and one for name
    const uidQuery = query(
        sessionsRef,
        orderByChild('mentorUid'),
        equalTo(currentMentor.uid)
    );

    const nameQuery = query(
        sessionsRef,
        orderByChild('mentorName'),
        equalTo(currentMentor.fullName)
    );

    // Listen to both queries
    onValue(uidQuery, (uidSnapshot) => {
        onValue(nameQuery, (nameSnapshot) => {
            const sessionsTable = document.getElementById('mentor-sessions-table').getElementsByTagName('tbody')[0];
            sessionsTable.innerHTML = '';

            const sessions = [];

            // Combine sessions from both queries
            if (uidSnapshot.exists()) {
                uidSnapshot.forEach((childSnapshot) => {
                    sessions.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
            }

            if (nameSnapshot.exists()) {
                nameSnapshot.forEach((childSnapshot) => {
                    // Check if session is already added (avoid duplicates)
                    if (!sessions.some(s => s.id === childSnapshot.key)) {
                        sessions.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val()
                        });
                    }
                });
            }

            // Apply filters
            const statusFilter = document.getElementById('status-filter').value;
            const dateFilter = document.getElementById('date-filter').value;
            
            const filteredSessions = filterSessions(sessions, statusFilter, dateFilter);
            
            // Sort sessions by date (most recent first)
            filteredSessions.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

            // Display sessions
            filteredSessions.forEach(session => {
                const row = document.createElement('tr');
                const sessionDate = new Date(session.sessionDate);
                const total = parseFloat(session.total);

                row.innerHTML = `
                    <td>${sessionDate.toLocaleString()}</td>
                    <td>${session.sessionType}</td>
                    <td>${session.duration}</td>
                    <td>₹${session.rate}</td>
                    <td>₹${total}</td>
                    <td><span class="status ${session.status?.toLowerCase() || 'pending'}">${session.status || 'Pending'}</span></td>
                    <td>
                        ${getActionButtons(session)}
                    </td>
                `;
                sessionsTable.appendChild(row);
            });

            // Update summary in mentor dashboard
            updateDashboardSummary(sessions);
        });
    });
}

// Filter sessions based on status and date
function filterSessions(sessions, statusFilter, dateFilter) {
    const now = new Date();
    
    return sessions.filter(session => {
        const sessionDate = new Date(session.sessionDate);
        const statusMatch = statusFilter === 'all' || session.status?.toLowerCase() === statusFilter;
        
        let dateMatch = true;
        if (dateFilter === 'upcoming') {
            dateMatch = sessionDate > now;
        } else if (dateFilter === 'past') {
            dateMatch = sessionDate < now;
        }
        
        return statusMatch && dateMatch;
    });
}

// Get action buttons based on session status
function getActionButtons(session) {
    const sessionDate = new Date(session.sessionDate);
    const now = new Date();
    
    if (session.status === 'Completed' || session.status === 'Cancelled') {
        return `<button disabled>No actions available</button>`;
    }
    
    if (sessionDate < now) {
        return `
            <button onclick="markSessionComplete('${session.id}')">Mark Complete</button>
        `;
    }
    
    return `
        <button onclick="cancelSession('${session.id}')" class="cancel-btn">Cancel</button>
    `;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('status-filter').addEventListener('change', loadMentorSessions);
    document.getElementById('date-filter').addEventListener('change', loadMentorSessions);
}

// Mark session as complete
window.markSessionComplete = async function(sessionId) {
    try {
        const sessionRef = ref(db, `mentorSessionData/${sessionId}`);
        await update(sessionRef, {
            status: 'Completed'
        });
        alert('Session marked as complete!');
    } catch (error) {
        console.error('Error updating session:', error);
        alert('Failed to update session status');
    }
};

// Cancel session
window.cancelSession = async function(sessionId) {
    if (confirm('Are you sure you want to cancel this session?')) {
        try {
            const sessionRef = ref(db, `mentorSessionData/${sessionId}`);
            await update(sessionRef, {
                status: 'Cancelled'
            });
            alert('Session cancelled successfully!');
        } catch (error) {
            console.error('Error cancelling session:', error);
            alert('Failed to cancel session');
        }
    }
};

// Update dashboard summary
function updateDashboardSummary(sessions) {
    let totalSessions = sessions.length;
    let pendingAmount = 0;
    let paidAmount = 0;

    sessions.forEach(session => {
        const total = parseFloat(session.total);
        if (session.status === 'Pending') {
            pendingAmount += total;
        } else if (session.status === 'Completed') {
            paidAmount += total;
        }
    });

    // Update summary cards if they exist
    const totalSessionsElement = document.querySelector('.summary-cards .card:nth-child(1) strong');
    const pendingAmountElement = document.querySelector('.summary-cards .card:nth-child(2) strong');
    const paidAmountElement = document.querySelector('.summary-cards .card:nth-child(3) strong');

    if (totalSessionsElement) totalSessionsElement.textContent = totalSessions;
    if (pendingAmountElement) pendingAmountElement.textContent = `₹${pendingAmount.toFixed(2)}`;
    if (paidAmountElement) paidAmountElement.textContent = `₹${paidAmount.toFixed(2)}`;
}

// Initialize the page
initializePage(); 