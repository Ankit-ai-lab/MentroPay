import { auth, db } from "./firebase-init.js";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

// Get current mentor's data
let currentMentorName = '';

// Auth state observer
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Get mentor's name from database
    const mentorRef = ref(db, `mentor/${user.uid}`);
    const snapshot = await get(mentorRef);
    if (snapshot.exists()) {
      const mentorData = snapshot.val();
      currentMentorName = mentorData.fullName;
      document.querySelector('.profile-summary h3').textContent = `Hi, ${mentorData.fullName}!`;
      loadMentorSessions();
    }
  } else {
    window.location.href = '/src/login.html';
  }
});

// Load mentor sessions
function loadMentorSessions() {
  const sessionsRef = ref(db, 'mentorSessionData');
  const sessionsQuery = query(
    sessionsRef,
    orderByChild('mentorName'),
    equalTo(currentMentorName)
  );

  onValue(sessionsQuery, (snapshot) => {
    const sessionsTable = document.getElementById('mentor-sessions-table').getElementsByTagName('tbody')[0];
    sessionsTable.innerHTML = '';
    let totalSessions = 0;
    let pendingAmount = 0;
    let paidAmount = 0;

    if (snapshot.exists()) {
      const sessions = [];
      snapshot.forEach((childSnapshot) => {
        sessions.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      // Sort sessions by date (most recent first)
      sessions.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

      sessions.forEach(session => {
        const row = document.createElement('tr');
        const date = new Date(session.sessionDate).toLocaleDateString();
        const total = parseFloat(session.total);
        
        totalSessions++;
        if (session.status === 'Pending') {
          pendingAmount += total;
        } else {
          paidAmount += total;
        }

        row.innerHTML = `
          <td>${date}</td>
          <td>${session.sessionType}</td>
          <td>${session.duration}</td>
          <td>₹${session.rate}</td>
          <td>₹${total}</td>
          <td><span class="status ${session.status?.toLowerCase() || 'pending'}">${session.status || 'Pending'}</span></td>
        `;
        sessionsTable.appendChild(row);
      });
    }

    // Update summary cards
    document.querySelector('.summary-cards .card:nth-child(1) strong').textContent = totalSessions;
    document.querySelector('.summary-cards .card:nth-child(2) strong').textContent = `₹${pendingAmount}`;
    document.querySelector('.summary-cards .card:nth-child(3) strong').textContent = `₹${paidAmount}`;
  });
}

// Handle session filter changes
document.getElementById('session-filter')?.addEventListener('change', (e) => {
  loadMentorSessions(e.target.value);
});

// Handle logout
document.getElementById('logout')?.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = '/src/login.html';
  });
});

// Handle sidebar toggle
window.toggleSidebar = function() {
  document.getElementById('sidebar-menu').classList.toggle('hidden');
};
