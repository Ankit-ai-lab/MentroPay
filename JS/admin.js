

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

