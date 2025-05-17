window.uploadCSV = function () {
    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];
  
    if (!file) return alert("Please select a CSV file");
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const lines = e.target.result.split("\n").slice(1); // skip header
      lines.forEach(line => {
        const [mentorName, sessionDate, sessionType, duration, rate] = line.split(",");
        const total = ((parseInt(duration) / 60) * parseInt(rate)).toFixed(2);
  
        const session = { mentorName, sessionDate, sessionType, duration, rate, total };
  
        fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json", {
          method: "POST",
          body: JSON.stringify(session),
        });
      });
  
      alert("CSV uploaded!");
      setTimeout(fetchAndDisplaySessions, 1000);
    };
  
    reader.readAsText(file);
  };
  