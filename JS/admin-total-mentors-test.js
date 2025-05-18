import { db } from './firebase-init.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Pagination variables
let currentPage = 1;
const mentorsPerPage = 10;
let allMentors = [];

// Function to fetch and display mentor data
async function displayMentorList() {
    try {
        const tbody = document.getElementById('mentorTableBody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';

        // Get data from both mentor paths
        const [mentorsSnap, mentorSnap] = await Promise.all([
            get(ref(db, 'mentors')),
            get(ref(db, 'mentor'))
        ]);

        tbody.innerHTML = '';
        allMentors = []; // Reset mentors array

        // Process mentors with numeric IDs
        if (mentorsSnap.exists()) {
            mentorsSnap.forEach(childSnap => {
                const mentor = childSnap.val();
                allMentors.push({
                    id: mentor.id || childSnap.key,
                    name: mentor["Mentor Name"] || mentor.fullName || "N/A",
                    rate: mentor.ratePerHour || "N/A",
                    expertise: mentor.Type || mentor.role || "Mentor",
                    joinedOn: mentor.Date || formatDate(mentor.createdAt) || "N/A"
                });
            });
        }

        // Process mentors with Firebase auth IDs
        if (mentorSnap.exists()) {
            mentorSnap.forEach(childSnap => {
                const mentor = childSnap.val();
                allMentors.push({
                    id: childSnap.key,
                    name: mentor.fullName || "N/A",
                    rate: mentor.ratePerHour || "N/A",
                    expertise: mentor.role || mentor.Type || "Mentor",
                    joinedOn: formatDate(mentor.createdAt) || "N/A"
                });
            });
        }

        if (allMentors.length > 0) {
            // Sort mentors: numeric IDs first, then Firebase auth IDs
            allMentors.sort((a, b) => {
                const aNum = parseInt(a.id);
                const bNum = parseInt(b.id);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                if (!isNaN(aNum)) return -1;
                if (!isNaN(bNum)) return 1;
                return a.id.localeCompare(b.id);
            });

            displayPage(currentPage);
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No mentors found</td></tr>';
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('mentorTableBody').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: red;">Error loading mentor data</td></tr>';
    }
}

function displayPage(page) {
    const tbody = document.getElementById('mentorTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (page - 1) * mentorsPerPage;
    const endIndex = startIndex + mentorsPerPage;
    const mentorsToShow = allMentors.slice(startIndex, endIndex);

    mentorsToShow.forEach(mentor => {
        const row = document.createElement('tr');
        const rateDisplay = mentor.rate !== "N/A" ? `₹${mentor.rate}/hr` : "N/A";
        
        row.innerHTML = `
            <td>${mentor.id}</td>
            <td>${mentor.name}</td>
            <td>${rateDisplay}</td>
            <td>${mentor.expertise}</td>
            <td>${mentor.joinedOn}</td>
        `;
        tbody.appendChild(row);
    });

    // Add pagination controls
    const totalPages = Math.ceil(allMentors.length / mentorsPerPage);
    const paginationHtml = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 10px;">
                <button onclick="changePage(-1)" ${page === 1 ? 'disabled' : ''}>Previous</button>
                <span style="margin: 0 10px;">Page ${page} of ${totalPages}</span>
                <button onclick="changePage(1)" ${page === totalPages ? 'disabled' : ''}>Next</button>
                <div style="margin-top: 10px;">Total Mentors: ${allMentors.length}</div>
            </td>
        </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', paginationHtml);
}

// Function to change page
window.changePage = function(delta) {
    const totalPages = Math.ceil(allMentors.length / mentorsPerPage);
    const newPage = currentPage + delta;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayPage(currentPage);
    }
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        // Format: YYYY-MM-DD HH:MM AM/PM
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return dateString;
    }
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', displayMentorList);
