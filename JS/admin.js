/* document.getElementById("session-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form refresh

  // 1️⃣ Grab input values using their IDs
  const mentorName = document.getElementById("mentorName").value.trim();
  const sessionDate = document.getElementById("sessionDate").value;
  const sessionType = document.getElementById("sessionType").value;
  const duration = parseInt(document.getElementById("duration").value);
  const rate = parseInt(document.getElementById("rate").value);

  // 2️⃣ Calculate total payout
  const total = ((duration / 60) * rate).toFixed(2);

  // 3️⃣ Generate a readable unique session ID
  const dateObj = new Date(sessionDate);
  const dateStr = dateObj.toISOString().split("T")[0].replace(/-/g, "");
  const timeStr = dateObj.toTimeString().split(" ")[0].replace(/:/g, "");
  const sessionId = `MENTOR_${mentorName}_${dateStr}_${timeStr}`;

  // 4️⃣ Create session data object
  const sessionData = {
    sessionId,         // Readable ID
    mentorName,        // Name of mentor
    sessionDate,       // Datetime of session
    sessionType,       // Live/Evaluation/Recorded
    duration,          // in minutes
    rate,              // per hour ₹
    total,             // ₹
    status: "Pending"  // Default status
  };

  // 5️⃣ Save the data in Firebase Realtime Database
  firebase.database().ref("sessions").push(sessionData)
    .then(() => {
      alert(`✅ Session added with ID: ${sessionId}`);
      document.getElementById("session-form").reset(); // Clear form
    })
    .catch((error) => {
      console.error("❌ Error saving session:", error);
      alert("Failed to save session. Try again.");
    });
});
 */



document.getElementById("session-form").addEventListener("submit", function (e) {

  e.preventDefault();

  const mentorName = document.getElementById("mentorName").value.trim();
  const sessionDate = document.getElementById("sessionDate").value;
  const sessionType = document.getElementById("sessionType").value;
  const duration = parseInt(document.getElementById("duration").value);
  const rate = parseInt(document.getElementById("rate").value); 

  const total = ((duration / 60) * rate).toFixed(2);

  const mentoersessiondata = {
    mentorName,
    sessionDate,
    sessionType,
    duration,
    rate,
    total
  }

fetch("https://mentropay-38347-default-rtdb.firebaseio.com/mentorSessionData.json", {
  method: "POST",
  body: JSON.stringify(mentoersessiondata),
})
.then((response) => response.json())
.then((data) => {
  console.log(data);
  alert("Session added successfully");  
  document.getElementById("session-form").reset();
  
} ) 
.catch((error) => {
  console.error("Error adding session:", error);
})  

  ;   




});

