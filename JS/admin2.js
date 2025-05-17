document.addEventListener("DOMContentLoaded", fetchAndDisplaySessions);

document.getElementById("session-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const mentorName = document.getElementById("mentorName").value.trim();
  const sessionDate = document.getElementById("sessionDate").value;
  const sessionType = document.getElementById("sessionType").value;
  const duration = parseInt(document.getElementById("duration").value);
  const rate = parseInt(document.getElementById("rate").value);

  const total = ((duration / 60) * rate).toFixed(2);

  const sessionData = {
    mentorName,
    sessionDate,
    sessionType,
    duration,
    rate,
    total
  };

  fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json", {
    method: "POST",
    body: JSON.stringify(sessionData),
  })
    .then(res => res.json())
    .then(() => {
      alert("Session added");
      document.getElementById("session-form").reset();
      fetchAndDisplaySessions();
    });
});


// Display Sessions   


function fetchAndDisplaySessions(filteredData = null) {
  fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json")
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("sessionTableBody");
      const totalDisplay = document.getElementById("totalPayout");
      tbody.innerHTML = "";
      let totalPayout = 0;

      Object.values(data || {}).forEach(session => {
        if (filteredData && !filteredData.includes(session)) return;

        const row = `<tr>
          <td>${session.mentorName}</td>
          <td>${session.sessionDate}</td>
          <td>${session.sessionType}</td>
          <td>${session.duration}</td>
          <td>${session.rate}</td>
          <td>${session.total}</td>
        </tr>`;
        totalPayout += parseFloat(session.total);
        tbody.innerHTML += row;
      });

      totalDisplay.textContent = totalPayout.toFixed(2);
    });
}

// Filtering logic
window.filterSessions = function () {
  const days = document.getElementById("filterRange").value;
  let start, end;

  if (days === "custom") {
    start = new Date(document.getElementById("startDate").value);
    end = new Date(document.getElementById("endDate").value);
  } else {
    end = new Date();
    start = new Date();
    start.setDate(end.getDate() - parseInt(days));
  }

  fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json")
    .then(res => res.json())
    .then(data => {
      const filtered = Object.values(data || {}).filter(item => {
        const sessionDate = new Date(item.sessionDate);
        return sessionDate >= start && sessionDate <= end;
      });

      fetchAndDisplaySessions(filtered);
    });
};

// Show/hide date fields
document.getElementById("filterRange").addEventListener("change", (e) => {
  const show = e.target.value === "custom";
  document.getElementById("startDate").style.display = show ? "inline" : "none";
  document.getElementById("endDate").style.display = show ? "inline" : "none";
});
