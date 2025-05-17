import { db } from './firebase-init.js';
import { ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

let currentPage = 1;
const mentorsPerPage = 5;
let allMentors = [];

// Fetch and display mentors
async function fetchAndDisplayMentors() {
    try {
        const [mentorsSnap, sessionsSnap] = await Promise.all([
            get(ref(db, 'mentor')),
            get(ref(db, 'mentorSessionData'))
        ]);

        allMentors = [];
        
        if (mentorsSnap.exists()) {
            mentorsSnap.forEach((mentorSnap) => {
                const mentor = mentorSnap.val();
                let totalEarnings = 0;
                let pendingAmount = 0;
                let sessionCount = 0;

                // Calculate payments
                if (sessionsSnap.exists()) {
                    Object.values(sessionsSnap.val() || {}).forEach(session => {
                        if (session.mentorName === mentor.fullName) {
                            sessionCount++;
                            totalEarnings += parseFloat(session.total || 0);
                            if (!session.isPaid) pendingAmount += parseFloat(session.total || 0);
                        }
                    });
                }

                allMentors.push({ ...mentor, totalEarnings, pendingAmount, sessionCount });
            });
        }
        displayMentors();
    } catch (error) {
        console.error("Error:", error);
    }
}

// Display mentors
function displayMentors(searchTerm = '') {
    const filtered = searchTerm 
        ? allMentors.filter(m => m.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
        : allMentors;

    const start = (currentPage - 1) * mentorsPerPage;
    const mentorsToShow = filtered.slice(start, start + mentorsPerPage);
    
    document.getElementById('mentor-list').innerHTML = mentorsToShow.map(mentor => `
        <div class="mentor-card">
            <h3>${mentor.fullName}</h3>
            <p>Sessions: ${mentor.sessionCount} | Earnings: ₹${mentor.totalEarnings}
               ${mentor.pendingAmount ? `| <span style="color:red">Pending: ₹${mentor.pendingAmount}</span>` : ''}
            </p>
        </div>
    `).join('');

    // Simple pagination
    const pages = Math.ceil(filtered.length / mentorsPerPage);
    document.getElementById('pagination').innerHTML = `
        <button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>←</button>
        <span>Page ${currentPage}/${pages}</span>
        <button onclick="changePage(1)" ${currentPage === pages ? 'disabled' : ''}>→</button>
    `;
}

// Export to CSV
function exportToCSV() {
    const csv = [
        ['Name', 'Sessions', 'Total Earnings', 'Pending Amount'].join(','),
        ...allMentors.map(m => [
            m.fullName,
            m.sessionCount,
            m.totalEarnings,
            m.pendingAmount
        ].join(','))
    ].join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = 'mentors.csv';
    link.click();
}

// Initialize
window.changePage = (delta) => {
    currentPage += delta;
    displayMentors(document.getElementById('mentorSearch')?.value);
};

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayMentors();
    
    // Search handler
    document.getElementById('mentorSearch')?.addEventListener('input', (e) => {
        currentPage = 1;
        displayMentors(e.target.value);
    });

    // Export handler
    document.getElementById('exportButton')?.addEventListener('click', exportToCSV);
});

document.getElementById("session-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const mentorName = document.getElementById("mentorName").value.trim();
  
  // First get the mentor's UID from their name
  const mentorsRef = ref(db, 'mentor');
  const mentorsQuery = query(mentorsRef, orderByChild('fullName'), equalTo(mentorName));
  
  try {
    const mentorSnapshot = await get(mentorsQuery);
    if (!mentorSnapshot.exists()) {
      alert('Mentor not found! Please check the name.');
      return;
    }

    // Get the mentor's UID
    let mentorUid = '';
    mentorSnapshot.forEach((childSnapshot) => {
      mentorUid = childSnapshot.key;
    });

    const sessionDate = document.getElementById("sessionDate").value;
    const sessionType = document.getElementById("sessionType").value;
    const duration = parseInt(document.getElementById("duration").value);
    const rate = parseInt(document.getElementById("rate").value); 
    const total = ((duration / 60) * rate).toFixed(2);

    const mentorSessionData = {
      mentorUid,           // Add mentor's UID
      mentorName,          // Keep mentor's name for easy querying
      sessionDate,
      sessionType,
      duration,
      rate,
      total,
      status: 'Pending',   // Add default status
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    // Add session to mentorSessionData
    const response = await fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json", {
      method: "POST",
      body: JSON.stringify(mentorSessionData),
    });

    if (!response.ok) throw new Error('Failed to add session');

    const data = await response.json();
    console.log('Session added:', data);
    alert("Session added successfully");
    document.getElementById("session-form").reset();

  } catch (error) {
    console.error("Error adding session:", error);
    alert("Failed to add session: " + error.message);
  }
});

