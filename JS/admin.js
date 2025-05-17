document.getElementById("session-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission

  // Step 1: Get all form input values
  const mentorId = document.getElementById("mentorId").value.trim();
  const mentorName = document.getElementById("mentorName").value.trim();
  const sessionDate = document.getElementById("sessionDate").value;
  const sessionType = document.getElementById("sessionType").value;
  const duration = parseInt(document.getElementById("duration").value);
  const rate = parseInt(document.getElementById("rate").value); 
  const createdBy = document.getElementById("createdBy").value.trim();

  // Step 2: Basic validation to check if any field is empty
  if (!mentorId || !mentorName || !sessionDate || !sessionType || !duration || !rate || !createdBy) {
    alert("Please fill in all the fields.");
    return; // Stop form submission
  }

  // Step 3: Calculate total payment
  const total = ((duration / 60) * rate).toFixed(2);

  // Step 4: Create data object to send to Firebase
  const mentorSessionData = {
    mentorId,
    mentorName,
    sessionDate,
    sessionType,
    duration,
    rate,
    total,
    createdBy,
    status: "Pending" // Adding default status
  };

  // Step 5: Send POST request to Firebase Realtime Database
  fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(mentorSessionData),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    alert("Session added successfully");
    
    // Step 6: Reset the form after success
    document.getElementById("session-form").reset();
    
    // Refresh the table
    loadSessionData();
  })
  .catch((error) => {
    console.error("Error adding session:", error);
    alert("Error adding session. Please try again.");
  });
});

// Function to load and display session data
function loadSessionData() {
  const tableBody = document.querySelector("#session-table tbody");
  const totalDisplay = document.querySelector(".total-display");
  let totalPayout = 0;

  fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json")
    .then((response) => response.json())
    .then((data) => {
      tableBody.innerHTML = ""; // Clear existing rows
      
      if (data) {
        Object.entries(data).forEach(([key, session]) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${session.mentorName} (${session.mentorId})</td>
            <td>${session.sessionType}</td>
            <td>${session.duration} mins</td>
            <td>₹${session.rate}/hr</td>
            <td>₹${session.total}</td>
            <td>${session.status || 'Pending'}</td>
          `;
          tableBody.appendChild(row);
          totalPayout += parseFloat(session.total);
        });
      }
      
      totalDisplay.textContent = `Total Payout: ₹${totalPayout.toFixed(2)}`;
    })
    .catch((error) => {
      console.error("Error loading sessions:", error);
      tableBody.innerHTML = "<tr><td colspan='6'>Error loading sessions. Please try again.</td></tr>";
    });
}

// Load session data when page loads
document.addEventListener("DOMContentLoaded", loadSessionData);

// Add filter functionality
document.getElementById("filter").addEventListener("change", function(e) {
  const days = parseInt(e.target.value);
  if (days === 'all') {
    loadSessionData();
    return;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json")
    .then((response) => response.json())
    .then((data) => {
      const filteredData = {};
      Object.entries(data).forEach(([key, session]) => {
        const sessionDate = new Date(session.sessionDate);
        if (sessionDate >= cutoffDate) {
          filteredData[key] = session;
        }
      });
      
      const tableBody = document.querySelector("#session-table tbody");
      tableBody.innerHTML = "";
      let totalPayout = 0;

      Object.entries(filteredData).forEach(([key, session]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${session.mentorName} (${session.mentorId})</td>
          <td>${session.sessionType}</td>
          <td>${session.duration} mins</td>
          <td>₹${session.rate}/hr</td>
          <td>₹${session.total}</td>
          <td>${session.status || 'Pending'}</td>
        `;
        tableBody.appendChild(row);
        totalPayout += parseFloat(session.total);
      });

      document.querySelector(".total-display").textContent = `Total Payout: ₹${totalPayout.toFixed(2)}`;
    });
});
